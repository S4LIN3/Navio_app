import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { Stack } from 'expo-router';
import { 
  ArrowUpRight, 
  Brain, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Target, 
  Users,
  BookOpen,
  DollarSign
} from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeIn,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import colors from '@/constants/colors';
import { useGoalStore } from '@/store/goalStore';
import { useMoodStore } from '@/store/moodStore';
import { useTaskStore } from '@/store/taskStore';
import { useSocialStore } from '@/store/socialStore';
import { useMotivationStore } from '@/store/motivationStore';
import { Goal, MoodEntry, Task, SocialConnection } from '@/types';
import ProgressBar from '@/components/ProgressBar';
import GoalCard from '@/components/GoalCard';
import TaskItem from '@/components/TaskItem';
import MotivationalCard from '@/components/MotivationalCard';
import StatCard from '@/components/StatCard';
import Card from '@/components/Card';
import { useUserStore } from '@/store/userStore';
import { allMotivationalContent } from '@/mocks/motivationalContent';

// Use Animated FlatList for smoother animations
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [dailyQuote, setDailyQuote] = useState(allMotivationalContent[0]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const scrollY = useSharedValue(0);

  const { user } = useUserStore();
  const { goals } = useGoalStore();
  const { entries: moodEntries } = useMoodStore();
  const { tasks } = useTaskStore();
  const { connections } = useSocialStore();
  const { content, favorites: storedFavorites, toggleFavorite, addContent } = useMotivationStore();

  // Initialize with mock data if empty
  useEffect(() => {
    if (content.length === 0) {
      allMotivationalContent.forEach(item => {
        addContent(item);
      });
    }
    
    // Set random daily quote
    const quotes = allMotivationalContent.filter(item => item.type === 'quote');
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setDailyQuote(quotes[randomIndex]);
    
    setFavorites(storedFavorites);
  }, [storedFavorites]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  const getInProgressGoals = useCallback(() => {
    return goals.filter(goal => !goal.completed).slice(0, 2);
  }, [goals]);

  const getRecentMoodEntries = useCallback(() => {
    return moodEntries.slice(0, 5);
  }, [moodEntries]);

  const getUpcomingTasks = useCallback(() => {
    const pendingTasks = tasks.filter(task => !task.completed);
    
    // Sort by due date (if available)
    return pendingTasks
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 3);
  }, [tasks]);

  const getConnectionsDueForContact = useCallback(() => {
    return connections.filter(connection => {
      if (!connection.lastContact) return true;
      
      const lastContact = new Date(connection.lastContact);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastContact.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      switch (connection.contactFrequency) {
        case 'daily':
          return diffDays >= 1;
        case 'weekly':
          return diffDays >= 7;
        case 'monthly':
          return diffDays >= 30;
        case 'quarterly':
          return diffDays >= 90;
        case 'yearly':
          return diffDays >= 365;
        default:
          return false;
      }
    }).slice(0, 3);
  }, [connections]);

  const getProductivityScore = useCallback(() => {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.completed);
    return Math.round((completedTasks.length / tasks.length) * 100);
  }, [tasks]);

  const getAverageMood = useCallback(() => {
    if (moodEntries.length === 0) return 'No data';
    
    const moodScores: Record<string, number> = {
      'terrible': 1,
      'bad': 2,
      'neutral': 3,
      'good': 4,
      'great': 5,
    };
    
    const sum = moodEntries.reduce((acc, entry) => acc + moodScores[entry.mood], 0);
    const average = sum / moodEntries.length;
    
    if (average >= 4.5) return 'Great';
    if (average >= 3.5) return 'Good';
    if (average >= 2.5) return 'Neutral';
    if (average >= 1.5) return 'Bad';
    return 'Terrible';
  }, [moodEntries]);

  const getMoodTrend = useCallback(() => {
    if (moodEntries.length < 2) return { value: 0, isPositive: true };
    
    const moodScores: Record<string, number> = {
      'terrible': 1,
      'bad': 2,
      'neutral': 3,
      'good': 4,
      'great': 5,
    };
    
    // Get last 7 entries or all if less than 7
    const recentEntries = moodEntries.slice(0, Math.min(7, moodEntries.length));
    const olderEntries = moodEntries.slice(Math.min(7, moodEntries.length), Math.min(14, moodEntries.length));
    
    if (olderEntries.length === 0) return { value: 0, isPositive: true };
    
    const recentAvg = recentEntries.reduce((acc, entry) => acc + moodScores[entry.mood], 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((acc, entry) => acc + moodScores[entry.mood], 0) / olderEntries.length;
    
    const percentChange = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
    
    return {
      value: Math.abs(percentChange),
      isPositive: percentChange >= 0,
    };
  }, [moodEntries]);

  const getGoalProgress = useCallback(() => {
    if (goals.length === 0) return 0;
    
    const totalProgress = goals.reduce((acc, goal) => acc + goal.progress, 0);
    return Math.round(totalProgress / goals.length);
  }, [goals]);

  const getGoalTrend = useCallback(() => {
    // This would ideally compare current progress to previous period
    // For now, just return a placeholder
    return { value: 5, isPositive: true };
  }, []);

  const getSocialScore = useCallback(() => {
    if (connections.length === 0) return 0;
    
    const dueConnections = getConnectionsDueForContact();
    const onTrackPercentage = ((connections.length - dueConnections.length) / connections.length) * 100;
    
    return Math.round(onTrackPercentage);
  }, [connections, getConnectionsDueForContact]);

  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(dailyQuote.id);
  }, [dailyQuote.id, toggleFavorite]);

  const handleToggleTask = useCallback((id: string) => {
    // This would be implemented in the task store
  }, []);

  const formatDate = useCallback(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  // Scroll handler for animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Render a section header with icon
  const renderSectionHeader = useCallback(({ title, icon, onSeeAll }: { title: string, icon: React.ReactNode, onSeeAll?: () => void }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      
      {onSeeAll && (
        <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
          <ChevronRight size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  ), []);

  // Render a connection item
  const renderConnectionItem = useCallback(({ connection }: { connection: SocialConnection }) => (
    <TouchableOpacity 
      key={connection.id}
      style={styles.connectionItem}
    >
      <View style={styles.connectionAvatar}>
        <Text style={styles.connectionInitials}>
          {connection.name.charAt(0)}
        </Text>
      </View>
      
      <View style={styles.connectionDetails}>
        <Text style={styles.connectionName}>{connection.name}</Text>
        <Text style={styles.connectionFrequency}>
          {connection.contactFrequency} contact
        </Text>
      </View>
      
      <ArrowUpRight size={16} color={colors.primary} />
    </TouchableOpacity>
  ), []);

  // Render a quick action button
  const renderQuickAction = useCallback(({ icon, title, color, onPress }: { icon: React.ReactNode, title: string, color: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}${colors.opacity.light}` }]}>
        {icon}
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  ), []);

  // Render list items for FlatList
  const renderItem = useCallback(({ item, index }: { item: any, index: number }) => {
    // Apply staggered animation for each item
    const delay = index * 100;
    
    if (Platform.OS === 'web') {
      return (
        <View style={styles.listItem}>
          {item}
        </View>
      );
    }
    
    return (
      <Animated.View 
        style={styles.listItem}
        entering={FadeInDown.duration(400).delay(delay)}
      >
        {item}
      </Animated.View>
    );
  }, []);

  // Create list data for FlatList
  const listData = React.useMemo(() => {
    const data = [];
    
    // Header section
    data.push(
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {user?.name || 'there'}!
        </Text>
        <Text style={styles.date}>{formatDate()}</Text>
      </View>
    );
    
    // Stats section
    data.push(
      <View style={styles.statsContainer}>
        <StatCard
          title="Mood"
          value={getAverageMood()}
          icon={<Brain size={16} color={colors.primary} />}
          trend={getMoodTrend()}
          style={styles.statCard}
        />
        
        <StatCard
          title="Goals"
          value={`${getGoalProgress()}%`}
          icon={<Target size={16} color={colors.primary} />}
          trend={getGoalTrend()}
          style={styles.statCard}
        />
        
        <StatCard
          title="Social"
          value={`${getSocialScore()}%`}
          icon={<Users size={16} color={colors.primary} />}
          trend={{ value: 0, isPositive: true }}
          style={styles.statCard}
        />
      </View>
    );
    
    // Quick actions
    data.push(
      <View style={styles.quickActionsContainer}>
        {renderQuickAction({ 
          icon: <Target size={20} color={colors.primary} />, 
          title: "Add Goal", 
          color: colors.primary,
          onPress: () => {} 
        })}
        {renderQuickAction({ 
          icon: <CheckCircle2 size={20} color={colors.success} />, 
          title: "New Task", 
          color: colors.success,
          onPress: () => {} 
        })}
        {renderQuickAction({ 
          icon: <Brain size={20} color={colors.secondary} />, 
          title: "Log Mood", 
          color: colors.secondary,
          onPress: () => {} 
        })}
        {renderQuickAction({ 
          icon: <BookOpen size={20} color={colors.info} />, 
          title: "Learn", 
          color: colors.info,
          onPress: () => {} 
        })}
      </View>
    );
    
    // Quote of the day
    data.push(
      <View style={styles.quoteContainer}>
        <MotivationalCard
          content={dailyQuote}
          isFavorite={favorites.includes(dailyQuote.id)}
          onPress={() => {}}
          onToggleFavorite={handleToggleFavorite}
        />
      </View>
    );
    
    // Goals section
    data.push(
      <View style={styles.sectionContainer}>
        {renderSectionHeader({ 
          title: "Goals in Progress", 
          icon: <Target size={20} color={colors.primary} />,
          onSeeAll: () => {}
        })}
        
        {getInProgressGoals().length > 0 ? (
          getInProgressGoals().map((goal: Goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))
        ) : (
          <Card style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>No goals in progress</Text>
          </Card>
        )}
      </View>
    );
    
    // Tasks section
    data.push(
      <View style={styles.sectionContainer}>
        {renderSectionHeader({ 
          title: "Upcoming Tasks", 
          icon: <CheckCircle2 size={20} color={colors.primary} />,
          onSeeAll: () => {}
        })}
        
        {getUpcomingTasks().length > 0 ? (
          getUpcomingTasks().map((task: Task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggle={handleToggleTask}
            />
          ))
        ) : (
          <Card style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>No upcoming tasks</Text>
          </Card>
        )}
      </View>
    );
    
    // Connections section
    data.push(
      <View style={styles.sectionContainer}>
        {renderSectionHeader({ 
          title: "Connections Due", 
          icon: <Users size={20} color={colors.primary} />,
          onSeeAll: () => {}
        })}
        
        {getConnectionsDueForContact().length > 0 ? (
          <Card style={styles.connectionsContainer} padding="none">
            {getConnectionsDueForContact().map((connection) => (
              renderConnectionItem({ connection })
            ))}
          </Card>
        ) : (
          <Card style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>No connections due for contact</Text>
          </Card>
        )}
      </View>
    );
    
    return data;
  }, [
    user, formatDate, getAverageMood, getMoodTrend, getGoalProgress, 
    getGoalTrend, getSocialScore, dailyQuote, favorites, handleToggleFavorite,
    getInProgressGoals, getUpcomingTasks, getConnectionsDueForContact,
    renderSectionHeader, renderConnectionItem, renderQuickAction, handleToggleTask
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Stack.Screen 
        options={{ 
          title: 'Dashboard',
          headerLargeTitle: true,
        }} 
      />
      
      <AnimatedFlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(_, index) => `item-${index}`}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  listItem: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionButton: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  quoteContainer: {
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyStateCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  connectionsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  connectionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  connectionInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  connectionDetails: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  connectionFrequency: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
});