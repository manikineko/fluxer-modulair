# Mobile App Setup (Android/iOS)

## Desktop App Status

The desktop app is already up-to-date with the web app. It loads the web app from:
- Stable: `https://web.fluxer.app`
- Canary: `https://web.canary.fluxer.app`

No manual sync is needed - the desktop app automatically receives all web app changes.

## Mobile App Setup with Capacitor

### Prerequisites

1. **Node.js Version**: Capacitor CLI requires Node.js >= 22.0.0
   - Use `nvm use 24` to switch to Node 24
   - Project `.nvmrc` specifies Node 24

2. **Android Studio** (for Android builds)
   - Install Android Studio
   - Set up Android SDK (API level 33+ recommended)
   - Configure ANDROID_HOME environment variable

3. **Xcode** (for iOS builds, macOS only)
   - Install Xcode from App Store
   - Install Xcode command-line tools: `xcode-select --install`

### Installation

Capacitor is already set up. To rebuild or re-initialize:

```bash
cd fluxer_app
nvm use 24
pnpm install
npx cap init "Fluxer" "com.fluxer.mobile"
npx cap add android
npx cap add ios
```

### Building

```bash
# Build the web app
pnpm build

# Sync with mobile platforms
pnpm cap:sync

# Open Android Studio
pnpm cap:open:android

# Open Xcode (macOS only)
pnpm cap:open:ios
```

### Configuration

Capacitor configuration is in `capacitor.config.json`:
- App ID: `com.fluxer.mobile`
- App Name: `Fluxer`
- Web Directory: `dist`
- Android Scheme: `https`
- iOS Scheme: `Fluxer`

### Current Status

- ✅ Node.js upgraded to v24.15.0
- ✅ Capacitor packages installed
- ✅ Capacitor config created (JSON)
- ✅ Capacitor initialized
- ✅ Android platform added
- ✅ iOS platform added
- ✅ Build scripts added to package.json

### Next Steps

1. Build the web app: `pnpm build`
2. Sync with platforms: `pnpm cap:sync`
3. Open Android Studio: `pnpm cap:open:android`
4. Open Xcode (macOS): `pnpm cap:open:ios`
5. Build and test on devices/emulators
