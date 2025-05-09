import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotivationalContent } from '@/types';

interface MotivationState {
  content: MotivationalContent[];
  favorites: string[]; // IDs of favorited content
  isLoading: boolean;
  addContent: (content: Omit<MotivationalContent, 'id'>) => void;
  updateContent: (id: string, content: Partial<MotivationalContent>) => void;
  deleteContent: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getContentById: (id: string) => MotivationalContent | undefined;
  getContentByType: (type: MotivationalContent['type']) => MotivationalContent[];
  getContentByCategory: (category: string) => MotivationalContent[];
  getFavoriteContent: () => MotivationalContent[];
  getRandomContent: (type?: MotivationalContent['type']) => MotivationalContent | undefined;
}

export const useMotivationStore = create<MotivationState>()(
  persist(
    (set, get) => ({
      content: [],
      favorites: [],
      isLoading: false,
      
      addContent: (content) => {
        const newContent: MotivationalContent = {
          id: Date.now().toString(),
          ...content,
        };
        
        set((state) => ({
          content: [newContent, ...state.content]
        }));
      },
      
      updateContent: (id, content) => {
        set((state) => ({
          content: state.content.map((c) => 
            c.id === id ? { ...c, ...content } : c
          )
        }));
      },
      
      deleteContent: (id) => {
        set((state) => ({
          content: state.content.filter((c) => c.id !== id),
          favorites: state.favorites.filter((favId) => favId !== id)
        }));
      },
      
      toggleFavorite: (id) => {
        set((state) => {
          const isFavorite = state.favorites.includes(id);
          
          return {
            favorites: isFavorite
              ? state.favorites.filter((favId) => favId !== id)
              : [...state.favorites, id]
          };
        });
      },
      
      getContentById: (id) => {
        return get().content.find((c) => c.id === id);
      },
      
      getContentByType: (type) => {
        return get().content.filter((c) => c.type === type);
      },
      
      getContentByCategory: (category) => {
        return get().content.filter((c) => c.category === category);
      },
      
      getFavoriteContent: () => {
        const { content, favorites } = get();
        return content.filter((c) => favorites.includes(c.id));
      },
      
      getRandomContent: (type) => {
        const filteredContent = type 
          ? get().content.filter((c) => c.type === type)
          : get().content;
          
        if (filteredContent.length === 0) return undefined;
        
        const randomIndex = Math.floor(Math.random() * filteredContent.length);
        return filteredContent[randomIndex];
      },
    }),
    {
      name: 'pln-motivation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);