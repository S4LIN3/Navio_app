import { LearningResource } from '@/types';

export const learningResources: Omit<LearningResource, 'id' | 'completed' | 'progress' | 'favorite' | 'notes'>[] = [
  {
    title: 'Introduction to React Native',
    type: 'course',
    description: 'Learn the fundamentals of React Native development, including components, state management, and navigation.',
    category: 'Programming',
    duration: 480, // 8 hours
    imageUrl: 'https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    priority: 'high',
    reminderDate: '2023-12-15',
  },
  {
    title: 'Financial Independence: The Ultimate Guide',
    type: 'book',
    description: 'A comprehensive guide to achieving financial independence through smart investing, budgeting, and wealth building strategies.',
    category: 'Finance',
    duration: 720, // 12 hours
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80',
    priority: 'medium',
  },
  {
    title: 'The Science of Meditation',
    type: 'article',
    description: 'Explore the scientific research behind meditation and its effects on the brain, stress reduction, and overall well-being.',
    category: 'Health',
    duration: 30,
    imageUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    priority: 'low',
  },
  {
    title: 'Advanced TypeScript Patterns',
    type: 'video',
    description: 'Learn advanced TypeScript patterns and techniques to improve your code quality and developer experience.',
    category: 'Programming',
    duration: 120, // 2 hours
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    url: 'https://www.youtube.com/watch?v=example',
    priority: 'medium',
  },
  {
    title: 'The Future of Artificial Intelligence',
    type: 'podcast',
    description: 'A discussion on the future of AI, its potential impacts on society, and ethical considerations.',
    category: 'Technology',
    duration: 90, // 1.5 hours
    imageUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    url: 'https://example.com/podcast/ai-future',
    priority: 'high',
  },
  {
    title: 'Effective Communication Skills',
    type: 'course',
    description: 'Develop essential communication skills for professional and personal success, including active listening, conflict resolution, and persuasive speaking.',
    category: 'Personal Development',
    duration: 360, // 6 hours
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    priority: 'medium',
  },
  {
    title: 'Sustainable Living: A Practical Guide',
    type: 'book',
    description: 'Learn practical ways to reduce your environmental footprint and live a more sustainable lifestyle.',
    category: 'Environment',
    duration: 480, // 8 hours
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    priority: 'low',
  },
  {
    title: 'The Psychology of Habit Formation',
    type: 'article',
    description: 'Understand the science behind habit formation and learn strategies to build positive habits and break negative ones.',
    category: 'Psychology',
    duration: 25,
    imageUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    priority: 'medium',
  },
];