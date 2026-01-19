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

## Publishing to npm

### Version Bumping

Use semantic versioning:
- **Patch** (2.0.1 → 2.0.2): Bug fixes, minor changes
- **Minor** (2.0.1 → 2.1.0): New features, backward compatible
- **Major** (2.0.1 → 3.0.0): Breaking changes

```bash
npm version patch   # or minor, or major
npm publish
git push origin main --tags
```

### Creating GitHub Releases

```bash
gh release create v2.0.2 --title "v2.0.2" --notes "Release notes here"
```

Or manually at: https://github.com/omarshahine/homebridge-valor-fireplace/releases/new

## Homebridge Certification

To get verified and listed on [homebridge.io](https://homebridge.io):

### Requirements

1. **package.json keywords**: Must include `"homebridge-plugin"` plus additional relevant keywords
2. **config.schema.json**:
   - Must include a `name` property at the top level of schema properties
   - `required` must be an array at object level (not boolean on individual fields)
3. **GitHub Issues**: Must be enabled on the repository
4. **Version sync**: npm version must match GitHub package.json version

### Submitting for Verification

1. Open an issue at: https://github.com/homebridge/plugins/issues/new/choose
2. Select "Plugin Verification Request"
3. Fill in your plugin details

### After Submitting

The bot will run automated checks. If any fail:
1. Fix the issues in your code
2. Bump version and publish to npm
3. Push to GitHub: `git push origin main --tags`
4. Comment `/check` on the issue to re-run verification

### Common Certification Failures

| Issue | Fix |
|-------|-----|
| Missing keywords | Add more keywords to package.json besides `homebridge-plugin` |
| Invalid schema `required` | Change from `"required": true` on fields to `"required": ["field1", "field2"]` at object level |
| Missing name property | Add `name` property to config.schema.json schema |
| GitHub issues disabled | Enable Issues in repo Settings → Features |
| Version mismatch | Push version bump to GitHub: `git push origin main --tags` |

## Device Compatibility

- **Tested with:** Valor Linear L1 fireplace
- **WiFi Hardware:** [GV60 WiFi Module](https://www.valorfireplaces.com/media/Remote/GV60WIFI-Upgrade-Instructions.pdf)
- **Compatible Fireplaces:** Must support the [Valor10 Remote App](https://www.valorfireplaces.com/features/valor10-remote-app.php)

## Legal

*Valor* is a registered trademark of Valor Fireplaces.

This project is not affiliated with, authorized, maintained, sponsored, or endorsed by Valor Fireplaces or any of its affiliates or subsidiaries.
