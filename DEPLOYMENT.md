# Deployment Guide

This guide explains how to deploy your custom version of homebridge-valor-fireplace to your Homebridge Pi.

## Prerequisites

- SSH access to your Homebridge Pi
- Git and Node.js installed on the Pi
- SSH key set up for GitHub access on the Pi

## Initial Setup (One-time)

### 1. Set up SSH Key on Pi

If you haven't already, generate an SSH key on your Pi to access GitHub:

```bash
# On your Pi via SSH
ssh-keygen -t ed25519 -C "homebridge-pi"
# Press Enter 3 times to accept defaults

# Display your public key
cat ~/.ssh/id_ed25519.pub
```

Copy the output and add it to GitHub at: https://github.com/settings/ssh/new

### 2. Clone Repository

```bash
# SSH into your Pi
ssh pi@YOUR_HOMEBRIDGE_IP

# Navigate to Homebridge directory
cd /var/lib/homebridge

# Clone the repository
git clone git@github.com:omarshahine/homebridge-valor-fireplace.git

# Navigate into the project
cd homebridge-valor-fireplace

# Checkout the child-bridge branch
git checkout child-bridge
```

### 3. Initial Install

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Install the official plugin first (Homebridge UI requirement)
npm install -g homebridge-mertik-fireplace

# Then install your custom version on top
npm link
# OR
npm pack
npm install -g homebridge-mertik-fireplace-1.6.2.tgz
```

### 4. Restart Homebridge

Go to `http://YOUR_HOMEBRIDGE_IP:8581` → **Homebridge** → **Restart**

## Updating Your Plugin

After making changes on your Mac and pushing to GitHub:

### On Your Mac

```bash
cd /Users/omarshahine/GitHub/homebridge-valor-fireplace

# Make your changes
git add .
git commit -m "Description of changes"
git push origin child-bridge
```

### On Your Pi

```bash
# SSH into your Pi
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
# OR
npm pack
npm install -g homebridge-mertik-fireplace-1.6.2.tgz

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
echo "✓ Update complete!"
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
        "fireplaces": [
            {
                "name": "Fireplace",
                "ip": "192.168.X.X"
            }
        ],
        "platform": "MertikFireplace"
    }
]
```

Replace `192.168.X.X` with your fireplace's IP address.

## Troubleshooting

### Plugin not showing in UI

- The Homebridge UI sometimes requires the official plugin to be installed first
- Install the official version: `npm install -g homebridge-mertik-fireplace`
- Then install your custom version on top

### npm not found

Make sure you're using the `pi` user or the appropriate user that has Node.js in the PATH.

### Verify Installation

```bash
# Check if plugin is installed
npm list -g homebridge-mertik-fireplace

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

- Always test your changes locally on your Mac before deploying
- The `child-bridge` branch is the development branch
- Keep your fireplace IP address static in your router settings
- After major updates, check the Homebridge logs for any errors

