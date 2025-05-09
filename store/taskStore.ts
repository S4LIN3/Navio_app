import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '@/types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getTasksByCategory: (category: Task['category']) => Task[];
  getTasksByGoal: (goalId: string) => Task[];
  getCompletedTasks: () => Task[];
  getPendingTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      
      addTask: (task) => {
        const newTask: Task = {
          id: Date.now().toString(),
          completed: false,
          ...task,
        };
        
        set((state) => ({
          tasks: [newTask, ...state.tasks]
        }));
      },
      
      updateTask: (id, task) => {
        set((state) => ({
          tasks: state.tasks.map((t) => 
            t.id === id ? { ...t, ...task } : t
          )
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id)
        }));
      },
      
      toggleTaskCompletion: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) => 
            t.id === id ? { ...t, completed: !t.completed } : t
          )
        }));
      },
      
      getTaskById: (id) => {
        return get().tasks.find((t) => t.id === id);
      },
      
      getTasksByCategory: (category) => {
        return get().tasks.filter((t) => t.category === category);
      },
      
      getTasksByGoal: (goalId) => {
        return get().tasks.filter((t) => t.goalId === goalId);
      },
      
      getCompletedTasks: () => {
        return get().tasks.filter((t) => t.completed);
      },
      
      getPendingTasks: () => {
        return get().tasks.filter((t) => !t.completed);
      },
    }),
    {
      name: 'pln-task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);