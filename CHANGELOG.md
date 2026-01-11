# Changelog

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
