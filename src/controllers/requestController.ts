import { Logger } from 'homebridge';
import { OperationMode } from '../models/operationMode';
import { IRequest } from '../models/request';
import { IFireplaceController } from './fireplaceController';

export interface IRequestController {
  isLocked(): boolean;
  unlock(): void;
  lock(): void;
  setAux(on: boolean): void;
  setMode(mode: OperationMode): void;
  setTemperature(temperature: number): void;
  currentRequest(): IRequest | undefined;
}

export class RequestController implements IRequestController{
  private static MAX_RETRIES = 10;
  private busy = false;
  private scheduledRequest?: IRequest;
  private sendTask?: NodeJS.Timer;
  private lockTask?: NodeJS.Timer;
  private retryCount = 0;

  constructor(
    public readonly log: Logger,
    public readonly fireplace: IFireplaceController,
    public locked = false) {

  }

  public isLocked(): boolean {
    return this.locked || this.lockTask !== undefined;
  }

  private isAllowed(): boolean {
    return !this.locked;
  }

  currentRequest() {
    return this.scheduledRequest;
  }

  clearScheduledLock() {
    clearInterval(this.lockTask);
    this.lockTask = undefined;
  }

  lock() {
    this.clearScheduledLock();
    this.log.info('Lock control after 1 minute (makes sure that automations still run through.');
    this.lockTask = setTimeout(() => {
      this.locked = true;
      this.log.info('Locked controls');
    }, 60_000);
  }

  unlock() {
    this.clearScheduledLock();
    this.locked = false;
    this.log.info('Unlocked controls');

  }

  setAux(on: boolean) {
    this.retryCount = 0;
    this.scheduleRequest({auxOn: on});
  }

  setMode(mode: OperationMode) {
    this.retryCount = 0;
    this.scheduleRequest({mode});
  }

  setTemperature(temperature: number) {
    this.retryCount = 0;
    this.scheduleRequest({temperature});
  }

  clearScheduledTask() {
    clearInterval(this.sendTask);
    this.sendTask = undefined;
  }

  private scheduleRequest(request: IRequest) {
    if (this.sendTask) {
      this.clearScheduledTask();
    }

    const mergedRequest = this.scheduledRequest ? {...this.scheduledRequest, ...request} : request;
    this.scheduledRequest = mergedRequest;
    this.sendTask = setTimeout(() => this.sendRequest(mergedRequest), 10_000);
  }

  private async sendRequest(request: IRequest, retry = false) {
    if (!this.busy) {
      this.clearScheduledTask();
    }
    if (!this.isAllowed()) {
      if (!retry) {
        setTimeout(() => this.sendRequest(request, true), 10_000);
        return;
      }

      this.log.info('Parental controls active, action is not allowed!');
      this.scheduledRequest = undefined;
      return;
    }
    this.log.debug(`Request: ${JSON.stringify(request)}`);
    this.busy = true;
    const success = await this.fireplace.request(request);
    if (!success) {
      this.retryCount++;
      if (this.retryCount <= RequestController.MAX_RETRIES) {
        this.log.info(`Retry attempt ${this.retryCount}/${RequestController.MAX_RETRIES}`);
        this.scheduleRequest(request);
      } else {
        this.log.warn(`Max retries (${RequestController.MAX_RETRIES}) reached, giving up`);
        this.retryCount = 0;
      }
    } else {
      this.retryCount = 0;
    }
    this.scheduledRequest = undefined;
    this.busy = false;
  }
}
