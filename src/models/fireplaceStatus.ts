import { OperationMode } from './operationMode';

export class FireplaceStatus {
  public readonly auxOn: boolean = false;
  public readonly mode: OperationMode = OperationMode.Off;
  public readonly currentTemperature: number = 10;
  public readonly targetTemperature: number = 10;
  public readonly igniting: boolean = false;
  public readonly guardFlameOn: boolean = false;
  public readonly shuttingDown: boolean = false;

  constructor(status: string) {
    const modeBits = status.substring(24, 25);
    const statusBits = status.substring(16, 20);
    this.shuttingDown = fromBitStatus(statusBits, 7);
    this.guardFlameOn = fromBitStatus(statusBits, 8);
    this.igniting = fromBitStatus(statusBits, 11);
    this.currentTemperature = parseInt('0x' + status.substring(28, 32)) / 10;
    this.targetTemperature = parseInt('0x' + status.substring(32, 36)) / 10;
    this.auxOn = fromBitStatus(statusBits, 12);
    const endByte = status.substring(status.length - 2);
    let opMode = getOperationMode(modeBits, endByte);
    if (!this.guardFlameOn || this.shuttingDown) {
      opMode = OperationMode.Off;
    }
    this.mode = opMode;
  }

  public toString(): string {
    return `mode:${OperationMode[this.mode]} `
          +`ignite:${this.igniting} `
          +`target:${this.targetTemperature} `
          +`aux:${this.auxOn} `
          +`current:${this.currentTemperature} `
          +`shutdown:${this.shuttingDown} `
          +`guardOn:${this.guardFlameOn}`;
  }
}

/**
 * Two-step mode detection:
 * Step 1: Check modeBits at position 24
 *   - '1' = Temperature (CLI/App)
 *   - '2' = Eco (CLI/App)
 *   - '0' = Check endByte (Remote/Thermostat)
 * Step 2: If modeBits = '0', check endByte (last 2 chars)
 *   - '01' = Temperature (CLI Temperature mode)
 *   - '02' = Temperature (Remote variant)
 *   - '04' = Temperature (Remote: Temp, Timer, or Schedule)
 *   - '08' = Manual (Remote: Flame Height)
 */
function getOperationMode(modeBits: string, endByte: string): OperationMode {
  // Primary mode detection (CLI/App controlled)
  switch (modeBits) {
    case '1':
      return OperationMode.Temperature;
    case '2':
      return OperationMode.Eco;
    default:
      // Secondary detection for remote/thermostat control
      switch (endByte) {
        case '01': // CLI Temperature
        case '02': // Remote Temperature variant
        case '04': // Remote: Temp, Timer, or Schedule
          return OperationMode.Temperature;
        case '08': // Remote: Flame Height
          return OperationMode.Manual;
        default:
          return OperationMode.Manual;
      }
  }
}

function hex2bin(hex: string){
  return (parseInt(hex, 16).toString(2)).padStart(16, '0');
}

function fromBitStatus(hex: string, index: number) {
  return hex2bin(hex).substring(index, index + 1) === '1';
}