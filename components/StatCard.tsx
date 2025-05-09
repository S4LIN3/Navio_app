import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import colors from '@/constants/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  style?: ViewStyle;
  animated?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  style,
  animated = true,
}) => {
  const Container = (animated && Platform.OS !== 'web') ? Animated.View : View;
  const animationProps = (animated && Platform.OS !== 'web') 
    ? { entering: FadeIn.duration(400).delay(100) } 
    : {};

  return (
    <Container 
      style={[styles.container, style]}
      {...animationProps}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
      
      <Text style={styles.value}>{value}</Text>
      
      {trend && (
        <View 
          style={[
            styles.trendContainer,
            { 
              backgroundColor: trend.isPositive 
                ? `rgba(16, 185, 129, ${colors.opacity.light})` 
                : `rgba(239, 68, 68, ${colors.opacity.light})` 
            }
          ]}
        >
          <Text 
            style={[
              styles.trendValue,
              { 
                color: trend.isPositive 
                  ? colors.success 
                  : colors.error 
              }
            ]}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </Text>
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `rgba(67, 97, 238, ${colors.opacity.light})`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  trendContainer: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatCard;