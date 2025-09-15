# Fast Build Setup - Alternatives to EAS Free Tier

This document outlines faster alternatives to the slow EAS free tier builds.

## 🚀 GitHub Actions (Recommended)

### Setup Instructions

1. **Push your code to GitHub** (if not already done)
2. **Set up Expo Token**:
   - Go to https://expo.dev/accounts/settings/access-tokens
   - Create a new token
   - In your GitHub repository, go to Settings → Secrets and variables → Actions
   - Add a new secret named `EXPO_TOKEN` with your token value

3. **Trigger builds**:
   - Push to master/main branch
   - Or go to Actions tab and manually trigger "Build Android APK"

### Benefits
- ✅ **Unlimited builds** (GitHub Actions free tier: 2000 minutes/month)
- ✅ **No queue wait times**
- ✅ **Faster builds** (typically 5-15 minutes)
- ✅ **Automatic APK downloads** from Actions artifacts
- ✅ **Works on Windows** (builds run on Ubuntu)

## 🔧 Local Development Builds

### Option 1: Android Studio Setup
```bash
# Install Android Studio first
# Then run:
npx expo run:android
```

### Option 2: Local EAS Build (macOS/Linux only)
```bash
npx eas build --platform android --profile preview --local
```
**Note**: Not supported on Windows

## 📱 Quick Testing

For immediate testing without full builds:
```bash
# Start development server
npm start

# Use Expo Go app to scan QR code
# Or use expo-dev-client for custom native code
```

## 🎯 Production Builds

### GitHub Actions Workflow
- Builds triggered automatically on code push
- APK available in Actions artifacts
- Can be configured for automatic releases

### Manual EAS Build (when needed)
```bash
npx eas build --platform android --profile production
```

## 💡 Cost Comparison

| Method | Cost | Build Time | Queue Time |
|--------|------|------------|------------|
| EAS Free | Free | 10-20 min | 300+ min |
| EAS Paid | $20-99/month | 10-20 min | 0-5 min |
| GitHub Actions | Free* | 5-15 min | 0-2 min |
| Local Build | Free | 5-10 min | 0 min |

*GitHub Actions: 2000 minutes/month free, then $0.008/minute

## 🔗 Useful Links

- [GitHub Actions for React Native](https://github.com/TanayK07/expo-react-native-cicd)
- [Expo Local Builds](https://docs.expo.dev/build-reference/local-builds/)
- [Android Studio Setup](https://docs.expo.dev/workflow/android-studio-emulator/)