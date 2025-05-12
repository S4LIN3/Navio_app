import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import colors from '@/constants/colors';

export type ChartDataPoint = {
  name: string;
  value: number;
};

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  data?: ChartDataPoint[];
  type?: 'bar' | 'line' | 'pie';
  style?: any;
  children?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  data,
  type,
  style,
  children,
}) => {
  // Simple rendering of chart data if no children provided
  const renderChart = () => {
    if (children) {
      return children;
    }

    if (!data) {
      return <Text style={styles.noData}>No data available</Text>;
    }

    if (type === 'bar') {
      return (
        <View style={styles.barChart}>
          {data.map((item, index) => (
            <View key={`bar-${item.name}-${index}`} style={styles.barContainer}>
              <Text style={styles.barLabel}>{item.name}</Text>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      width: `${Math.min(100, (item.value / Math.max(...data.map(d => d.value))) * 100)}%`,
                      backgroundColor: colors.primary
                    }
                  ]} 
                />
                <Text style={styles.barValue}>{item.value.toFixed(1)}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    }

    if (type === 'pie') {
      return (
        <View style={styles.pieChart}>
          {data.map((item, index) => (
            <View key={`pie-${item.name}-${index}`} style={styles.pieItem}>
              <View 
                style={[
                  styles.pieColor, 
                  { 
                    backgroundColor: [
                      colors.primary, 
                      colors.secondary, 
                      colors.info, 
                      colors.warning, 
                      colors.error
                    ][index % 5] 
                  }
                ]} 
              />
              <Text style={styles.pieName}>{item.name}</Text>
              <Text style={styles.pieValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      );
    }

    return <Text style={styles.noData}>Unsupported chart type</Text>;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>
    </View>
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
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chartContainer: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noData: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  barChart: {
    width: '100%',
    paddingVertical: 8,
  },
  barContainer: {
    marginBottom: 12,
    width: '100%',
  },
  barLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  bar: {
    height: 20,
    borderRadius: 4,
  },
  barValue: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.text,
  },
  pieChart: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  pieItem: {
    alignItems: 'center',
    marginBottom: 16,
    width: '30%',
  },
  pieColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  pieName: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  pieValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});

export default ChartCard;