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

## Legal

*Valor* is a registered trademark of Valor Fireplaces.

This project is not affiliated with, authorized, maintained, sponsored, or endorsed by Valor Fireplaces or any of its affiliates or subsidiaries.
