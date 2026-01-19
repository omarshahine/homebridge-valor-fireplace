# Deployment Guide

This guide explains how to deploy homebridge-valor-fireplace to your Homebridge installation.

## Prerequisites

- SSH access to your Homebridge server (Pi or other)
- Git and Node.js installed
- SSH key set up for GitHub access

## Initial Setup (One-time)

### 1. Set up SSH Key

If you haven't already, generate an SSH key to access GitHub:

```bash
# On your server via SSH
ssh-keygen -t ed25519 -C "homebridge"
# Press Enter 3 times to accept defaults

# Display your public key
cat ~/.ssh/id_ed25519.pub
```

Copy the output and add it to GitHub at: https://github.com/settings/ssh/new

### 2. Clone Repository

```bash
# SSH into your server
ssh pi@YOUR_HOMEBRIDGE_IP

# Navigate to Homebridge directory
cd /var/lib/homebridge

# Clone the repository
git clone git@github.com:omarshahine/homebridge-valor-fireplace.git

# Navigate into the project
cd homebridge-valor-fireplace
```

### 3. Initial Install

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm link
```

### 4. Restart Homebridge

Go to `http://YOUR_HOMEBRIDGE_IP:8581` → **Homebridge** → **Restart**

## Updating Your Plugin

After making changes and pushing to GitHub:

### On Your Development Machine

```bash
cd /path/to/homebridge-valor-fireplace

# Make your changes
git add .
git commit -m "Description of changes"
git push origin master
```

### On Your Homebridge Server

```bash
# SSH into your server
ssh pi@YOUR_HOMEBRIDGE_IP

# Navigate to the project
cd /var/lib/homebridge/homebridge-valor-fireplace

# Pull latest changes
git pull

# Install any new dependencies (if package.json changed)
npm install

# Rebuild
npm run build

# Reinstall globally
npm link

# Restart Homebridge via UI at http://YOUR_HOMEBRIDGE_IP:8581
```

## Quick Update Script

Create a script to automate updates:

```bash
cd /var/lib/homebridge/homebridge-valor-fireplace
nano update.sh
```

Add this content:

```bash
#!/bin/bash
echo "Updating homebridge-valor-fireplace..."
cd /var/lib/homebridge/homebridge-valor-fireplace
git pull
npm install
npm run build
npm link
echo ""
echo "Update complete!"
echo "Now restart Homebridge via the UI at http://YOUR_HOMEBRIDGE_IP:8581"
```

Make it executable:

```bash
chmod +x update.sh
```

To use it:

```bash
cd /var/lib/homebridge/homebridge-valor-fireplace
./update.sh
```

## Configuration

Ensure your `/var/lib/homebridge/config.json` includes:

```json
"platforms": [
    {
        "platform": "ValorFireplace",
        "fireplaces": [
            {
                "name": "Fireplace",
                "ip": "192.168.X.X"
            }
        ]
    }
]
```

Replace `192.168.X.X` with your fireplace's IP address.

## Publishing to npm

To publish the plugin so others can install it:

### 1. Login to npm (one-time)

```bash
npm login
```

### 2. Bump Version

Use semantic versioning:
- **Patch** (2.0.1 → 2.0.2): Bug fixes, minor changes
- **Minor** (2.0.1 → 2.1.0): New features, backward compatible
- **Major** (2.0.1 → 3.0.0): Breaking changes

```bash
# For bug fixes / small changes
npm version patch

# For new features
npm version minor

# For breaking changes
npm version major
```

This automatically:
- Updates `package.json` version
- Creates a git commit
- Creates a git tag

### 3. Publish

```bash
npm publish
```

### 4. Push to GitHub

```bash
git push origin main --tags
```

Users can then install with:

```bash
npm install -g homebridge-valor-fireplace
```

## Homebridge Certification

To get your plugin verified and listed on [homebridge.io](https://homebridge.io):

### Requirements

1. **package.json keywords**: Must include `"homebridge-plugin"` plus additional relevant keywords
2. **config.schema.json**:
   - Must include a `name` property at the top level
   - `required` must be an array at object level (not boolean on individual fields)
3. **GitHub Issues**: Must be enabled on the repository

### Submitting for Verification

1. Open an issue at: https://github.com/homebridge/plugins/issues/new/choose
2. Select "Plugin Verification Request"
3. Fill in your plugin details

### After Submitting

The bot will run automated checks. If any fail:

1. Fix the issues in your code
2. Bump version and publish to npm
3. Comment `/check` on the issue to re-run verification

### Common Certification Failures

| Issue | Fix |
|-------|-----|
| Missing keywords | Add more keywords to package.json besides `homebridge-plugin` |
| Invalid schema `required` | Change from `"required": true` on fields to `"required": ["field1", "field2"]` at object level |
| Missing name property | Add `name` property to config.schema.json schema |
| GitHub issues disabled | Enable Issues in repo Settings → Features |

## Troubleshooting

### npm not found

Make sure you're using the appropriate user that has Node.js in the PATH.

### Verify Installation

```bash
# Check if plugin is installed
npm list -g homebridge-valor-fireplace

# View Homebridge logs
tail -f ~/.homebridge/homebridge.log

# Or via systemd
sudo journalctl -u homebridge -f
```

### Common Restart Commands

```bash
# Via systemctl
sudo systemctl restart homebridge

# Via service
sudo service homebridge restart

# Or use the Homebridge UI (recommended)
http://YOUR_HOMEBRIDGE_IP:8581
```

## Notes

- Always test changes locally before deploying
- Keep your fireplace IP address static in your router settings
- After updates, check the Homebridge logs for any errors
