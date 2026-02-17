# homebridge-valor-fireplace

Homebridge plugin for Valor fireplaces with WiFi controllers (B6R-WME). Exposes fireplaces as HomeKit HeaterCooler accessories.

## Commands

```bash
npm run build          # Compile TypeScript → dist/
npm run lint           # ESLint with zero warnings allowed
npm run watch          # Build + link + nodemon for development
```

`prepublishOnly` runs lint + build automatically before `npm publish`.

## Architecture

```
src/
├── index.ts                          # Plugin registration entry point
├── settings.ts                       # Platform name + plugin name constants
├── platform.ts                       # ValorPlatform - discovers/registers accessories from config
├── platformAccessory.ts              # Bridges fireplace ↔ HomeKit characteristics
├── controllers/
│   ├── fireplaceController.ts        # TCP communication with fireplace hardware
│   ├── requestController.ts          # Request queuing, merging, retry logic
│   └── serviceController.ts          # HomeKit service/characteristic setup
└── models/
    ├── fireplaceStatus.ts            # Parses 106-char status packets
    ├── operationMode.ts              # Off, Manual, Temperature, Eco modes
    ├── flameHeight.ts                # 11 discrete flame height steps
    ├── temperatureRange.ts           # Temperature ↔ bit encoding
    ├── auxMode.ts                    # Aux fan (mapped to SwingMode)
    ├── deviceConfig.ts               # Per-fireplace config (name + IP)
    └── request.ts                    # Request interface (mode, temp, aux)
```

## Key Design Details

- **Protocol**: Raw TCP on port 2000, hex-encoded command packets with prefix `0233303330333033303830`
- **Polling**: Status polled every 15s; device marked unreachable after 5min without response
- **Status packets**: 106-character strings parsed by `FireplaceStatus`
- **Request merging**: Multiple rapid changes are merged into one request (10s debounce). Failed requests retry up to 10 times.
- **Ignition**: 40s async delay after ignite command; 30s for shutdown
- **Temperature**: Always Celsius internally (0-36°C range). In Manual mode, flame height percentage is mapped to the 5-36 range for the slider.
- **HomeKit mapping**: HeaterCooler service (heat only), ContactSensor for reachability, SwingMode for aux fan, LockPhysicalControls for parental lock (60s activation delay)
- **No test suite** - no unit or integration tests exist

## Configuration

Platform name: `ValorFireplace`. Each fireplace needs a **static IP address**.

```json
{
  "platform": "ValorFireplace",
  "fireplaces": [
    { "name": "Living Room", "ip": "192.168.1.100" }
  ],
  "debug": false,
  "temperatureUnit": "C"
}
```

## Code Style

- TypeScript with `strict: true`, `noImplicitAny: false`
- Single quotes, 2-space indent, 140 char max line length
- ESLint config in `.eslintrc`

## Claude Code GitHub Actions

This repo uses Claude Code GitHub Actions for PR automation:

- **`claude-code-review.yml`** - Auto-reviews PRs when marked "Ready for review" (draft → ready triggers review)
- **`claude.yml`** - Responds to `@claude` mentions in PR/issue comments for manual reviews

**Workflow:** Open PRs as draft → push commits → mark "Ready for review" to trigger auto-review. Use `@claude` in comments for follow-up reviews.
