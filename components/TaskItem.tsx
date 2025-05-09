import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '@/types';
import { CheckCircle, Circle, Clock, Flag } from 'lucide-react-native';
import colors from '@/constants/colors';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onPress?: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onPress,
}) => {
  const priorityColors = {
    low: colors.info,
    medium: colors.warning,
    high: colors.error,
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(task.id)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(task.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {task.completed ? (
          <CheckCircle size={24} color={colors.primary} />
        ) : (
          <Circle size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text 
          style={[
            styles.title,
            task.completed && styles.completedTitle
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        
        {task.description && (
          <Text 
            style={[
              styles.description,
              task.completed && styles.completedDescription
            ]}
            numberOfLines={1}
          >
            {task.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          {task.dueDate && (
            <View style={styles.footerItem}>
              <Clock size={12} color={colors.textSecondary} />
              <Text style={styles.footerText}>
                {formatDate(task.dueDate)}
              </Text>
            </View>
          )}
          
          <View style={styles.footerItem}>
            <Flag size={12} color={priorityColors[task.priority]} />
            <Text 
              style={[
                styles.footerText, 
                { color: priorityColors[task.priority] }
              ]}
            >
              {task.priority}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkbox: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  completedDescription: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
});

export default TaskItem;