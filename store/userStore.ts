import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

interface UserState {
  user: User | null;
  isOnboarded: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  setOnboarded: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isOnboarded: false,
      isLoading: true,
      
      setUser: (user) => set({ user }),
      
      updateUser: (userData) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        })),
      
      setOnboarded: (value) => set({ isOnboarded: value }),
      
      setLoading: (value) => set({ isLoading: value }),
      
      logout: () => set({ user: null, isOnboarded: false }),
    }),
    {
      name: 'pln-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);