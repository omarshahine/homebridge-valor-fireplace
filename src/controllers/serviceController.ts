import { Characteristic, Logger, PlatformAccessory, Service } from "homebridge";
import { IDeviceConfig } from "../models/deviceConfig";
import { MertikPlatform } from "../platform";

export interface IServiceController {
  reachableCharacteristic(): Characteristic;
  activeCharacteristic(): Characteristic;
  currentHeaterCoolerStateCharacteristic(): Characteristic;
  targetHeaterCoolerStateCharacteristic(): Characteristic;
  currentTemperatureCharacteristic(): Characteristic;
  coolingThresholdTemperatureCharacteristic(): Characteristic;
  lockControlsCharacteristic(): Characteristic;
  swingModeCharacteristic(): Characteristic;
  heatingThresholdTemperatureCharacteristic(): Characteristic;
  initCharacteristics(): void;
}

export class ServiceController implements IServiceController {
  private readonly config: IDeviceConfig;
  private readonly service: Service;
  private readonly reachableService: Service;

  constructor(
    public readonly log: Logger,
    public readonly accessory: PlatformAccessory,
    private readonly platform: MertikPlatform
  ) {
    this.config = this.accessory.context.device;

    // Get or add the HeaterCooler service
    this.service =
      this.accessory.getService(this.platform.Service.HeaterCooler) ||
      this.accessory.addService(this.platform.Service.HeaterCooler);

    // Get or add ContactSensor service
    this.reachableService =
      this.accessory.getService(this.platform.Service.ContactSensor) ||
      this.accessory.addService(this.platform.Service.ContactSensor);

    // Note: Don't call initCharacteristics() here - it will be called after handlers are set up
  }

  initCharacteristics() {
    const name = this.config.name;
    if (name.length < 2) {
      this.platform.log.error(
        `The given name ${this.config.name}, is too short`
      );
      throw new this.platform.api.hap.HapStatusError(
        this.platform.api.hap.HAPStatus.RESOURCE_DOES_NOT_EXIST
      );
    }
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, "Mertik")
      .setCharacteristic(this.platform.Characteristic.Model, "B6R-WME")
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        this.accessory.UUID
      )
      .setCharacteristic(
        this.platform.Characteristic.Name,
        this.config.name ?? "Fireplace"
      );

    // Set the service names
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      this.config.name ?? "Fireplace"
    );
    this.reachableService.setCharacteristic(
      this.platform.Characteristic.Name,
      "Connected"
    );

    // Configure target heater cooler state to support HEAT (Temperature/Manual) and COOL (Eco)
    // Removed AUTO to avoid confusing "68-68" display
    this.targetHeaterCoolerStateCharacteristic().setProps({
      validValues: [
        this.platform.Characteristic.TargetHeaterCoolerState.HEAT,
        this.platform.Characteristic.TargetHeaterCoolerState.COOL,
      ],
    });

    // Configure HeatingThresholdTemperature with proper props
    // Note: Set minValue to 0 to allow for "off" state where target temp can be 0
    this.heatingThresholdTemperatureCharacteristic().setProps({
      minValue: 0.0,
      maxValue: 36.0,
      minStep: 0.5,
    });

    // Configure CoolingThresholdTemperature - required for iOS to display detail view
    // Even though we don't use cooling, iOS needs this characteristic defined
    this.coolingThresholdTemperatureCharacteristic().setProps({
      minValue: 10.0,
      maxValue: 35.0,
      minStep: 0.5,
    });

    // Configure CurrentTemperature with proper props
    this.currentTemperatureCharacteristic().setProps({
      minValue: 0.0,
      maxValue: 100.0,
      minStep: 0.1,
    });
  }

  reachableCharacteristic = () =>
    this.reachableService.getCharacteristic(
      this.platform.Characteristic.ContactSensorState
    );

  activeCharacteristic = () =>
    this.service.getCharacteristic(this.platform.Characteristic.Active);

  currentHeaterCoolerStateCharacteristic = () =>
    this.service.getCharacteristic(
      this.platform.Characteristic.CurrentHeaterCoolerState
    );

  targetHeaterCoolerStateCharacteristic = () =>
    this.service.getCharacteristic(
      this.platform.Characteristic.TargetHeaterCoolerState
    );

  currentTemperatureCharacteristic = () =>
    this.service.getCharacteristic(
      this.platform.Characteristic.CurrentTemperature
    );

  coolingThresholdTemperatureCharacteristic = () =>
    this.service.getCharacteristic(
      this.platform.Characteristic.CoolingThresholdTemperature
    );

  lockControlsCharacteristic = () =>
    this.service.getCharacteristic(
      this.platform.Characteristic.LockPhysicalControls
    );

  swingModeCharacteristic = () =>
    this.service.getCharacteristic(this.platform.Characteristic.SwingMode);

  heatingThresholdTemperatureCharacteristic = () =>
    this.service.getCharacteristic(
      this.platform.Characteristic.HeatingThresholdTemperature
    );
}
