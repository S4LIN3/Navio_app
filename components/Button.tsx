import React, { useCallback } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'success' | 'error';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: string[];
  hapticFeedback?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  gradientColors,
  hapticFeedback = true,
  fullWidth = false,
  ...rest
}) => {
  const buttonStyles = [
    styles.button,
    styles[`${size}Button`],
    variant === 'outline' && styles.outlineButton,
    variant === 'text' && styles.textButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'success' && styles.successButton,
    variant === 'error' && styles.errorButton,
    disabled && styles.disabledButton,
    fullWidth && styles.fullWidthButton,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    variant === 'secondary' && styles.secondaryText,
    variant === 'outline' && styles.outlineText,
    variant === 'text' && styles.textButtonText,
    variant === 'success' && styles.successText,
    variant === 'error' && styles.errorText,
    disabled && styles.disabledText,
    textStyle,
  ];

  const handlePress = useCallback(() => {
    if (disabled || isLoading) return;
    
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  }, [onPress, disabled, isLoading, hapticFeedback]);

  const getGradientColors = () => {
    if (gradientColors) {
      // Ensure we have at least 2 colors for the gradient
      return gradientColors.length >= 2 ? gradientColors : ['#ffffff', '#ffffff'];
    }
    
    switch (variant) {
      case 'primary':
        return colors.gradients.primary as readonly string[];
      case 'secondary':
        return colors.gradients.secondary as readonly string[];
      case 'success':
        return colors.gradients.success as readonly string[];
      case 'error':
        return colors.gradients.error as readonly string[];
      default:
        return colors.gradients.primary as readonly string[];
    }
  };

  const renderContent = () => (
    <>
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={
            variant === 'outline' || variant === 'text' 
              ? getButtonColor() 
              : '#fff'
          } 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  const getButtonColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  if ((variant === 'primary' || variant === 'secondary' || variant === 'success' || variant === 'error') && !disabled) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || isLoading}
        style={[styles.buttonContainer, fullWidth && styles.fullWidthButton, style]}
        activeOpacity={0.8}
        {...rest}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[buttonStyles, styles.gradientButton]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={[buttonStyles, style]}
      activeOpacity={0.8}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 8,
  },
  gradientButton: {
    backgroundColor: 'transparent',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  successButton: {
    backgroundColor: colors.success,
  },
  errorButton: {
    backgroundColor: colors.error,
  },
  disabledButton: {
    backgroundColor: colors.border,
    borderColor: colors.border,
  },
  fullWidthButton: {
    width: '100%',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: colors.primary,
  },
  textButtonText: {
    color: colors.primary,
  },
  successText: {
    color: '#fff',
  },
  errorText: {
    color: '#fff',
  },
  disabledText: {
    color: colors.textLight,
  },
});

export default Button;