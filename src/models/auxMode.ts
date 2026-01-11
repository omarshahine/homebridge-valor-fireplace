import { CharacteristicValue } from 'homebridge';
import { ValorPlatform } from '../platform';

export class AuxModeUtils {
  public static toSwingMode(platform: ValorPlatform, auxOn: boolean): CharacteristicValue {
    return auxOn ? platform.Characteristic.SwingMode.SWING_ENABLED : platform.Characteristic.SwingMode.SWING_DISABLED;
  }

  public static fromSwingMode(platform: ValorPlatform, swingMode: CharacteristicValue): boolean {
    return swingMode === platform.Characteristic.SwingMode.SWING_ENABLED;
  }
}