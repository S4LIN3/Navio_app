import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '@/types';

interface MoodState {
  entries: MoodEntry[];
  isLoading: boolean;
  addEntry: (entry: Omit<MoodEntry, 'id'>) => void;
  updateEntry: (id: string, entry: Partial<MoodEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntryById: (id: string) => MoodEntry | undefined;
  getEntriesByDateRange: (startDate: string, endDate: string) => MoodEntry[];
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      
      addEntry: (entry) => {
        const newEntry: MoodEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          ...entry,
        };
        
        set((state) => ({
          entries: [newEntry, ...state.entries]
        }));
      },
      
      updateEntry: (id, entry) => {
        set((state) => ({
          entries: state.entries.map((e) => 
            e.id === id ? { ...e, ...entry } : e
          )
        }));
      },
      
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id)
        }));
      },
      
      getEntryById: (id) => {
        return get().entries.find((e) => e.id === id);
      },
      
      getEntriesByDateRange: (startDate, endDate) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        
        return get().entries.filter((entry) => {
          const entryDate = new Date(entry.date).getTime();
          return entryDate >= start && entryDate <= end;
        });
      },
    }),
    {
      name: 'pln-mood-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);