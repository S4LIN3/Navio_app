import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput,
  SafeAreaView,
  Modal,
  Linking,
  Alert
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Book, 
  BookOpen, 
  Calendar, 
  Clock, 
  Edit, 
  FileText, 
  Headphones, 
  Heart, 
  Link, 
  Play, 
  Share2, 
  Timer, 
  Trash, 
  Video, 
  X 
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useLearningStore } from '@/store/learningStore';
import { LearningNote, LearningSession } from '@/types';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';

export default function ResourceDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { 
    getResourceById, 
    updateResource, 
    deleteResource, 
    toggleCompletion, 
    favoriteResource,
    updateProgress,
    getSessionsByResourceId,
    getNotesByResourceId,
    addNote,
    deleteNote
  } = useLearningStore();
  
  const resource = getResourceById(id as string);
  const sessions = getSessionsByResourceId(id as string);
  const notes = getNotesByResourceId(id as string);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'notes'>('overview');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addNoteModalVisible, setAddNoteModalVisible] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [activeSession, setActiveSession] = useState<{
    startTime: Date;
    elapsedTime: number;
    timerInterval?: NodeJS.Timeout;
  } | null>(null);
  
  if (!resource) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
          options={{
            title: 'Resource Not Found',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.container}>
          <Text style={styles.errorText}>Resource not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const getTypeIcon = () => {
    switch (resource.type) {
      case 'course':
        return <Video size={20} color={colors.primary} />;
      case 'book':
        return <Book size={20} color={colors.primary} />;
      case 'article':
        return <FileText size={20} color={colors.primary} />;
      case 'podcast':
        return <Headphones size={20} color={colors.primary} />;
      default:
        return <FileText size={20} color={colors.primary} />;
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}m` 
        : `${hours}h`;
    }
  };

  const formatSessionDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteResource = () => {
    Alert.alert(
      'Delete Resource',
      'Are you sure you want to delete this resource? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteResource(resource.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleOpenUrl = async () => {
    if (!resource.url) return;
    
    const canOpen = await Linking.canOpenURL(resource.url);
    if (canOpen) {
      await Linking.openURL(resource.url);
    } else {
      Alert.alert('Error', 'Cannot open this URL');
    }
  };

  const startLearningSession = () => {
    if (activeSession) {
      Alert.alert(
        'Session in Progress',
        'You already have an active learning session.',
        [
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
      return;
    }

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
      startTime: new Date(),
      elapsedTime: 0,
      timerInterval: interval
    });
  };

  const endLearningSession = () => {
    if (!activeSession) return;

    // Clear the interval
    if (activeSession.timerInterval) {
      clearInterval(activeSession.timerInterval);
    }

    // Add the session to the store
    const session: LearningSession = {
      id: Date.now().toString(),
      resourceId: resource.id,
      startTime: activeSession.startTime.toISOString(),
      duration: activeSession.elapsedTime, // in seconds
      notes: '',
    };

    useLearningStore.getState().addSession(session);
    useLearningStore.getState().updateProgress(resource.id, 5); // Increment progress by 5%

    // Reset active session
    setActiveSession(null);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    const note: Omit<LearningNote, 'id' | 'createdAt'> = {
      resourceId: resource.id,
      content: newNote,
    };

    addNote(note);
    setNewNote('');
    setAddNoteModalVisible(false);
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteNote(noteId);
          },
        },
      ]
    );
  };

  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Resource</Text>
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Edit form would go here */}
            <Text style={styles.modalText}>Edit functionality would be implemented here</Text>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setEditModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Save Changes"
              onPress={() => setEditModalVisible(false)}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAddNoteModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addNoteModalVisible}
      onRequestClose={() => setAddNoteModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Note</Text>
            <TouchableOpacity
              onPress={() => setAddNoteModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.noteInput}
              value={newNote}
              onChangeText={setNewNote}
              placeholder="Enter your note here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setAddNoteModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Add Note"
              onPress={handleAddNote}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{resource.description}</Text>
      
      {resource.url && (
        <View style={styles.urlContainer}>
          <Text style={styles.sectionTitle}>Resource URL</Text>
          <TouchableOpacity style={styles.urlButton} onPress={handleOpenUrl}>
            <Link size={16} color={colors.primary} />
            <Text style={styles.urlText} numberOfLines={1}>
              {resource.url}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {resource.reminderDate && (
        <View style={styles.reminderContainer}>
          <Text style={styles.sectionTitle}>Reminder</Text>
          <View style={styles.reminderCard}>
            <Calendar size={16} color={colors.primary} />
            <Text style={styles.reminderText}>{resource.reminderDate}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.actionsContainer}>
        <Button
          title="Start Learning Session"
          onPress={startLearningSession}
          icon={<Play size={16} color="#fff" />}
          style={styles.actionButton}
        />
        
        <View style={styles.actionRow}>
          <Button
            title="Mark as Complete"
            onPress={() => toggleCompletion(resource.id)}
            variant={resource.completed ? 'outline' : 'primary'}
            style={[styles.actionButton, { flex: 1 }]}
          />
          
          <Button
            title="Add Note"
            onPress={() => setAddNoteModalVisible(true)}
            variant="outline"
            style={[styles.actionButton, { flex: 1, marginLeft: 8 }]}
          />
        </View>
      </View>
    </View>
  );

  const renderSessionsTab = () => (
    <View style={styles.tabContent}>
      {activeSession && (
        <View style={styles.activeSessionContainer}>
          <Text style={styles.activeSessionTitle}>Session in Progress</Text>
          <View style={styles.activeSessionTimer}>
            <Timer size={20} color={colors.primary} />
            <Text style={styles.activeSessionTime}>
              {formatSessionDuration(activeSession.elapsedTime)}
            </Text>
          </View>
          <Button
            title="End Session"
            onPress={endLearningSession}
            style={styles.endSessionButton}
          />
        </View>
      )}
      
      <Text style={styles.sectionTitle}>Learning History</Text>
      
      {sessions.length > 0 ? (
        sessions.map((session) => (
          <View key={session.id} style={styles.sessionItem}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionDate}>{formatDate(session.startTime)}</Text>
              <Text style={styles.sessionDuration}>
                {formatSessionDuration(session.duration)}
              </Text>
            </View>
            {session.notes && (
              <Text style={styles.sessionNotes}>{session.notes}</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>
          No learning sessions recorded yet. Start a session to track your progress.
        </Text>
      )}
    </View>
  );

  const renderNotesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.notesHeader}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Button
          title="Add Note"
          onPress={() => setAddNoteModalVisible(true)}
          size="small"
          icon={<Edit size={14} color="#fff" />}
        />
      </View>
      
      {notes.length > 0 ? (
        notes.map((note) => (
          <View key={note.id} style={styles.noteItem}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteNote(note.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
            <Text style={styles.noteContent}>{note.content}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>
          No notes added yet. Add notes to keep track of important information.
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: resource.title,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={() => favoriteResource(resource.id)}
                style={styles.headerButton}
              >
                <Heart 
                  size={24} 
                  color={resource.favorite ? colors.error : colors.text} 
                  fill={resource.favorite ? colors.error : 'none'}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {}}
                style={styles.headerButton}
              >
                <Share2 size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDeleteResource}
                style={styles.headerButton}
              >
                <Trash size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
          {resource.imageUrl ? (
            <Image 
              source={{ uri: resource.imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <BookOpen size={48} color={colors.primary} />
            </View>
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              {getTypeIcon()}
              <Text style={styles.metaText}>{resource.type}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Clock size={20} color={colors.textSecondary} />
              <Text style={styles.metaText}>
                {resource.duration ? formatDuration(resource.duration) : 'No duration set'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.title}>{resource.title}</Text>
          
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{resource.category}</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercentage}>{resource.progress}%</Text>
            </View>
            <ProgressBar 
              progress={resource.progress} 
              height={8} 
              showLabel={false} 
            />
          </View>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Overview
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
              onPress={() => setActiveTab('sessions')}
            >
              <Text style={[styles.tabText, activeTab === 'sessions' && styles.activeTabText]}>
                Sessions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
              onPress={() => setActiveTab('notes')}
            >
              <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
                Notes
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'sessions' && renderSessionsTab()}
          {activeTab === 'notes' && renderNotesTab()}
        </View>
      </ScrollView>

      {renderEditModal()}
      {renderAddNoteModal()}
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
  headerButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  category: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  urlContainer: {
    marginBottom: 24,
  },
  urlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  urlText: {
    fontSize: 14,
    color: colors.primary,
    flex: 1,
  },
  reminderContainer: {
    marginBottom: 24,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  reminderText: {
    fontSize: 14,
    color: colors.text,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
  },
  activeSessionContainer: {
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  activeSessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  activeSessionTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  activeSessionTime: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  endSessionButton: {
    width: '100%',
  },
  sessionItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  sessionDuration: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  sessionNotes: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  noteItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noteContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
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
  modalText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 150,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorButton: {
    width: 200,
    alignSelf: 'center',
  },
});