# Deploying MoodMap to Apple App Store and Google Play Store

## Prerequisites

- **Apple**: Apple Developer account ($99/year), macOS with Xcode for local builds, or [EAS Build](https://docs.expo.dev/build/introduction/) for cloud builds.
- **Android**: Google Play Developer account ($25 one-time), Android Studio (optional), or EAS Build.

## 1. Configure app identifiers

In `app.json`:

- **iOS**: Set `ios.bundleIdentifier` to your own (e.g. `com.yourcompany.moodmap`). Must match the App ID in App Store Connect.
- **Android**: Set `android.package` to your own (e.g. `com.yourcompany.moodmap`). Must match the applicationId in Play Console.

## 2. Build with EAS (Expo Application Services)

Install EAS CLI and log in:

```bash
npm install -g eas-cli
eas login
```

Configure the project (first time):

```bash
eas build:configure
```

- **iOS**: Choose a build profile (e.g. production). Ensure a valid Apple Developer account is linked.
- **Android**: Choose a build profile. EAS can generate a keystore or use yours.

Build for both stores:

```bash
# iOS (requires Apple Developer account)
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

Download the built artifacts (`.ipa` for iOS, `.aab` or `.apk` for Android) from the Expo dashboard.

## 3. Apple App Store

1. Create an app in [App Store Connect](https://appstoreconnect.apple.com/) with the same **Bundle ID** as `ios.bundleIdentifier`.
2. Fill in metadata: name, description, screenshots, privacy policy URL, and **App Privacy** (e.g. “Microphone” for recording).
3. Upload the `.ipa` via **Transporter** (Mac) or Xcode Organizer, or use EAS Submit:

   ```bash
   eas submit --platform ios --latest
   ```

4. Submit for review and release.

## 4. Google Play Store

1. Create an app in [Google Play Console](https://play.google.com/console/) with the same **Application ID** as `android.package`.
2. Fill in store listing: title, short description, full description, graphics, and **Privacy policy**.
3. In **App content**, declare **Microphone** permission and any data usage.
4. Upload the `.aab` (or `.apk`) in **Production** (or testing track), then roll out.

EAS Submit for Android:

```bash
eas submit --platform android --latest
```

## 5. Microphone permission

- **iOS**: `NSMicrophoneUsageDescription` is set in `app.json` under `ios.infoPlist`. Use clear, user-facing text.
- **Android**: `android.permission.RECORD_AUDIO` is in `app.json` under `android.permissions`. Request at runtime (e.g. when user taps “Sync Environment”) for best practice.

## 6. Superpowered SDK (optional)

For low-latency audio and real FFT:

- Add Superpowered native modules to the Expo project (e.g. via a [development build](https://docs.expo.dev/develop/development-builds/introduction/)) or eject to a bare React Native app.
- Replace the current recording and “simulated” analysis in `App.js` with calls to the Superpowered SDK and use its output to drive procedural/MIDI generation and playback.

Once builds and store listings are configured, use `eas build` and `eas submit` for repeatable deployments.
