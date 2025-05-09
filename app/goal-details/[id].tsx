import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  Modal,
  Alert
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Calendar, 
  CheckCircle2, 
  ChevronLeft, 
  Clock, 
  Flag, 
  Plus, 
  Target, 
  Trash2, 
  X 
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useGoalStore } from '@/store/goalStore';
import { useTaskStore } from '@/store/taskStore';
import { Goal, Milestone, Task } from '@/types';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';
import TaskItem from '@/components/TaskItem';

export default function GoalDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const { 
    getGoalById, 
    updateGoal, 
    deleteGoal, 
    addMilestone, 
    updateMilestone, 
    deleteMilestone, 
    toggleMilestoneCompletion 
  } = useGoalStore();
  
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion, 
    getTasksByGoal 
  } = useTaskStore();
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [goalTasks, setGoalTasks] = useState<Task[]>([]);
  
  const [addMilestoneModalVisible, setAddMilestoneModalVisible] = useState(false);
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  
  // New milestone form state
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');

  useEffect(() => {
    if (id) {
      const goalData = getGoalById(id as string);
      if (goalData) {
        setGoal(goalData);
      }
      
      const tasks = getTasksByGoal(id as string);
      setGoalTasks(tasks);
    }
  }, [id, tasks]);

  if (!goal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
          options={{
            title: 'Goal Details',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerButton}
              >
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.container}>
          <Text style={styles.notFoundText}>Goal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) {
      Alert.alert('Error', 'Please enter a milestone title');
      return;
    }

    addMilestone(goal.id, {
      title: newMilestoneTitle,
      dueDate: newMilestoneDueDate,
    });

    // Reset form
    setNewMilestoneTitle('');
    setNewMilestoneDueDate(new Date().toISOString().split('T')[0]);
    
    setAddMilestoneModalVisible(false);
    
    // Refresh goal data
    const updatedGoal = getGoalById(goal.id);
    if (updatedGoal) {
      setGoal(updatedGoal);
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    addTask({
      title: newTaskTitle,
      description: newTaskDescription,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      category: goal.category,
      goalId: goal.id,
    });

    // Reset form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate(new Date().toISOString().split('T')[0]);
    setNewTaskPriority('medium');
    
    setAddTaskModalVisible(false);
    
    // Refresh tasks
    const updatedTasks = getTasksByGoal(goal.id);
    setGoalTasks(updatedTasks);
  };

  const handleDeleteGoal = () => {
    deleteGoal(goal.id);
    setDeleteConfirmModalVisible(false);
    router.back();
  };

  const handleToggleMilestone = (milestoneId: string) => {
    toggleMilestoneCompletion(goal.id, milestoneId);
    
    // Refresh goal data
    const updatedGoal = getGoalById(goal.id);
    if (updatedGoal) {
      setGoal(updatedGoal);
    }
  };

  const handleToggleTask = (taskId: string) => {
    toggleTaskCompletion(taskId);
    
    // Refresh tasks
    const updatedTasks = getTasksByGoal(goal.id);
    setGoalTasks(updatedTasks);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const daysLeft = () => {
    const today = new Date();
    const endDate = new Date(goal.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const priorityColors = {
    low: colors.info,
    medium: colors.warning,
    high: colors.error,
  };

  const renderAddMilestoneModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addMilestoneModalVisible}
      onRequestClose={() => setAddMilestoneModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Milestone</Text>
            <TouchableOpacity
              onPress={() => setAddMilestoneModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title *</Text>
              <TextInput
                style={styles.formInput}
                value={newMilestoneTitle}
                onChangeText={setNewMilestoneTitle}
                placeholder="Enter milestone title"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Due Date</Text>
              <View style={styles.formDateInput}>
                <Calendar size={16} color={colors.textSecondary} />
                <TextInput
                  style={styles.formDateText}
                  value={newMilestoneDueDate}
                  onChangeText={setNewMilestoneDueDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setAddMilestoneModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Add Milestone"
              onPress={handleAddMilestone}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAddTaskModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addTaskModalVisible}
      onRequestClose={() => setAddTaskModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Task</Text>
            <TouchableOpacity
              onPress={() => setAddTaskModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title *</Text>
              <TextInput
                style={styles.formInput}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="Enter task title"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                placeholder="Enter task description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Due Date</Text>
              <View style={styles.formDateInput}>
                <Calendar size={16} color={colors.textSecondary} />
                <TextInput
                  style={styles.formDateText}
                  value={newTaskDueDate}
                  onChangeText={setNewTaskDueDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.formOptions}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.formOption,
                      newTaskPriority === priority && styles.formOptionSelected,
                    ]}
                    onPress={() => setNewTaskPriority(priority as Task['priority'])}
                  >
                    <Text
                      style={[
                        styles.formOptionText,
                        newTaskPriority === priority && styles.formOptionTextSelected,
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setAddTaskModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Add Task"
              onPress={handleAddTask}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDeleteConfirmModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={deleteConfirmModalVisible}
      onRequestClose={() => setDeleteConfirmModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, styles.confirmModalContainer]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Delete Goal</Text>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this goal? This action cannot be undone.
            </Text>
          </View>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setDeleteConfirmModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Delete"
              onPress={handleDeleteGoal}
              style={{ flex: 1, marginLeft: 8 }}
              gradientColors={colors.gradients.error}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'Goal Details',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setDeleteConfirmModalVisible(true)}
              style={styles.headerButton}
            >
              <Trash2 size={24} color={colors.error} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Target size={24} color={colors.primary} />
            <Text style={styles.title}>{goal.title}</Text>
          </View>
          
          <View 
            style={[
              styles.priorityBadge, 
              { backgroundColor: priorityColors[goal.priority] }
            ]}
          >
            <Text style={styles.priorityText}>{goal.priority}</Text>
          </View>
        </View>
        
        {goal.description && (
          <Text style={styles.description}>{goal.description}</Text>
        )}
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {daysLeft()} days left
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Flag size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              Category: {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <Text style={styles.progressText}>{goal.progress}%</Text>
          </View>
          <ProgressBar progress={goal.progress} height={8} showLabel={false} />
        </View>
        
        <View style={styles.milestonesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAddMilestoneModalVisible(true)}
            >
              <Plus size={16} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {goal.milestones.length > 0 ? (
            <View style={styles.milestonesList}>
              {goal.milestones.map((milestone) => (
                <TouchableOpacity
                  key={milestone.id}
                  style={styles.milestoneItem}
                  onPress={() => handleToggleMilestone(milestone.id)}
                >
                  {milestone.completed ? (
                    <CheckCircle2 size={24} color={colors.success} />
                  ) : (
                    <View style={styles.milestoneCheckbox} />
                  )}
                  
                  <View style={styles.milestoneContent}>
                    <Text 
                      style={[
                        styles.milestoneTitle,
                        milestone.completed && styles.milestoneCompleted
                      ]}
                    >
                      {milestone.title}
                    </Text>
                    
                    <Text style={styles.milestoneDueDate}>
                      Due: {formatDate(milestone.dueDate)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No milestones yet</Text>
            </View>
          )}
        </View>
        
        <View style={styles.tasksContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAddTaskModalVisible(true)}
            >
              <Plus size={16} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {goalTasks.length > 0 ? (
            <View style={styles.tasksList}>
              {goalTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onPress={() => {}}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {renderAddMilestoneModal()}
      {renderAddTaskModal()}
      {renderDeleteConfirmModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerButton: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
    lineHeight: 24,
  },
  infoContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  milestonesContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  milestonesList: {
    gap: 12,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  milestoneCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  milestoneCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  milestoneDueDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tasksContainer: {
    marginBottom: 24,
  },
  tasksList: {
    gap: 8,
  },
  emptyContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: 24,
    width: '90%',
    maxHeight: '80%',
  },
  confirmModalContainer: {
    maxHeight: '40%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  modalContent: {
    padding: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTextarea: {
    minHeight: 100,
    paddingTop: 12,
  },
  formDateInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formDateText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  formOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  formOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  formOptionTextSelected: {
    color: '#fff',
  },
  confirmText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
});