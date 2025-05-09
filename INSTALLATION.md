# Detailed Installation Guide

This guide provides detailed instructions for setting up the Life Balance App development environment on different platforms.

## Prerequisites

### All Platforms

- Node.js (version 16.x or newer)
- npm or yarn
- Git

### Platform-Specific Requirements

#### iOS Development (macOS only)

- macOS
- Xcode (latest version recommended)
- CocoaPods
- iOS Simulator

#### Android Development

- Android Studio
- Android SDK
- Android Emulator

## Step-by-Step Installation

### 1. Install Node.js and npm

#### Using a package manager (recommended)

- **macOS** (using Homebrew):
  ```bash
  brew install node
  ```

- **Windows** (using Chocolatey):
  ```bash
  choco install nodejs
  ```

- **Linux** (using apt for Ubuntu/Debian):
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  ```

#### Direct download

Download and install from [Node.js official website](https://nodejs.org/)

### 2. Install Expo CLI

```bash
npm install -g expo-cli
```

### 3. Clone the Repository

```bash
git clone https://github.com/yourusername/life-balance-app.git
cd life-balance-app
```

### 4. Install Project Dependencies

```bash
npm install
# or
yarn install
```

### 5. Platform-Specific Setup

#### iOS (macOS only)

1. Install Xcode from the Mac App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

#### Android

1. Install Android Studio
2. During installation, ensure the following are selected:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
3. Configure Android SDK:
   - Open Android Studio
   - Go to "SDK Manager"
   - Install the latest Android SDK

### 6. Configure Environment Variables (Android)

Add the following to your shell profile (.bashrc, .zshrc, etc.):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 7. Start the Development Server

```bash
npx expo start
```

## Running on Devices

### iOS Simulator (macOS only)

1. Start the development server: `npx expo start`
2. Press `i` to open in iOS Simulator
3. Alternatively, select "Run on iOS simulator" from the Expo Developer Tools

### Android Emulator

1. Start an Android Emulator from Android Studio
2. Start the development server: `npx expo start`
3. Press `a` to open in Android Emulator
4. Alternatively, select "Run on Android device/emulator" from the Expo Developer Tools

### Physical Devices

1. Install the Expo Go app on your device:
   - [iOS App Store](https://apps.apple.com/app/apple-store/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Start the development server: `npx expo start`
3. Scan the QR code with your device:
   - iOS: Use the Camera app
   - Android: Use the Expo Go app

## Troubleshooting

### Metro Bundler Issues

If the Metro bundler fails to start or gets stuck:

```bash
# Clear cache and restart
npx expo start -c
```

### Dependency Issues

If you encounter dependency conflicts:

```bash
# Force install dependencies
npm install --force
# or
yarn install --force
```

### iOS Build Issues

If you encounter issues building for iOS:

```bash
cd ios
pod install
cd ..
```

### Android Build Issues

If you encounter issues building for Android:

1. Check that your Android SDK is properly configured
2. Ensure you have the correct build tools installed
3. Try cleaning the project:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

### Expo Go Connection Issues

If your device cannot connect to the development server:

1. Ensure your device and computer are on the same network
2. Try using the tunnel connection:
   ```bash
   npx expo start --tunnel
   ```

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)