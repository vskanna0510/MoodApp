# MoodMap – Emotional Soundscape Generator

An app that uses the device microphone to sense your environment (noisy office, quiet rain, busy cafe) and generates a matching, AI-composed Lo-Fi soundscape to help you focus. Unlike static white noise, MoodMap adapts to fill the "gaps" in your room's sound profile.

## Features

- **Sync Environment**: Record a 5-second ambient clip and analyze peak frequencies.
- **Procedural mood**: Simulated frequency analysis drives a "mood" label (Warm & deep, Balanced, Bright & airy).
- **Soundscape playback**: Play a Lo-Fi-style track (placeholder; replace with Superpowered-generated or your own MIDI-based audio).

## Run locally

```bash
cd mobileApp
npm install
npx expo start
```

Then scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Project structure

- `App.js` – Main screen: gradient UI, animated orb, Sync Environment flow, and playback controls.
- `app.json` – Expo config (name, slug, iOS/Android identifiers, permissions).
- `DEPLOYMENT.md` – Steps for Apple App Store and Google Play Store.

## Next steps (production)

1. **Superpowered SDK**: Integrate [Superpowered](https://superpowered.com/) for low-latency audio recording and FFT on iOS/Android. Replace the current `expo-av` recording and simulated analysis with native modules.
2. **MIDI / procedural audio**: Generate or stream a real Lo-Fi track (e.g. MIDI-based) that fills frequency gaps identified by the analysis.
3. **Replace placeholder audio**: Swap the demo playback URL in `App.js` with your generated soundscape (local asset or API).

## License

Private / your choice.
