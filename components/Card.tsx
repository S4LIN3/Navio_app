import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import colors from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  testID?: string;
  animated?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
  onPress,
  testID,
  animated = false,
}) => {
  const cardStyles = [
    styles.card,
    styles[`${variant}Card`],
    styles[`${padding}Padding`],
    style
  ];

  // Use Animated component for web compatibility
  if (Platform.OS === 'web' || !animated) {
    const Container = onPress ? Pressable : View;
    return (
      <Container 
        style={cardStyles}
        onPress={onPress}
        testID={testID}
      >
        {children}
      </Container>
    );
  }

  return (
    <AnimatedPressable 
      style={cardStyles}
      onPress={onPress}
      testID={testID}
      entering={FadeIn.duration(300)}
    >
      {children}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
  },
  defaultCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  elevatedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  outlinedCard: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  flatCard: {
    backgroundColor: colors.cardBackground,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: 12,
  },
  mediumPadding: {
    padding: 16,
  },
  largePadding: {
    padding: 24,
  },
});

export default Card;