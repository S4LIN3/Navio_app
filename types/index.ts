// Common types used throughout the app

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
};

export type MoodEntry = {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  note?: string;
  tags?: string[];
};

export type Goal = {
  id: string;
  title: string;
  description?: string;
  category: 'personal' | 'professional' | 'health' | 'learning' | 'financial' | 'social';
  startDate: string;
  endDate: string;
  progress: number; // 0-100
  milestones: Milestone[];
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
};

export type Milestone = {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'personal' | 'work' | 'health' | 'learning' | 'financial' | 'social';
  goalId?: string;
};

export type LearningResource = {
  id: string;
  title: string;
  type: 'course' | 'book' | 'article' | 'video' | 'podcast';
  url?: string;
  description: string;
  category: string;
  completed: boolean;
  progress: number; // 0-100
  duration?: number; // in minutes
  imageUrl?: string;
  favorite?: boolean;
  notes?: string[];
  priority?: 'low' | 'medium' | 'high';
  reminderDate?: string;
};

export type LearningSession = {
  id: string;
  resourceId: string;
  startTime: string;
  duration: number; // in seconds
  notes?: string;
};

export type LearningNote = {
  id: string;
  resourceId: string;
  content: string;
  createdAt: string;
  tags?: string[];
};

// Renamed from Connection to SocialConnection to match the import in index.tsx
export type SocialConnection = {
  id: string;
  name: string;
  relationship: 'family' | 'friend' | 'colleague' | 'acquaintance';
  lastContact?: string;
  contactFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
  avatar?: string;
};

// Adding Connection as an alias for backward compatibility
export type Connection = SocialConnection;

export type FinancialTransaction = {
  id: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  type: 'income' | 'expense';
  isRecurring?: boolean;
};

export type RecurringTransaction = {
  id: string;
  amount: number;
  category: string;
  description?: string;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  lastProcessed: string;
};

export type FinancialGoal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: 'savings' | 'investment' | 'debt' | 'purchase';
};

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'yearly';
};

export type Budget = {
  id: string;
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
  description?: string;
};

export type BudgetCategory = {
  id: string;
  budgetId: string;
  name: string;
  limit: number;
};

export type MotivationalContent = {
  id: string;
  type: 'quote' | 'article' | 'video' | 'podcast';
  title: string;
  content: string;
  author?: string;
  imageUrl?: string;
  url?: string;
  category: string;
};