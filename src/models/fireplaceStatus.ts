import { OperationMode } from './operationMode';

export class FireplaceStatus {
  public readonly auxOn: boolean = false;
  public readonly mode: OperationMode = OperationMode.Off;
  public readonly currentTemperature: number = 10;
  public readonly targetTemperature: number = 10;
  public readonly igniting: boolean = false;
  public readonly guardFlameOn: boolean = false;
  public readonly shuttingDown: boolean = false;
  /** Raw 4-char hex of the status bit field (chars 16-19). Useful for diagnostics. */
  public readonly statusBitsHex: string = '';
  /**
   * Heuristic: a Mertik GV60 ignition lockout looks like `igniting` set with
   * no `guardFlameOn` and no `shuttingDown`. The valve tried to light, the
   * thermopile never confirmed flame, and the receiver killed the gas. The
   * `igniting` bit stays set until a power-cycle or paperclip reset.
   * Empirically observed at the cabin on 2026-05-16. See PROTOCOL.md in the
   * `valor-fireplace-cli` repo for the full empirical decode.
   */
  public readonly lockoutSuspected: boolean = false;
  /**
   * Schedule / timer / remote-program overlay active (status bit 9). Set when
   * the handheld remote is driving the setpoint from a P1/P2 timer or schedule.
   */
  public readonly scheduleActive: boolean = false;
  /** Decorative light on/off (status bit 13). Independent of brightness. */
  public readonly lightOn: boolean = false;
  /**
   * Decorative light brightness setpoint, 0-255 (chars 20-21). Persists across
   * light on/off — the controller remembers your last dim level.
   */
  public readonly lightBrightness: number = 0;
  /**
   * Circulating fan speed, 0-4 (chars 22-23). 0 = off, 1-4 = the four speed
   * bars exposed by the Valor 10 handheld remote.
   */
  public readonly fanSpeed: number = 0;
  /**
   * Current main-burner output level, 0-255 (chars 14-15). `0x00` means pilot
   * only (no main burner flame). `0xFF` means full output (Step11). Uses the
   * same calibration as the outbound FlameHeight command, but in temperature
   * or eco mode the firmware may report any intermediate modulated value.
   */
  public readonly burnerOutput: number = 0;
  /**
   * Pilot lit but main burner off (`guardFlameOn && burnerOutput === 0`).
   * Not a distinct wire mode — just a state.
   */
  public readonly pilotOnly: boolean = false;

  /**
   * Display-gated burner output: returns 0 unless the guard flame is on.
   * Firmware does not clear chars 14-15 on shutdown — they linger at the
   * last in-flight value (e.g. `0xE7` for Step9), so the raw `burnerOutput`
   * would falsely show "91%" while the pilot is dead. Use this for any
   * log line or HomeKit characteristic that surfaces burner output to a
   * human; use the raw `burnerOutput` only for diagnostic dumps.
   */
  public get displayBurnerOutput(): number {
    return this.guardFlameOn ? this.burnerOutput : 0;
  }

  constructor(status: string) {
    const modeBits = status.substring(24, 25);
    const statusBits = status.substring(16, 20);
    this.statusBitsHex = statusBits;
    this.shuttingDown = fromBitStatus(statusBits, 7);
    this.guardFlameOn = fromBitStatus(statusBits, 8);
    this.scheduleActive = fromBitStatus(statusBits, 9);
    this.igniting = fromBitStatus(statusBits, 11);
    this.auxOn = fromBitStatus(statusBits, 12);
    this.lightOn = fromBitStatus(statusBits, 13);
    this.burnerOutput = parseInt('0x' + status.substring(14, 16));
    this.lightBrightness = parseInt('0x' + status.substring(20, 22));
    this.fanSpeed = parseInt('0x' + status.substring(22, 24));
    this.currentTemperature = parseInt('0x' + status.substring(28, 32)) / 10;
    this.targetTemperature = parseInt('0x' + status.substring(32, 36)) / 10;
    this.lockoutSuspected =
      this.igniting && !this.guardFlameOn && !this.shuttingDown;
    this.pilotOnly = this.guardFlameOn && this.burnerOutput === 0;
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
          +`burner:${this.displayBurnerOutput} `
          +`fan:${this.fanSpeed} `
          +`light:${this.lightOn}/${this.lightBrightness} `
          +`shutdown:${this.shuttingDown} `
          +`guardOn:${this.guardFlameOn} `
          +`lockout:${this.lockoutSuspected} `
          +`bits:0x${this.statusBitsHex}`;
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