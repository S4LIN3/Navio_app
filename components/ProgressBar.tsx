import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ViewStyle, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring
} from 'react-native-reanimated';
import colors from '@/constants/colors';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  width?: number | string;
  showLabel?: boolean;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  labelStyle?: ViewStyle;
  animated?: boolean;
  duration?: number;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  width = '100%',
  showLabel = false,
  color = colors.primary,
  backgroundColor = colors.border,
  style,
  labelStyle,
  animated = true,
  duration = 500,
  showPercentage = true,
}) => {
  // Ensure progress is between 0-100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  // For animation
  const progressWidth = useSharedValue(0);
  
  useEffect(() => {
    if (animated && Platform.OS !== 'web') {
      progressWidth.value = withSpring(clampedProgress, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      progressWidth.value = clampedProgress;
    }
  }, [clampedProgress, animated, progressWidth]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });
  
  // For web or when animations are disabled
  if (Platform.OS === 'web' || !animated) {
    return (
      <View style={[styles.container, { width }, style]}>
        <View 
          style={[
            styles.progressContainer, 
            { height, backgroundColor }
          ]}
        >
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${clampedProgress}%`, 
                height, 
                backgroundColor: color 
              }
            ]} 
          />
        </View>
        
        {showLabel && (
          <Text style={[styles.label, labelStyle]}>
            {showPercentage ? `${Math.round(clampedProgress)}%` : ''}
          </Text>
        )}
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { width }, style]}>
      <View 
        style={[
          styles.progressContainer, 
          { height, backgroundColor }
        ]}
      >
        <Animated.View 
          style={[
            styles.progressBar, 
            { height, backgroundColor: color },
            animatedStyle
          ]} 
        />
      </View>
      
      {showLabel && (
        <Text style={[styles.label, labelStyle]}>
          {showPercentage ? `${Math.round(clampedProgress)}%` : ''}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressContainer: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    minWidth: 36,
    textAlign: 'right',
  },
});

export default ProgressBar;