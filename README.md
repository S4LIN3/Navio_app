# Navio_App

A comprehensive personal development and life management application built with React Native and Expo. This app helps users track their mental health, set and achieve goals, manage finances, build social connections, and access learning resources.


## Features

- **Dashboard**: Overview of all life aspects with quick access to key features
- **Mental Health Tracking**: Log daily moods and track emotional well-being over time
- **Goal Setting & Tracking**: Create, manage, and track progress on personal goals
- **Financial Management**: Track expenses, income, and financial goals
- **Social Connections**: Manage and nurture your social network
- **Learning Resources**: Access curated educational content and track learning progress
- **Motivational Content**: Get daily inspiration and motivation

## Requirements

- Node.js 16.x or newer
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac users) or Android Emulator
- Expo Go app (for physical device testing)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/life-balance-app.git
   cd life-balance-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

## Running the App

### On Simulator/Emulator

- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator

### On Physical Device

1. Install the Expo Go app on your device
2. Scan the QR code displayed in the terminal or Expo Dev Tools
3. The app will open in Expo Go

### On Web

- Press `w` to open in a web browser

## Project Structure

```
life-balance-app/
├── app/                  # Main application screens and navigation
│   ├── (tabs)/           # Tab-based navigation screens
│   ├── goal-details/     # Goal detail screens
│   ├── resource-details/ # Learning resource detail screens
│   └── _layout.tsx       # Root layout configuration
├── assets/               # Static assets like images
├── components/           # Reusable UI components
├── constants/            # App constants and configuration
├── mocks/                # Mock data for development
├── store/                # State management with Zustand
├── types/                # TypeScript type definitions
└── styles/               # Global styles and themes
```

## State Management

The app uses Zustand for state management with the following stores:

- `userStore` - User profile and preferences
- `moodStore` - Mental health and mood tracking
- `goalStore` - Personal goals and progress
- `taskStore` - Tasks and to-dos
- `learningStore` - Learning resources and progress
- `socialStore` - Social connections
- `financeStore` - Financial data and goals
- `motivationStore` - Motivational content

## Technologies Used

- React Native
- Expo 53
- TypeScript
- Zustand (State Management)
- React Navigation
- Expo Router
- AsyncStorage

## Troubleshooting

### Common Issues

1. **Metro bundler fails to start**
   - Try clearing the cache: `npx expo start -c`

2. **Dependencies issues**
   - Ensure you're using compatible versions: `npm install --force`

3. **Simulator/Emulator not connecting**
   - Make sure your development environment is properly set up
   - For iOS: Xcode and Command Line Tools are installed
   - For Android: Android Studio, SDK, and emulator are configured

4. **Expo Go connection issues**
   - Ensure your device and development machine are on the same network
   - Try using the "tunnel" connection: `npx expo start --tunnel`

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to this project.
