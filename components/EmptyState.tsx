import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Button from './Button';
import colors from '@/constants/colors';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'compact' | 'minimal';
  animated?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  actionLabel,
  onAction,
  variant = 'default',
  animated = true,
}) => {
  const Container = (animated && Platform.OS !== 'web') ? Animated.View : View;
  const animationProps = (animated && Platform.OS !== 'web') 
    ? { entering: FadeIn.duration(500) } 
    : {};

  return (
    <Container 
      style={[
        styles.container,
        variant === 'compact' && styles.compactContainer,
        variant === 'minimal' && styles.minimalContainer
      ]}
      {...animationProps}
    >
      {icon && (
        <View style={[
          styles.iconContainer,
          variant === 'compact' && styles.compactIconContainer,
          variant === 'minimal' && styles.minimalIconContainer
        ]}>
          {icon}
        </View>
      )}
      
      <Text style={[
        styles.title,
        variant === 'compact' && styles.compactTitle,
        variant === 'minimal' && styles.minimalTitle
      ]}>
        {title}
      </Text>
      
      <Text style={[
        styles.message,
        variant === 'compact' && styles.compactMessage,
        variant === 'minimal' && styles.minimalMessage
      ]}>
        {message}
      </Text>
      
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
          size={variant === 'compact' || variant === 'minimal' ? 'small' : 'medium'}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  compactContainer: {
    padding: 16,
    minHeight: 150,
  },
  minimalContainer: {
    padding: 12,
    minHeight: 100,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `rgba(67, 97, 238, ${colors.opacity.light})`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  compactIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
  },
  minimalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  compactTitle: {
    fontSize: 18,
    marginBottom: 6,
  },
  minimalTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  compactMessage: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  minimalMessage: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  button: {
    minWidth: 150,
  },
});

export default EmptyState;