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
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  BookOpen, 
  Filter, 
  Plus, 
  Search, 
  X, 
  Clock,
  BarChart3,
  Bell,
  Heart,
  Share2,
  BookMarked,
  Timer
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useLearningStore } from '@/store/learningStore';
import { LearningResource, LearningSession } from '@/types';
import ResourceCard from '@/components/ResourceCard';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import { learningResources } from '@/mocks/learningResources';
import ChartCard from '@/components/ChartCard';

export default function LearningScreen() {
  const router = useRouter();
  const { 
    resources, 
    addResource, 
    isLoading, 
    favoriteResource, 
    getFavorites,
    sessions,
    getTotalLearningTime,
    getWeeklyLearningTime,
    generateId
  } = useLearningStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<LearningResource['type'] | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [addResourceModalVisible, setAddResourceModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'analytics'>('all');
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [activeSession, setActiveSession] = useState<{
    resourceId: string;
    startTime: Date;
    elapsedTime: number;
    timerInterval?: NodeJS.Timeout;
  } | null>(null);
  
  // New resource form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<LearningResource['type']>('course');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newReminder, setNewReminder] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Initialize with mock data if empty
  useEffect(() => {
    if (resources.length === 0) {
      learningResources.forEach(resource => {
        addResource(resource);
      });
    }
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (activeSession?.timerInterval) {
        clearInterval(activeSession.timerInterval);
      }
    };
  }, [activeSession]);

  const resourceTypes: LearningResource['type'][] = [
    'course',
    'book',
    'article',
    'video',
    'podcast',
  ];

  const categories = Array.from(
    new Set(resources.map((resource) => resource.category))
  );

  const filteredResources = resources.filter((resource) => {
    // If we're on favorites tab, only show favorites
    if (activeTab === 'favorites' && !resource.favorite) {
      return false;
    }

    // Search filter
    if (
      searchQuery &&
      !resource.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (categoryFilter && resource.category !== categoryFilter) {
      return false;
    }

    // Type filter
    if (typeFilter && resource.type !== typeFilter) {
      return false;
    }

    // Status filter
    if (
      statusFilter === 'completed' && !resource.completed ||
      statusFilter === 'in-progress' && resource.completed
    ) {
      return false;
    }

    return true;
  });

  const favorites = getFavorites();

  const handleAddResource = () => {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!newCategory.trim()) {
      Alert.alert('Error', 'Please enter a category');
      return;
    }

    addResource({
      title: newTitle,
      type: newType,
      description: newDescription,
      category: newCategory,
      url: newUrl || undefined,
      duration: newDuration ? parseInt(newDuration) : undefined,
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      priority: newPriority,
      reminderDate: newReminder || undefined,
    });

    // Reset form
    setNewTitle('');
    setNewType('course');
    setNewDescription('');
    setNewCategory('');
    setNewDuration('');
    setNewUrl('');
    setNewReminder('');
    setNewPriority('medium');

    setAddResourceModalVisible(false);
  };

  const resetFilters = () => {
    setCategoryFilter(null);
    setTypeFilter(null);
    setStatusFilter('all');
    setFilterModalVisible(false);
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  const startLearningSession = (resourceId: string) => {
    if (activeSession) {
      Alert.alert(
        'Session in Progress',
        'You already have an active learning session. Would you like to end it and start a new one?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'End & Start New',
            onPress: () => {
              endLearningSession();
              initializeNewSession(resourceId);
            },
          },
        ]
      );
    } else {
      initializeNewSession(resourceId);
    }
  };

  const initializeNewSession = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    const interval = setInterval(() => {
      setActiveSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          elapsedTime: Math.floor((new Date().getTime() - prev.startTime.getTime()) / 1000)
        };
      });
    }, 1000);

    setActiveSession({
      resourceId,
      startTime: new Date(),
      elapsedTime: 0,
      timerInterval: interval
    });

    setTimerModalVisible(true);
  };

  const endLearningSession = () => {
    if (!activeSession) return;

    // Clear the interval
    if (activeSession.timerInterval) {
      clearInterval(activeSession.timerInterval);
    }

    // Add the session to the store
    const { resourceId, startTime, elapsedTime } = activeSession;
    const session: LearningSession = {
      id: generateId('session'),
      resourceId,
      startTime: startTime.toISOString(),
      duration: elapsedTime, // in seconds
      notes: '',
    };

    useLearningStore.getState().addSession(session);
    useLearningStore.getState().updateProgress(resourceId, 5); // Increment progress by 5%

    // Reset active session
    setActiveSession(null);
    setTimerModalVisible(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
            <Text style={styles.modalTitle}>Filter Resources</Text>
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
                    key={`status-${status}`}
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
              <Text style={styles.filterSectionTitle}>Type</Text>
              <View style={styles.filterOptions}>
                {resourceTypes.map((type) => (
                  <TouchableOpacity
                    key={`type-${type}`}
                    style={[
                      styles.filterOption,
                      typeFilter === type && styles.filterOptionSelected,
                    ]}
                    onPress={() => setTypeFilter(typeFilter === type ? null : type)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        typeFilter === type && styles.filterOptionTextSelected,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
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
                    key={`category-${category}`}
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
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Priority</Text>
              <View style={styles.filterOptions}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={`priority-${priority}`}
                    style={[
                      styles.filterOption,
                      getPriorityStyle(priority),
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        styles.filterOptionTextSelected,
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

  // Helper function to get priority style
  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'low':
        return styles.priorityLow;
      case 'medium':
        return styles.priorityMedium;
      case 'high':
        return styles.priorityHigh;
      default:
        return {};
    }
  };

  const renderAddResourceModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addResourceModalVisible}
      onRequestClose={() => setAddResourceModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Learning Resource</Text>
            <TouchableOpacity
              onPress={() => setAddResourceModalVisible(false)}
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
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Enter resource title"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Type</Text>
              <View style={styles.formOptions}>
                {resourceTypes.map((type) => (
                  <TouchableOpacity
                    key={`form-type-${type}`}
                    style={[
                      styles.formOption,
                      newType === type && styles.formOptionSelected,
                    ]}
                    onPress={() => setNewType(type)}
                  >
                    <Text
                      style={[
                        styles.formOptionText,
                        newType === type && styles.formOptionTextSelected,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder="Enter resource description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category *</Text>
              <TextInput
                style={styles.formInput}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="Enter category (e.g., Finance, Health)"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.formInput}
                value={newDuration}
                onChangeText={setNewDuration}
                placeholder="Enter duration in minutes"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>URL</Text>
              <TextInput
                style={styles.formInput}
                value={newUrl}
                onChangeText={setNewUrl}
                placeholder="Enter resource URL"
                placeholderTextColor={colors.textSecondary}
                keyboardType="url"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Set Reminder (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.formInput}
                value={newReminder}
                onChangeText={setNewReminder}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.formOptions}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={`form-priority-${priority}`}
                    style={[
                      styles.formOption,
                      newPriority === priority && styles.formOptionSelected,
                      newPriority === priority && getPriorityStyle(priority),
                    ]}
                    onPress={() => setNewPriority(priority as 'low' | 'medium' | 'high')}
                  >
                    <Text
                      style={[
                        styles.formOptionText,
                        newPriority === priority && styles.formOptionTextSelected,
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
              onPress={() => setAddResourceModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Add Resource"
              onPress={handleAddResource}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTimerModal = () => {
    if (!activeSession) return null;
    
    const resource = resources.find(r => r.id === activeSession.resourceId);
    if (!resource) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={timerModalVisible}
        onRequestClose={() => {
          Alert.alert(
            'End Session?',
            'Do you want to end this learning session?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'End Session',
                onPress: endLearningSession,
              },
            ]
          );
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Learning Session</Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'End Session?',
                    'Do you want to end this learning session?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'End Session',
                        onPress: endLearningSession,
                      },
                    ]
                  );
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.timerContainer}>
              <Text style={styles.timerResourceTitle}>{resource.title}</Text>
              <View style={styles.timerCircle}>
                <Timer size={32} color={colors.primary} style={styles.timerIcon} />
                <Text style={styles.timerText}>{formatTime(activeSession.elapsedTime)}</Text>
              </View>
              <Text style={styles.timerLabel}>Time Elapsed</Text>

              <Button
                title="End Session"
                onPress={endLearningSession}
                style={styles.endSessionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderAnalytics = () => {
    const totalTime = getTotalLearningTime();
    const weeklyTime = getWeeklyLearningTime();
    const resourcesByType = resourceTypes.map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: resources.filter(r => r.type === type).length
    }));

    const completionRate = resources.length > 0 
      ? Math.round((resources.filter(r => r.completed).length / resources.length) * 100) 
      : 0;

    const weeklyData = [
      { name: 'Mon', value: weeklyTime.monday / 60 },
      { name: 'Tue', value: weeklyTime.tuesday / 60 },
      { name: 'Wed', value: weeklyTime.wednesday / 60 },
      { name: 'Thu', value: weeklyTime.thursday / 60 },
      { name: 'Fri', value: weeklyTime.friday / 60 },
      { name: 'Sat', value: weeklyTime.saturday / 60 },
      { name: 'Sun', value: weeklyTime.sunday / 60 },
    ];

    return (
      <View style={styles.analyticsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(totalTime / 60)}</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>

        <ChartCard
          title="Weekly Learning (Hours)"
          data={weeklyData}
          type="bar"
          style={styles.chart}
        />

        <ChartCard
          title="Resources by Type"
          data={resourcesByType}
          type="pie"
          style={styles.chart}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading resources...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'Learning Resources',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setAddResourceModalVisible(true)}
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
              placeholder="Search resources..."
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

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <BookOpen size={16} color={activeTab === 'all' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
          >
            <Heart size={16} color={activeTab === 'favorites' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>Favorites</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
            onPress={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} color={activeTab === 'analytics' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'analytics' ? (
          renderAnalytics()
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{resources.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {resources.filter(r => r.completed).length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {resources.filter(r => !r.completed).length}
                </Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
            </View>

            {activeTab === 'favorites' && favorites.length === 0 ? (
              <EmptyState
                title="No Favorites Yet"
                message="Mark resources as favorites to see them here."
                icon={<Heart size={40} color={colors.primary} />}
                actionLabel="Browse Resources"
                onAction={() => setActiveTab('all')}
              />
            ) : filteredResources.length > 0 ? (
              <ScrollView
                style={styles.resourcesContainer}
                contentContainerStyle={styles.resourcesContent}
                showsVerticalScrollIndicator={false}
              >
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={`resource-${resource.id}`}
                    resource={resource}
                    onPress={() => router.push(`/resource-details/${resource.id}`)}
                    onFavorite={() => favoriteResource(resource.id)}
                    onStartSession={() => startLearningSession(resource.id)}
                  />
                ))}
              </ScrollView>
            ) : (
              <EmptyState
                title="No Resources Found"
                message={
                  searchQuery || categoryFilter || typeFilter || statusFilter !== 'all'
                    ? "Try adjusting your filters or search query."
                    : "You haven't added any learning resources yet. Tap the + button to add your first resource."
                }
                icon={<BookOpen size={40} color={colors.primary} />}
                actionLabel="Add Resource"
                onAction={() => setAddResourceModalVisible(true)}
              />
            )}
          </>
        )}
      </View>

      {renderFilterModal()}
      {renderAddResourceModal()}
      {renderTimerModal()}
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
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resourcesContainer: {
    flex: 1,
  },
  resourcesContent: {
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
  priorityLow: {
    backgroundColor: colors.info,
    borderColor: colors.info,
  },
  priorityMedium: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  priorityHigh: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  analyticsContainer: {
    flex: 1,
  },
  chart: {
    marginBottom: 16,
    height: 200,
  },
  timerContainer: {
    padding: 24,
    alignItems: 'center',
  },
  timerResourceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timerIcon: {
    marginBottom: 8,
  },
  timerText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  timerLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  endSessionButton: {
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
});