import React, { useState } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import { 
  Calendar, 
  CheckCircle2, 
  ChevronDown, 
  Filter, 
  Plus, 
  Search, 
  Target, 
  X 
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useGoalStore } from '@/store/goalStore';
import { Goal } from '@/types';
import GoalCard from '@/components/GoalCard';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';

export default function GoalsScreen() {
  const router = useRouter();
  const { goals, addGoal } = useGoalStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [addGoalModalVisible, setAddGoalModalVisible] = useState(false);
  
  // New goal form state
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<Goal['category']>('personal');
  const [newGoalPriority, setNewGoalPriority] = useState<Goal['priority']>('medium');
  const [newGoalStartDate, setNewGoalStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newGoalEndDate, setNewGoalEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const categories: Goal['category'][] = [
    'personal',
    'professional',
    'health',
    'learning',
    'financial',
    'social',
  ];

  const priorities: Goal['priority'][] = ['low', 'medium', 'high'];

  const filteredGoals = goals.filter((goal) => {
    // Search filter
    if (
      searchQuery &&
      !goal.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !goal.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (categoryFilter && goal.category !== categoryFilter) {
      return false;
    }

    // Status filter
    if (
      statusFilter === 'completed' && !goal.completed ||
      statusFilter === 'in-progress' && goal.completed
    ) {
      return false;
    }

    // Priority filter
    if (priorityFilter && goal.priority !== priorityFilter) {
      return false;
    }

    return true;
  });

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    addGoal({
      title: newGoalTitle,
      description: newGoalDescription,
      category: newGoalCategory,
      priority: newGoalPriority,
      startDate: newGoalStartDate,
      endDate: newGoalEndDate,
    });

    // Reset form
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalCategory('personal');
    setNewGoalPriority('medium');
    setNewGoalStartDate(new Date().toISOString().split('T')[0]);
    setNewGoalEndDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );

    setAddGoalModalVisible(false);
  };

  const resetFilters = () => {
    setCategoryFilter(null);
    setStatusFilter('all');
    setPriorityFilter(null);
    setFilterModalVisible(false);
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Goals</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                {['all', 'in-progress', 'completed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      statusFilter === status && styles.filterOptionSelected,
                    ]}
                    onPress={() => setStatusFilter(status as any)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        statusFilter === status && styles.filterOptionTextSelected,
                      ]}
                    >
                      {status === 'all' ? 'All' : status === 'in-progress' ? 'In Progress' : 'Completed'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.filterOptions}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterOption,
                      categoryFilter === category && styles.filterOptionSelected,
                    ]}
                    onPress={() => setCategoryFilter(categoryFilter === category ? null : category)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        categoryFilter === category && styles.filterOptionTextSelected,
                      ]}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Priority</Text>
              <View style={styles.filterOptions}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.filterOption,
                      priorityFilter === priority && styles.filterOptionSelected,
                    ]}
                    onPress={() => setPriorityFilter(priorityFilter === priority ? null : priority)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        priorityFilter === priority && styles.filterOptionTextSelected,
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
              title="Reset"
              onPress={resetFilters}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Apply Filters"
              onPress={applyFilters}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAddGoalModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addGoalModalVisible}
      onRequestClose={() => setAddGoalModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Goal</Text>
            <TouchableOpacity
              onPress={() => setAddGoalModalVisible(false)}
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
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
                placeholder="Enter goal title"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                value={newGoalDescription}
                onChangeText={setNewGoalDescription}
                placeholder="Enter goal description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.formSelect}>
                <Text style={styles.formSelectText}>
                  {newGoalCategory.charAt(0).toUpperCase() + newGoalCategory.slice(1)}
                </Text>
                <ChevronDown size={16} color={colors.textSecondary} />
              </View>
              <View style={styles.formOptions}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.formOption,
                      newGoalCategory === category && styles.formOptionSelected,
                    ]}
                    onPress={() => setNewGoalCategory(category)}
                  >
                    <Text
                      style={[
                        styles.formOptionText,
                        newGoalCategory === category && styles.formOptionTextSelected,
                      ]}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.formOptions}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.formOption,
                      newGoalPriority === priority && styles.formOptionSelected,
                    ]}
                    onPress={() => setNewGoalPriority(priority)}
                  >
                    <Text
                      style={[
                        styles.formOptionText,
                        newGoalPriority === priority && styles.formOptionTextSelected,
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Start Date</Text>
                <View style={styles.formDateInput}>
                  <Calendar size={16} color={colors.textSecondary} />
                  <TextInput
                    style={styles.formDateText}
                    value={newGoalStartDate}
                    onChangeText={setNewGoalStartDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>End Date</Text>
                <View style={styles.formDateInput}>
                  <Calendar size={16} color={colors.textSecondary} />
                  <TextInput
                    style={styles.formDateText}
                    value={newGoalEndDate}
                    onChangeText={setNewGoalEndDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setAddGoalModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Add Goal"
              onPress={handleAddGoal}
              style={{ flex: 1, marginLeft: 8 }}
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
          title: 'Goals',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setAddGoalModalVisible(true)}
              style={styles.headerButton}
            >
              <Plus size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search goals..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Filter size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {filteredGoals.length > 0 ? (
          <ScrollView
            style={styles.goalsContainer}
            contentContainerStyle={styles.goalsContent}
          >
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onPress={() => router.push(`/goal-details/${goal.id}`)}
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyState
            title="No Goals Found"
            message={
              searchQuery || categoryFilter || statusFilter !== 'all' || priorityFilter
                ? "Try adjusting your filters or search query."
                : "You haven't created any goals yet. Tap the + button to add your first goal."
            }
            icon={<Target size={40} color={colors.primary} />}
            actionLabel="Add Goal"
            onAction={() => setAddGoalModalVisible(true)}
          />
        )}
      </View>

      {renderFilterModal()}
      {renderAddGoalModal()}
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
    padding: 16,
  },
  headerButton: {
    marginRight: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalsContainer: {
    flex: 1,
  },
  goalsContent: {
    paddingBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  modalContent: {
    paddingHorizontal: 24,
    maxHeight: '70%',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  filterOptionTextSelected: {
    color: '#fff',
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
  formSelect: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formSelectText: {
    fontSize: 16,
    color: colors.text,
  },
  formOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
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
});