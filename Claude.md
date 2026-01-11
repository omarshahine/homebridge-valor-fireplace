# Claude.md - Valor Fireplace Homebridge Plugin

## Project Overview

This is a Homebridge plugin that enables HomeKit control of Valor fireplaces with WiFi controllers. It was forked from the [homebridge-mertik-fireplace](https://github.com/tritter/homebridge-mertik-fireplace) plugin by @tritter and adapted for Valor fireplaces.

**Package Name:** `homebridge-valor-fireplace`
**Repository:** `https://github.com/omarshahine/homebridge-valor-fireplace`
**Author:** Omar Shahine
**License:** Apache-2.0

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

## Rebranding Checklist (Mertik → Valor)

All instances of "Mertik" branding have been updated to "Valor":

- [x] `package.json`: displayName, name, description, repository, bugs URLs
- [x] `src/settings.ts`: PLATFORM_NAME, PLUGIN_NAME
- [x] `src/platform.ts`: Class name `ValorPlatform`
- [x] `src/index.ts`: Import and registration
- [x] `src/platformAccessory.ts`: Platform type references
- [x] `src/controllers/serviceController.ts`: Manufacturer characteristic set to "Valor"
- [x] `src/models/*.ts`: Platform type references
- [x] `config.schema.json`: pluginAlias and help URLs
- [x] `README.md`: All documentation and badges
- [x] `DEPLOYMENT.md`: Installation commands

## Device Compatibility

This plugin works with Valor fireplaces that use WiFi controllers compatible with the Mertik protocol, including models with the B6R-WME controller module.

## Original Attribution

This plugin is based on [homebridge-mertik-fireplace](https://github.com/tritter/homebridge-mertik-fireplace) by [@tritter](https://github.com/tritter). Protocol implementation assistance from [@erdebee's homey-mertik-wifi](https://github.com/erdebee/homey-mertik-wifi).

## Legal

*Valor* is a registered trademark of Valor Fireplaces.
*Mertik* is a registered trademark of Maxitrol GmbH & Co. KG.

This project is not affiliated with, authorized, maintained, sponsored, or endorsed by Valor Fireplaces or Maxitrol.
