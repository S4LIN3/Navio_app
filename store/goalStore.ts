import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, Milestone } from '@/types';

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'milestones' | 'completed'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  getGoalById: (id: string) => Goal | undefined;
  getGoalsByCategory: (category: Goal['category']) => Goal[];
  addMilestone: (goalId: string, milestone: Omit<Milestone, 'id' | 'completed'>) => void;
  updateMilestone: (goalId: string, milestoneId: string, milestone: Partial<Milestone>) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  toggleMilestoneCompletion: (goalId: string, milestoneId: string) => void;
  updateGoalProgress: (goalId: string) => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      isLoading: false,
      
      addGoal: (goal) => {
        const newGoal: Goal = {
          id: Date.now().toString(),
          progress: 0,
          milestones: [],
          completed: false,
          ...goal,
        };
        
        set((state) => ({
          goals: [newGoal, ...state.goals]
        }));
      },
      
      updateGoal: (id, goal) => {
        set((state) => ({
          goals: state.goals.map((g) => 
            g.id === id ? { ...g, ...goal } : g
          )
        }));
      },
      
      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id)
        }));
      },
      
      getGoalById: (id) => {
        return get().goals.find((g) => g.id === id);
      },
      
      getGoalsByCategory: (category) => {
        return get().goals.filter((g) => g.category === category);
      },
      
      addMilestone: (goalId, milestone) => {
        const newMilestone: Milestone = {
          id: Date.now().toString(),
          completed: false,
          ...milestone,
        };
        
        set((state) => ({
          goals: state.goals.map((g) => 
            g.id === goalId 
              ? { ...g, milestones: [...g.milestones, newMilestone] } 
              : g
          )
        }));
        
        // Update goal progress
        get().updateGoalProgress(goalId);
      },
      
      updateMilestone: (goalId, milestoneId, milestone) => {
        set((state) => ({
          goals: state.goals.map((g) => 
            g.id === goalId 
              ? { 
                  ...g, 
                  milestones: g.milestones.map((m) => 
                    m.id === milestoneId ? { ...m, ...milestone } : m
                  ) 
                } 
              : g
          )
        }));
        
        // Update goal progress
        get().updateGoalProgress(goalId);
      },
      
      deleteMilestone: (goalId, milestoneId) => {
        set((state) => ({
          goals: state.goals.map((g) => 
            g.id === goalId 
              ? { 
                  ...g, 
                  milestones: g.milestones.filter((m) => m.id !== milestoneId) 
                } 
              : g
          )
        }));
        
        // Update goal progress
        get().updateGoalProgress(goalId);
      },
      
      toggleMilestoneCompletion: (goalId, milestoneId) => {
        set((state) => ({
          goals: state.goals.map((g) => 
            g.id === goalId 
              ? { 
                  ...g, 
                  milestones: g.milestones.map((m) => 
                    m.id === milestoneId ? { ...m, completed: !m.completed } : m
                  ) 
                } 
              : g
          )
        }));
        
        // Update goal progress
        get().updateGoalProgress(goalId);
      },
      
      updateGoalProgress: (goalId) => {
        const goal = get().getGoalById(goalId);
        
        if (goal && goal.milestones.length > 0) {
          const completedMilestones = goal.milestones.filter((m) => m.completed).length;
          const progress = Math.round((completedMilestones / goal.milestones.length) * 100);
          const completed = progress === 100;
          
          set((state) => ({
            goals: state.goals.map((g) => 
              g.id === goalId ? { ...g, progress, completed } : g
            )
          }));
        }
      },
    }),
    {
      name: 'pln-goal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);