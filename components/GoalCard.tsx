import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Goal } from '@/types';
import ProgressBar from './ProgressBar';
import { Calendar, CheckCircle2, Clock, Flag } from 'lucide-react-native';
import colors from '@/constants/colors';

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
  compact?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onPress,
  compact = false,
}) => {
  const priorityColors = {
    low: colors.info,
    medium: colors.warning,
    high: colors.error,
  };

  const categoryIcons = {
    personal: <Flag size={16} color={colors.primary} />,
    professional: <CheckCircle2 size={16} color={colors.primary} />,
    health: <CheckCircle2 size={16} color={colors.success} />,
    learning: <CheckCircle2 size={16} color={colors.info} />,
    financial: <CheckCircle2 size={16} color={colors.warning} />,
    social: <CheckCircle2 size={16} color={colors.error} />,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const daysLeft = () => {
    const today = new Date();
    const endDate = new Date(goal.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderCompactView = () => (
    <TouchableOpacity
      style={[styles.container, styles.compactContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{goal.title}</Text>
        <View 
          style={[
            styles.priorityBadge, 
            { backgroundColor: priorityColors[goal.priority] }
          ]}
        />
      </View>
      
      <ProgressBar 
        progress={goal.progress} 
        height={4} 
        showLabel={false} 
      />
      
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Clock size={12} color={colors.textSecondary} />
          <Text style={styles.footerText}>
            {daysLeft()} days left
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFullView = () => (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {categoryIcons[goal.category]}
          <Text style={styles.title}>{goal.title}</Text>
        </View>
        <View 
          style={[
            styles.priorityBadge, 
            { backgroundColor: priorityColors[goal.priority] }
          ]}
        />
      </View>
      
      {goal.description && (
        <Text style={styles.description} numberOfLines={2}>
          {goal.description}
        </Text>
      )}
      
      <View style={styles.progressContainer}>
        <ProgressBar 
          progress={goal.progress} 
          height={6} 
          showLabel={true} 
        />
      </View>
      
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={styles.footerText}>
            {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
          </Text>
        </View>
        
        <View style={styles.footerItem}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.footerText}>
            {daysLeft()} days left
          </Text>
        </View>
      </View>
      
      {goal.milestones.length > 0 && (
        <View style={styles.milestonesContainer}>
          <Text style={styles.milestonesTitle}>
            Milestones: {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return compact ? renderCompactView() : renderFullView();
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
    marginBottom: 12,
  },
  compactContainer: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  priorityBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  milestonesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  milestonesTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});

export default GoalCard;