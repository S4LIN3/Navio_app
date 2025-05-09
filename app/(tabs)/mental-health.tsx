import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  Modal,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { Stack } from 'expo-router';
import { 
  Brain, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X,
  TrendingUp,
  BarChart,
  Tag
} from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeInDown,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import colors from '@/constants/colors';
import { useMoodStore } from '@/store/moodStore';
import { MoodEntry } from '@/types';
import MoodPicker from '@/components/MoodPicker';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/Card';
import * as Haptics from 'expo-haptics';

// Animated components
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function MentalHealthScreen() {
  const { entries, addEntry } = useMoodStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addMoodModalVisible, setAddMoodModalVisible] = useState(false);
  const [selectedMoodEntry, setSelectedMoodEntry] = useState<MoodEntry | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'insights'>('calendar');
  const scrollY = useSharedValue(0);
  
  // New mood entry form state
  const [newMood, setNewMood] = useState<MoodEntry['mood']>('neutral');
  const [newNote, setNewNote] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const getMonthName = useCallback((date: Date) => {
    return date.toLocaleString('default', { month: 'long' });
  }, []);

  const getYear = useCallback((date: Date) => {
    return date.getFullYear();
  }, []);

  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, []);

  const getPreviousMonth = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [selectedDate]);

  const getNextMonth = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [selectedDate]);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  const getMoodForDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return entries.find(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      return entryDate === dateString;
    });
  }, [entries]);

  const getMoodColor = useCallback((mood?: MoodEntry['mood']) => {
    return mood ? colors.mood[mood] : 'transparent';
  }, []);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !newTags.includes(tagInput.trim())) {
      setNewTags([...newTags, tagInput.trim()]);
      setTagInput('');
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [tagInput, newTags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setNewTags(newTags.filter(t => t !== tag));
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [newTags]);

  const handleAddMoodEntry = useCallback(() => {
    addEntry({
      date: new Date().toISOString(),
      mood: newMood,
      note: newNote,
      tags: newTags,
    });

    // Reset form
    setNewMood('neutral');
    setNewNote('');
    setNewTags([]);
    
    setAddMoodModalVisible(false);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [addEntry, newMood, newNote, newTags]);

  const handleDayPress = useCallback((date: Date) => {
    const moodEntry = getMoodForDate(date);
    if (moodEntry) {
      setSelectedMoodEntry(moodEntry);
    } else if (isToday(date) || date <= new Date()) {
      // Only allow adding mood for today or past days
      setNewMood('neutral');
      setNewNote('');
      setNewTags([]);
      setAddMoodModalVisible(true);
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [getMoodForDate, isToday]);

  // Get mood statistics
  const moodStats = useMemo(() => {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        goodDays: 0,
        taggedEntries: 0,
        averageMood: 'No data',
        moodCounts: {
          terrible: 0,
          bad: 0,
          neutral: 0,
          good: 0,
          great: 0
        },
        commonTags: []
      };
    }
    
    const moodCounts = {
      terrible: 0,
      bad: 0,
      neutral: 0,
      good: 0,
      great: 0
    };
    
    const tagCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      // Count moods
      moodCounts[entry.mood]++;
      
      // Count tags
      if (entry.tags) {
        entry.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // Get most common tags
    const commonTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
    
    // Calculate average mood
    const moodScores: Record<string, number> = {
      'terrible': 1,
      'bad': 2,
      'neutral': 3,
      'good': 4,
      'great': 5,
    };
    
    const sum = entries.reduce((acc, entry) => acc + moodScores[entry.mood], 0);
    const average = sum / entries.length;
    
    let averageMood = 'No data';
    if (average >= 4.5) averageMood = 'Great';
    else if (average >= 3.5) averageMood = 'Good';
    else if (average >= 2.5) averageMood = 'Neutral';
    else if (average >= 1.5) averageMood = 'Bad';
    else averageMood = 'Terrible';
    
    return {
      totalEntries: entries.length,
      goodDays: entries.filter(entry => entry.mood === 'good' || entry.mood === 'great').length,
      taggedEntries: entries.filter(entry => entry.tags && entry.tags.length > 0).length,
      averageMood,
      moodCounts,
      commonTags
    };
  }, [entries]);

  // Scroll handler for animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const renderAddMoodModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addMoodModalVisible}
      onRequestClose={() => setAddMoodModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>How are you feeling?</Text>
            <TouchableOpacity
              onPress={() => setAddMoodModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            style={styles.modalContent}
            data={[
              // Using array to leverage FlatList's performance
              { key: 'moodPicker', component: 
                <View style={styles.moodPickerContainer}>
                  <MoodPicker
                    selectedMood={newMood}
                    onSelectMood={setNewMood}
                    size="large"
                  />
                </View>
              },
              { key: 'notes', component:
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Notes</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextarea]}
                    value={newNote}
                    onChangeText={setNewNote}
                    placeholder="How are you feeling today? What's on your mind?"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              },
              { key: 'tags', component:
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tags</Text>
                  <View style={styles.tagInputContainer}>
                    <TextInput
                      style={styles.tagInput}
                      value={tagInput}
                      onChangeText={setTagInput}
                      placeholder="Add tags (e.g., work, family, exercise)"
                      placeholderTextColor={colors.textSecondary}
                      onSubmitEditing={handleAddTag}
                    />
                    <TouchableOpacity
                      style={styles.addTagButton}
                      onPress={handleAddTag}
                    >
                      <Plus size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.tagsContainer}>
                    {newTags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveTag(tag)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <X size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              }
            ]}
            renderItem={({ item }) => item.component}
            keyExtractor={item => item.key}
          />

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setAddMoodModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Save"
              onPress={handleAddMoodEntry}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderMoodEntryModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={!!selectedMoodEntry}
      onRequestClose={() => setSelectedMoodEntry(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mood Details</Text>
            <TouchableOpacity
              onPress={() => setSelectedMoodEntry(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedMoodEntry && (
            <View style={styles.modalContent}>
              <View style={styles.moodDetailHeader}>
                <View 
                  style={[
                    styles.moodDetailIcon, 
                    { backgroundColor: getMoodColor(selectedMoodEntry.mood) }
                  ]}
                />
                <View style={styles.moodDetailInfo}>
                  <Text style={styles.moodDetailTitle}>
                    {selectedMoodEntry.mood.charAt(0).toUpperCase() + selectedMoodEntry.mood.slice(1)}
                  </Text>
                  <Text style={styles.moodDetailDate}>
                    {new Date(selectedMoodEntry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              </View>

              {selectedMoodEntry.note && (
                <View style={styles.moodDetailSection}>
                  <Text style={styles.moodDetailSectionTitle}>Notes</Text>
                  <Text style={styles.moodDetailNote}>{selectedMoodEntry.note}</Text>
                </View>
              )}

              {selectedMoodEntry.tags && selectedMoodEntry.tags.length > 0 && (
                <View style={styles.moodDetailSection}>
                  <Text style={styles.moodDetailSectionTitle}>Tags</Text>
                  <View style={styles.moodDetailTags}>
                    {selectedMoodEntry.tags.map(tag => (
                      <View key={tag} style={styles.moodDetailTag}>
                        <Text style={styles.moodDetailTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={styles.modalFooter}>
            <Button
              title="Close"
              onPress={() => setSelectedMoodEntry(null)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCalendarView = () => {
    const days = getDaysInMonth(selectedDate);
    
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={getPreviousMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.calendarNavButton}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.calendarTitle}>
            {getMonthName(selectedDate)} {getYear(selectedDate)}
          </Text>
          
          <TouchableOpacity
            onPress={getNextMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.calendarNavButton}
          >
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekdaysContainer}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.weekdayText}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.daysContainer}>
          {days.map((date, index) => {
            const moodEntry = getMoodForDate(date);
            const moodColor = getMoodColor(moodEntry?.mood);
            
            // Add empty slots for proper alignment
            const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
            const emptySlots = [];
            if (index === 0) {
              for (let i = 0; i < firstDayOfMonth; i++) {
                emptySlots.push(
                  <View key={`empty-${i}`} style={styles.emptyDayContainer} />
                );
              }
            }
            
            return (
              <React.Fragment key={date.toString()}>
                {index === 0 && emptySlots}
                <AnimatedTouchableOpacity
                  entering={FadeIn.duration(300).delay(index * 10)}
                  style={[
                    styles.dayContainer,
                    isToday(date) && styles.todayContainer,
                  ]}
                  onPress={() => handleDayPress(date)}
                  disabled={date > new Date()} // Disable future dates
                >
                  <Text
                    style={[
                      styles.dayText,
                      isToday(date) && styles.todayText,
                      date > new Date() && styles.futureDayText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  {moodEntry && (
                    <View
                      style={[
                        styles.moodIndicator,
                        { backgroundColor: moodColor },
                      ]}
                    />
                  )}
                </AnimatedTouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  };

  const renderListView = () => {
    if (entries.length === 0) {
      return (
        <EmptyState
          title="No Mood Entries"
          message="Start tracking your mood to see patterns and insights."
          icon={<Brain size={40} color={colors.primary} />}
          actionLabel="Add Mood"
          onAction={() => setAddMoodModalVisible(true)}
        />
      );
    }
    
    return (
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.duration(400).delay(index * 50)}
            style={styles.entryCard}
          >
            <TouchableOpacity 
              style={styles.entryCardContent}
              onPress={() => setSelectedMoodEntry(item)}
            >
              <View style={styles.entryHeader}>
                <View
                  style={[
                    styles.entryMoodIndicator,
                    { backgroundColor: getMoodColor(item.mood) },
                  ]}
                />
                <Text style={styles.entryMood}>
                  {item.mood.charAt(0).toUpperCase() + item.mood.slice(1)}
                </Text>
                <Text style={styles.entryDate}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              
              {item.note && (
                <Text 
                  style={styles.entryNote}
                  numberOfLines={2}
                >
                  {item.note}
                </Text>
              )}
              
              {item.tags && item.tags.length > 0 && (
                <View style={styles.entryTagsContainer}>
                  {item.tags.map((tag) => (
                    <View key={tag} style={styles.entryTag}>
                      <Text style={styles.entryTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
        contentContainerStyle={styles.entriesListContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderInsightsView = () => {
    return (
      <FlatList
        data={[
          { key: 'summary', component: 
            <Card style={styles.insightCard}>
              <Text style={styles.insightCardTitle}>Mood Summary</Text>
              <View style={styles.moodStatsContainer}>
                <View style={styles.moodStatItem}>
                  <Text style={styles.moodStatValue}>
                    {moodStats.totalEntries}
                  </Text>
                  <Text style={styles.moodStatLabel}>
                    Total Entries
                  </Text>
                </View>
                
                <View style={styles.moodStatItem}>
                  <Text style={styles.moodStatValue}>
                    {moodStats.goodDays}
                  </Text>
                  <Text style={styles.moodStatLabel}>
                    Good Days
                  </Text>
                </View>
                
                <View style={styles.moodStatItem}>
                  <Text style={styles.moodStatValue}>
                    {moodStats.averageMood}
                  </Text>
                  <Text style={styles.moodStatLabel}>
                    Average Mood
                  </Text>
                </View>
              </View>
            </Card>
          },
          { key: 'distribution', component:
            <Card style={styles.insightCard}>
              <Text style={styles.insightCardTitle}>Mood Distribution</Text>
              <View style={styles.moodDistributionContainer}>
                {Object.entries(moodStats.moodCounts).map(([mood, count]) => (
                  <View key={mood} style={styles.moodDistributionItem}>
                    <View style={styles.moodDistributionBarContainer}>
                      <View 
                        style={[
                          styles.moodDistributionBar,
                          { 
                            backgroundColor: getMoodColor(mood as MoodEntry['mood']),
                            height: entries.length > 0 
                              ? `${(count / entries.length) * 100}%` 
                              : 0
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.moodDistributionLabel}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </Text>
                    <Text style={styles.moodDistributionCount}>{count}</Text>
                  </View>
                ))}
              </View>
            </Card>
          },
          { key: 'tags', component:
            <Card style={styles.insightCard}>
              <Text style={styles.insightCardTitle}>Common Tags</Text>
              {moodStats.commonTags.length > 0 ? (
                <View style={styles.commonTagsContainer}>
                  {moodStats.commonTags.map(tag => (
                    <View key={tag} style={styles.commonTag}>
                      <Tag size={14} color={colors.primary} />
                      <Text style={styles.commonTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>No tags found</Text>
              )}
            </Card>
          },
          { key: 'tips', component:
            <Card style={styles.insightCard}>
              <Text style={styles.insightCardTitle}>Mood Tips</Text>
              <View style={styles.tipsContainer}>
                <View style={styles.tipItem}>
                  <Text style={styles.tipTitle}>Track Consistently</Text>
                  <Text style={styles.tipText}>
                    Log your mood daily to identify patterns and triggers.
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Text style={styles.tipTitle}>Use Tags</Text>
                  <Text style={styles.tipText}>
                    Add tags to connect moods with activities and situations.
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Text style={styles.tipTitle}>Reflect Weekly</Text>
                  <Text style={styles.tipText}>
                    Review your mood trends weekly to gain insights.
                  </Text>
                </View>
              </View>
            </Card>
          }
        ]}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.duration(400).delay(index * 100)}
            style={styles.insightItem}
          >
            {item.component}
          </Animated.View>
        )}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.insightsContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Stack.Screen
        options={{
          title: 'Mental Health',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setAddMoodModalVisible(true)}
              style={styles.headerButton}
            >
              <Plus size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity 
            style={[
              styles.viewToggleButton,
              viewMode === 'calendar' && styles.viewToggleButtonActive
            ]}
            onPress={() => setViewMode('calendar')}
          >
            <Calendar 
              size={18} 
              color={viewMode === 'calendar' ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.viewToggleText,
                viewMode === 'calendar' && styles.viewToggleTextActive
              ]}
            >
              Calendar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.viewToggleButton,
              viewMode === 'list' && styles.viewToggleButtonActive
            ]}
            onPress={() => setViewMode('list')}
          >
            <Brain 
              size={18} 
              color={viewMode === 'list' ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.viewToggleText,
                viewMode === 'list' && styles.viewToggleTextActive
              ]}
            >
              Entries
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.viewToggleButton,
              viewMode === 'insights' && styles.viewToggleButtonActive
            ]}
            onPress={() => setViewMode('insights')}
          >
            <BarChart 
              size={18} 
              color={viewMode === 'insights' ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.viewToggleText,
                viewMode === 'insights' && styles.viewToggleTextActive
              ]}
            >
              Insights
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {viewMode === 'calendar' && renderCalendarView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'insights' && renderInsightsView()}
        </View>
      </View>

      {renderAddMoodModal()}
      {renderMoodEntryModal()}
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
    flex: 1,
    padding: 16,
  },
  headerButton: {
    marginRight: 16,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    margin: 16,
    padding: 4,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: `rgba(67, 97, 238, ${colors.opacity.light})`,
  },
  viewToggleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  viewToggleTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  calendarContainer: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  emptyDayContainer: {
    width: 40,
    height: 40,
  },
  todayContainer: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
  },
  todayText: {
    color: '#fff',
    fontWeight: '600',
  },
  futureDayText: {
    color: colors.textLight,
  },
  moodIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moodSummaryContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  moodLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  moodLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moodLegendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  moodLegendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moodStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodStatItem: {
    alignItems: 'center',
  },
  moodStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  moodStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  entriesListContent: {
    paddingBottom: 24,
  },
  entryCard: {
    marginBottom: 12,
  },
  entryCardContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryMoodIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  entryMood: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  entryDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  entryNote: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  entryTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  entryTag: {
    backgroundColor: `rgba(67, 97, 238, ${colors.opacity.light})`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  entryTagText: {
    fontSize: 12,
    color: colors.primary,
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
  moodPickerContainer: {
    marginBottom: 24,
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
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: colors.border,
  },
  addTagButton: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#fff',
  },
  moodDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  moodDetailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  moodDetailInfo: {
    flex: 1,
  },
  moodDetailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  moodDetailDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  moodDetailSection: {
    marginBottom: 24,
  },
  moodDetailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  moodDetailNote: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  moodDetailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodDetailTag: {
    backgroundColor: `rgba(67, 97, 238, ${colors.opacity.light})`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  moodDetailTagText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  insightsContent: {
    paddingBottom: 24,
  },
  insightItem: {
    marginBottom: 16,
  },
  insightCard: {
    padding: 16,
  },
  insightCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  moodDistributionContainer: {
    flexDirection: 'row',
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  moodDistributionItem: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  moodDistributionBarContainer: {
    width: 24,
    height: '80%',
    backgroundColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  moodDistributionBar: {
    width: '100%',
    borderRadius: 12,
  },
  moodDistributionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  moodDistributionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  commonTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  commonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `rgba(67, 97, 238, ${colors.opacity.light})`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
  },
  commonTagText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  tipsContainer: {
    gap: 16,
  },
  tipItem: {
    backgroundColor: `rgba(67, 97, 238, ${colors.opacity.light})`,
    padding: 16,
    borderRadius: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});