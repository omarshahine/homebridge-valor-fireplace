# Changelog

## [2.1.0] - 2026-05-17

### Added
- **Ignition lockout circuit breaker with auto-retry.** When `igniteFireplace()` runs, it now sends the Ignite command and observes the receiver's own ignition cycle to completion. Three outcome classes are distinguished:
  - **success**: `guardFlameOn` confirmed → exit, clear failure history.
  - **soft-fail**: `igniting` cleared back to 0 but no flame caught (cold pilot, air in line — common cold-start case) → retry after delay.
  - **hard-fail**: `igniting` bit stuck past timeout → Mertik GV60 safety lockout → stop the sequence, require manual reset (paperclip, cycle gas, or service).

  Default: 4 attempts, 90s timeout per attempt, 3 min between retries. Each attempt logs as `[ignite] Attempt N of M` with explicit outcomes — makes postmortem of "did the fireplace try and fail?" trivial. Off requests mid-sequence abort the loop cleanly.
- **Persistent ignition history** at `<storagePath>/valor-ignition-history.json` via new `IgnitionTracker` class. Records every attempt with timestamps, outcomes, durations, and final status bits. Survives plugin restarts and homebridge log rotations — the previous all-in-memory state lost every diagnostic the moment the log rotated.
- **Six newly-decoded status packet fields** on `FireplaceStatus`, in parity with `valor-fireplace-cli` 1.1.0:
  - `burnerOutput` (chars 14-15) — current burner output 0-255, continuous.
  - `lightBrightness` (chars 20-21) — decorative light dimmer setpoint 0-255 (persists across off).
  - `fanSpeed` (chars 22-23) — circulating fan speed 0-4.
  - `scheduleActive` (status bit 9) — schedule/timer overlay flag.
  - `lightOn` (status bit 13) — decorative light power.
  - `statusBitsHex` — raw 4-char hex of the status bit field.
- **Derived signals** on `FireplaceStatus`:
  - `lockoutSuspected` — heuristic candidate for hard lockout.
  - `pilotOnly` — `guardFlameOn && burnerOutput === 0`.
- **`isLockoutActive()` on `IFireplaceController`.** Public method exposing whether the controller is in a confirmed hard-lockout state, for future code wiring up a HomeKit `StatusFault` characteristic.
- **`'lockout'` event** emitted on the controller for fault-state subscribers. Fires `true` when a hard lockout is detected, `false` when it clears.

### Changed
- **Lockout state gates non-Off commands** but lets shutdowns through. When a hard lockout is in effect from a prior session, `request()` blocks ignite/mode/temp requests with a clear warning. An Off request is always allowed (does no harm, may help reconcile state).
- **`processStatusResponse`** no longer auto-shuts-off during the `lostConnection` recovery path while a hard lockout is active — the gas is already off and the receiver is in fault state, so a shutdown command would just generate log noise.

## [2.0.1] - 2026-01-11

### Fixed
- Temperature now displays in configured unit (F/C) in all log messages
- Setting temperature no longer briefly switches to Manual mode when already in Temperature mode
- Mode detection now correctly identifies Remote/Thermostat controlled modes via endByte

### Changed
- HeaterCooler now advertises Heat mode only (removed Cool and Auto options from Apple Home)
- Simplified operation mode mappings for heat-only device

## [2.0.0] - 2026-01-10

### Added
- Debug mode configuration option - logs all status updates when enabled
- Temperature unit configuration (Celsius/Fahrenheit) for log output
- Smart status logging - only logs on state changes (not every 15 seconds)
- HomeKit screenshot in README

### Changed
- Rebranded from homebridge-mertik-fireplace to homebridge-valor-fireplace
- Platform name changed to "ValorFireplace"
- Manufacturer set to "Valor"
- License changed to MIT
- Temperatures rounded to whole numbers when displayed in Fahrenheit

### Documentation
- Added comprehensive device compatibility info
- Documented GV60 WiFi Module requirement
- Added link to Valor10 Remote App compatible fireplaces
- Created CLAUDE.md with technical architecture details
- Documented status packet structure and mode detection logic
