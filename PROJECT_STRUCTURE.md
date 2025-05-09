# Project Structure Documentation

This document provides a detailed overview of the Life Balance App's project structure, explaining the purpose and organization of each directory and key files.

## Root Directory

```
life-balance-app/
├── app/                  # Main application screens and navigation
├── assets/               # Static assets
├── components/           # Reusable UI components
├── constants/            # App constants and configuration
├── mocks/                # Mock data
├── store/                # State management
├── types/                # TypeScript type definitions
├── styles/               # Global styles
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── app.json              # Expo configuration
└── README.md             # Project documentation
```

## Detailed Structure

### `/app` Directory

The `/app` directory uses Expo Router for file-based routing, similar to Next.js.

```
app/
├── _layout.tsx           # Root layout with navigation configuration
├── index.tsx             # Entry point / landing screen
├── (tabs)/               # Tab-based navigation
│   ├── _layout.tsx       # Tab navigation configuration
│   ├── index.tsx         # Home/Dashboard tab
│   ├── mental-health.tsx # Mental health tracking tab
│   ├── goals.tsx         # Goals management tab
│   ├── learning.tsx      # Learning resources tab
│   ├── social.tsx        # Social connections tab
│   └── finance.tsx       # Financial management tab
├── goal-details/         # Goal detail screens
│   └── [id].tsx          # Dynamic route for individual goal details
└── resource-details/     # Learning resource detail screens
    └── [id].tsx          # Dynamic route for individual resource details
```

### `/components` Directory

Reusable UI components organized by functionality.

```
components/
├── Button.tsx            # Custom button component
├── Card.tsx              # Base card component
├── ProgressBar.tsx       # Progress visualization
├── MoodPicker.tsx        # Mood selection component
├── GoalCard.tsx          # Goal display component
├── TaskItem.tsx          # Task list item
├── ResourceCard.tsx      # Learning resource card
├── ConnectionCard.tsx    # Social connection card
├── TransactionItem.tsx   # Financial transaction item
├── MotivationalCard.tsx  # Motivational content display
├── StatCard.tsx          # Statistics display card
├── ChartCard.tsx         # Data visualization component
└── EmptyState.tsx        # Empty state placeholder
```

### `/store` Directory

Zustand stores for state management.

```
store/
├── userStore.ts          # User profile and settings
├── moodStore.ts          # Mental health tracking state
├── goalStore.ts          # Goals and objectives state
├── taskStore.ts          # Tasks and to-dos state
├── learningStore.ts      # Learning resources and progress
├── socialStore.ts        # Social connections state
├── financeStore.ts       # Financial data and tracking
└── motivationStore.ts    # Motivational content state
```

### `/constants` Directory

Application constants and configuration.

```
constants/
└── colors.ts             # Color palette and theme definitions
```

### `/mocks` Directory

Mock data for development and testing.

```
mocks/
├── motivationalContent.ts # Sample motivational quotes and content
└── learningResources.ts   # Sample learning resources
```

### `/types` Directory

TypeScript type definitions.

```
types/
└── index.ts              # Shared type definitions
```

## Key Files

### Configuration Files

- **app.json**: Expo configuration including app name, version, orientation, etc.
- **tsconfig.json**: TypeScript compiler options and path aliases
- **package.json**: Project dependencies, scripts, and metadata

### Entry Points

- **app/_layout.tsx**: Root layout component that wraps the entire application
- **app/index.tsx**: Main entry point for the application

## State Management

The app uses Zustand for state management with the following pattern:

```typescript
// Example store structure (simplified)
import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoreState {
  // State properties
  data: any[];
  
  // Actions
  addItem: (item: any) => void;
  removeItem: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      data: [],
      
      addItem: (item) => set((state) => ({ 
        data: [...state.data, item] 
      })),
      
      removeItem: (id) => set((state) => ({ 
        data: state.data.filter(item => item.id !== id) 
      })),
    }),
    {
      name: 'store-name',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ?? null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, value);
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
```

## Routing

The app uses Expo Router for navigation with the following patterns:

- **Static Routes**: Defined by files in the `/app` directory
- **Dynamic Routes**: Files with brackets like `[id].tsx`
- **Tab Navigation**: Configured in `/app/(tabs)/_layout.tsx`
- **Nested Navigation**: Organized through nested directories

## Styling Approach

The app uses React Native's StyleSheet for styling:

```typescript
import { StyleSheet } from 'react-native';
import colors from '@/constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  // Other styles...
});
```