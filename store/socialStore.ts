import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocialConnection } from '@/types';

interface SocialState {
  connections: SocialConnection[];
  isLoading: boolean;
  addConnection: (connection: Omit<SocialConnection, 'id'>) => void;
  updateConnection: (id: string, connection: Partial<SocialConnection>) => void;
  deleteConnection: (id: string) => void;
  updateLastContact: (id: string, date?: string) => void;
  getConnectionById: (id: string) => SocialConnection | undefined;
  getConnectionsByRelationship: (relationship: SocialConnection['relationship']) => SocialConnection[];
  getConnectionsDueForContact: () => SocialConnection[];
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      connections: [],
      isLoading: false,
      
      addConnection: (connection) => {
        const newConnection: SocialConnection = {
          id: Date.now().toString(),
          ...connection,
        };
        
        set((state) => ({
          connections: [newConnection, ...state.connections]
        }));
      },
      
      updateConnection: (id, connection) => {
        set((state) => ({
          connections: state.connections.map((c) => 
            c.id === id ? { ...c, ...connection } : c
          )
        }));
      },
      
      deleteConnection: (id) => {
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== id)
        }));
      },
      
      updateLastContact: (id, date = new Date().toISOString()) => {
        set((state) => ({
          connections: state.connections.map((c) => 
            c.id === id ? { ...c, lastContact: date } : c
          )
        }));
      },
      
      getConnectionById: (id) => {
        return get().connections.find((c) => c.id === id);
      },
      
      getConnectionsByRelationship: (relationship) => {
        return get().connections.filter((c) => c.relationship === relationship);
      },
      
      getConnectionsDueForContact: () => {
        const now = new Date();
        
        return get().connections.filter((connection) => {
          if (!connection.lastContact) return true;
          
          const lastContact = new Date(connection.lastContact);
          const daysSinceLastContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
          
          switch (connection.contactFrequency) {
            case 'daily':
              return daysSinceLastContact >= 1;
            case 'weekly':
              return daysSinceLastContact >= 7;
            case 'monthly':
              return daysSinceLastContact >= 30;
            case 'quarterly':
              return daysSinceLastContact >= 90;
            case 'yearly':
              return daysSinceLastContact >= 365;
            default:
              return false;
          }
        });
      },
    }),
    {
      name: 'pln-social-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);