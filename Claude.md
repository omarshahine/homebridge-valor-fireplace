# Claude.md - Valor Fireplace Homebridge Plugin

## Project Overview

This is a Homebridge plugin that enables HomeKit control of Valor fireplaces with WiFi controllers.

**Package Name:** `homebridge-valor-fireplace`
**Repository:** `https://github.com/omarshahine/homebridge-valor-fireplace`
**Author:** Omar Shahine
**License:** MIT

## Technical Architecture

### Directory Structure

```
homebridge-valor-fireplace/
├── src/
│   ├── index.ts                    # Entry point - registers platform with Homebridge
│   ├── platform.ts                 # ValorPlatform - DynamicPlatformPlugin implementation
│   ├── platformAccessory.ts        # FireplacePlatformAccessory - accessory management
│   ├── settings.ts                 # Constants: PLATFORM_NAME, PLUGIN_NAME
│   ├── controllers/
│   │   ├── fireplaceController.ts  # TCP communication with fireplace
│   │   ├── requestController.ts    # Request queuing and debouncing
│   │   └── serviceController.ts    # HomeKit service management
│   └── models/
│       ├── auxMode.ts              # Auxiliary mode utilities
│       ├── deviceConfig.ts         # Device configuration interface
│       ├── fireplaceStatus.ts      # Status packet parser (106-char format)
│       ├── flameHeight.ts          # Flame height levels (12 steps)
│       ├── operationMode.ts        # Operation modes (Off, Manual, Temp, Eco)
│       ├── request.ts              # Request interface
│       └── temperatureRange.ts     # Temperature encoding utilities
├── config.schema.json              # Homebridge UI configuration schema
├── package.json                    # NPM package configuration
├── tsconfig.json                   # TypeScript configuration
└── dist/                           # Compiled JavaScript output
```

### Key Components

1. **ValorPlatform** (`src/platform.ts`): Main platform class implementing `DynamicPlatformPlugin`
2. **FireplaceController** (`src/controllers/fireplaceController.ts`): Manages TCP socket communication on port 2000
3. **ServiceController** (`src/controllers/serviceController.ts`): Creates and manages HomeKit HeaterCooler service
4. **FireplaceStatus** (`src/models/fireplaceStatus.ts`): Parses 106-character status packets from device

### Communication Protocol

- **Protocol:** TCP socket on port 2000
- **Status Polling:** Every 15 seconds
- **Connection Timeout:** 5 minutes
- **Status Packet:** 106 hex-encoded characters containing mode, temperature, ignition status, aux state

### Status Packet Structure

The fireplace returns a 106-character hex status string with the following key positions:

| Position | Length | Description |
|----------|--------|-------------|
| 16-20 | 4 chars | Status bits (guard flame, igniting, shutdown, aux) |
| 24-25 | 1 char | Mode bits (primary mode indicator) |
| 28-32 | 4 chars | Current temperature (hex, divide by 10 for °C) |
| 32-36 | 4 chars | Target temperature (hex, divide by 10 for °C) |
| Last 2 | 2 chars | End byte (secondary mode indicator) |

### Mode Detection Logic

Mode detection uses a two-step process:

**Step 1: Check modeBits at position 24**

| modeBits | Mode | Source |
|----------|------|--------|
| `"1"` | Temperature | CLI / App |
| `"2"` | Eco | CLI / App |
| `"0"` | Check end byte... | Remote / Thermostat |

**Step 2: If modeBits = "0", check the last 2 characters (end byte)**

| endByte | Mode | Remote Setting |
|---------|------|----------------|
| `"01"` | Temperature | CLI Temperature mode |
| `"02"` | Temperature | Remote variant |
| `"04"` | Temperature | Remote: Temp, Timer, or Schedule |
| `"08"` | Manual | Remote: Flame Height |

**Summary:**
- CLI/App sets modeBits to `"1"` (Temp) or `"2"` (Eco)
- Remote/Thermostat leaves modeBits at `"0"` and uses endByte to indicate mode
- Remote modes Temp, Timer, and Schedule all use temperature regulation (endByte = `"04"`)
- Remote Flame Height is manual control (endByte = `"08"`)

### HomeKit Services

- **HeaterCooler Service:** Primary control (Active, Temperature, Mode, Lock, Swing/Aux)
- **ContactSensor Service:** Device reachability indicator

## Build & Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Lint code
npm run lint

# Development with auto-reload
npm run watch
```

## Configuration

The plugin is configured in the Homebridge `config.json`:

```json
{
  "platforms": [
    {
      "platform": "ValorFireplace",
      "fireplaces": [
        {
          "name": "Living Room Fireplace",
          "ip": "192.168.1.100"
        }
      ]
    }
  ]
}
```

## Homebridge Plugin Publishing Requirements

To publish to npm and be listed on homebridge.io:

1. **Package name must start with `homebridge-`**
2. **Required keyword:** `"homebridge-plugin"` in package.json keywords
3. **Main entry:** Point to compiled JavaScript (`dist/index.js`)
4. **Engines:** Specify minimum `homebridge` and `node` versions
5. **Repository & Bugs:** Valid GitHub URLs

### Verification

To be "Verified by Homebridge":
- Plugin must be stable and well-maintained
- Submit to the [Homebridge Verified Plugins](https://github.com/homebridge/homebridge/wiki/Verified-Plugins) wiki
- Requires community review and approval

## Device Compatibility

- **Tested with:** Valor Linear L1 fireplace
- **WiFi Hardware:** [GV60 WiFi Module](https://www.valorfireplaces.com/media/Remote/GV60WIFI-Upgrade-Instructions.pdf)
- **Compatible Fireplaces:** Must support the [Valor10 Remote App](https://www.valorfireplaces.com/features/valor10-remote-app.php)

## Code Hygiene

- No hardcoded user paths (`/Users/[name]/`) - use `~/` or `${HOME}`
- No personal email addresses in tracked files (allowed: `@example.com`, `@anthropic.com`, `@noreply`)
- No API keys or secrets in code - use environment variables
- No phone numbers or PII in examples - use generic placeholders

## Legal

*Valor* is a registered trademark of Valor Fireplaces.

This project is not affiliated with, authorized, maintained, sponsored, or endorsed by Valor Fireplaces or any of its affiliates or subsidiaries.
