# Mobile Wrapper

This folder contains configuration and documentation for the mobile wrapper.

## Capacitor Setup

The mobile wrapper uses Capacitor.js to package the web app as native iOS and Android applications.

### Native Projects Location

After running `pnpm cap:sync` from the `web/` directory, Capacitor will generate native projects:
- iOS: `web/ios/`
- Android: `web/android/`

These folders are gitignored as they contain generated code and platform-specific dependencies.

### Adding Native Platforms

To add iOS or Android platforms (first time only):

```bash
cd web
pnpm cap add ios
pnpm cap add android
```

### Syncing Web App to Native

After building the web app, sync it to native projects:

```bash
cd web
pnpm build
pnpm cap:sync
```

### Opening Native Projects

```bash
# iOS (requires Xcode)
cd web
pnpm cap:ios

# Android (requires Android Studio)
cd web
pnpm cap:android
```

## Required Plugins

- `@capacitor/haptics` - For vibration feedback on touch and landing

## Platform-Specific Notes

### iOS
- Requires Xcode 14+
- Requires CocoaPods (`sudo gem install cocoapods`)
- Run `pod install` in `web/ios/App` after first sync

### Android
- Requires Android Studio
- Requires Android SDK with API level 33+
- Minimum SDK version: 21 (Android 5.0)

