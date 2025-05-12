import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LearningResource, LearningSession, LearningNote } from '@/types';

interface LearningState {
  resources: LearningResource[];
  sessions: LearningSession[];
  notes: LearningNote[];
  isLoading: boolean;
  
  // Resource actions
  addResource: (resource: Omit<LearningResource, 'id' | 'progress' | 'completed' | 'favorite' | 'createdAt'>) => void;
  updateResource: (id: string, updates: Partial<LearningResource>) => void;
  deleteResource: (id: string) => void;
  favoriteResource: (id: string) => void;
  updateProgress: (id: string, increment: number) => void;
  markAsCompleted: (id: string, completed: boolean) => void;
  
  // Session actions
  addSession: (session: LearningSession) => void;
  updateSession: (id: string, updates: Partial<LearningSession>) => void;
  deleteSession: (id: string) => void;
  
  // Note actions
  addNote: (note: Omit<LearningNote, 'id' | 'createdAt'>) => void;
  updateNote: (id: string, updates: Partial<LearningNote>) => void;
  deleteNote: (id: string) => void;
  
  // Utility functions
  getFavorites: () => LearningResource[];
  getResourcesByCategory: (category: string) => LearningResource[];
  getResourcesByType: (type: LearningResource['type']) => LearningResource[];
  getSessionsByResource: (resourceId: string) => LearningSession[];
  getNotesByResource: (resourceId: string) => LearningNote[];
  getTotalLearningTime: () => number;
  getWeeklyLearningTime: () => {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  
  // Helper function for generating unique IDs
  generateId: (prefix: string) => string;
}

// Helper function to generate unique IDs
const generateUniqueId = (prefix: string = '') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      resources: [],
      sessions: [],
      notes: [],
      isLoading: false,
      
      // Resource actions
      addResource: (resource) => {
        const newResource: LearningResource = {
          id: generateUniqueId('resource'),
          progress: 0,
          completed: false,
          favorite: false,
          createdAt: new Date().toISOString(),
          ...resource,
        };
        
        set((state) => ({
          resources: [...state.resources, newResource],
        }));
      },
      
      updateResource: (id, updates) => {
        set((state) => ({
          resources: state.resources.map((resource) =>
            resource.id === id ? { ...resource, ...updates } : resource
          ),
        }));
      },
      
      deleteResource: (id) => {
        set((state) => ({
          resources: state.resources.filter((resource) => resource.id !== id),
          sessions: state.sessions.filter((session) => session.resourceId !== id),
          notes: state.notes.filter((note) => note.resourceId !== id),
        }));
      },
      
      favoriteResource: (id) => {
        set((state) => ({
          resources: state.resources.map((resource) =>
            resource.id === id
              ? { ...resource, favorite: !resource.favorite }
              : resource
          ),
        }));
      },
      
      updateProgress: (id, increment) => {
        set((state) => ({
          resources: state.resources.map((resource) =>
            resource.id === id
              ? {
                  ...resource,
                  progress: Math.min(100, resource.progress + increment),
                  completed: resource.progress + increment >= 100,
                }
              : resource
          ),
        }));
      },
      
      markAsCompleted: (id, completed) => {
        set((state) => ({
          resources: state.resources.map((resource) =>
            resource.id === id
              ? { ...resource, completed, progress: completed ? 100 : resource.progress }
              : resource
          ),
        }));
      },
      
      // Session actions
      addSession: (session) => {
        set((state) => ({
          sessions: [...state.sessions, session],
        }));
      },
      
      updateSession: (id, updates) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, ...updates } : session
          ),
        }));
      },
      
      deleteSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== id),
        }));
      },
      
      // Note actions
      addNote: (note) => {
        const newNote: LearningNote = {
          id: generateUniqueId('note'),
          createdAt: new Date().toISOString(),
          ...note,
        };
        
        set((state) => ({
          notes: [...state.notes, newNote],
        }));
      },
      
      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates } : note
          ),
        }));
      },
      
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },
      
      // Utility functions
      getFavorites: () => {
        return get().resources.filter((resource) => resource.favorite);
      },
      
      getResourcesByCategory: (category) => {
        return get().resources.filter((resource) => resource.category === category);
      },
      
      getResourcesByType: (type) => {
        return get().resources.filter((resource) => resource.type === type);
      },
      
      getSessionsByResource: (resourceId) => {
        return get().sessions.filter((session) => session.resourceId === resourceId);
      },
      
      getNotesByResource: (resourceId) => {
        return get().notes.filter((note) => note.resourceId === resourceId);
      },
      
      getTotalLearningTime: () => {
        return get().sessions.reduce((total, session) => total + session.duration, 0);
      },
      
      getWeeklyLearningTime: () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        
        const weeklyTime = {
          sunday: 0,
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
        };
        
        get().sessions.forEach((session) => {
          const sessionDate = new Date(session.startTime);
          if (sessionDate >= startOfWeek) {
            const day = sessionDate.getDay();
            switch (day) {
              case 0:
                weeklyTime.sunday += session.duration;
                break;
              case 1:
                weeklyTime.monday += session.duration;
                break;
              case 2:
                weeklyTime.tuesday += session.duration;
                break;
              case 3:
                weeklyTime.wednesday += session.duration;
                break;
              case 4:
                weeklyTime.thursday += session.duration;
                break;
              case 5:
                weeklyTime.friday += session.duration;
                break;
              case 6:
                weeklyTime.saturday += session.duration;
                break;
            }
          }
        });
        
        return weeklyTime;
      },
      
      // Helper function for generating unique IDs
      generateId: (prefix: string) => generateUniqueId(prefix),
    }),
    {
      name: 'learning-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);