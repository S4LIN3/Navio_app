import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Check, ChevronRight } from 'lucide-react-native';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import { useUserStore } from '@/store/userStore';

export default function OnboardingScreen() {
  const { setOnboarded, setUser } = useUserStore();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  const goals = [
    { id: '1', title: 'Improve mental health', icon: '🧠' },
    { id: '2', title: 'Increase productivity', icon: '⏱️' },
    { id: '3', title: 'Develop better habits', icon: '📝' },
    { id: '4', title: 'Enhance social connections', icon: '👥' },
    { id: '5', title: 'Learn new skills', icon: '📚' },
    { id: '6', title: 'Manage finances better', icon: '💰' },
    { id: '7', title: 'Improve physical health', icon: '💪' },
    { id: '8', title: 'Reduce stress', icon: '🧘' },
  ];

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter(goalId => goalId !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const completeOnboarding = () => {
    // Create user
    setUser({
      id: Date.now().toString(),
      name: name,
      email: '',
      createdAt: new Date().toISOString(),
    });
    
    // Mark as onboarded
    setOnboarded(true);
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Welcome to Your Personal Life Navigator</Text>
      <Text style={styles.stepDescription}>
        Your comprehensive companion for navigating life's journey with purpose and balance.
      </Text>
      
      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>🧠</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Mental Health Tracking</Text>
            <Text style={styles.featureDescription}>
              Monitor your mood and emotional well-being
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>🎯</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Goal Setting & Tracking</Text>
            <Text style={styles.featureDescription}>
              Set SMART goals and track your progress
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>👥</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Social Connection Management</Text>
            <Text style={styles.featureDescription}>
              Nurture meaningful relationships
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>💰</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Financial Planning</Text>
            <Text style={styles.featureDescription}>
              Track expenses and plan your financial future
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <KeyboardAvoidingView 
      style={styles.stepContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Text style={styles.stepTitle}>Let's Get to Know You</Text>
      <Text style={styles.stepDescription}>
        We'll personalize your experience based on your information.
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>What should we call you?</Text>
        <TextInput
          style={styles.formInput}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={colors.textSecondary}
          autoFocus
        />
      </View>
    </KeyboardAvoidingView>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What are your goals?</Text>
      <Text style={styles.stepDescription}>
        Select the areas you'd like to focus on. You can change these later.
      </Text>
      
      <ScrollView style={styles.goalsContainer}>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalItem,
              selectedGoals.includes(goal.id) && styles.goalItemSelected,
            ]}
            onPress={() => toggleGoal(goal.id)}
          >
            <View style={styles.goalIcon}>
              <Text style={styles.goalIconText}>{goal.icon}</Text>
            </View>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            {selectedGoals.includes(goal.id) && (
              <View style={styles.goalCheckmark}>
                <Check size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={['rgba(74, 111, 165, 0.1)', 'rgba(74, 111, 165, 0)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.stepIndicatorContainer}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.stepIndicator,
                  s === step && styles.stepIndicatorActive,
                  s < step && styles.stepIndicatorCompleted,
                ]}
              />
            ))}
          </View>
          
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
        <View style={styles.footer}>
          <Button
            title={step === 3 ? "Get Started" : "Continue"}
            onPress={handleNext}
            icon={<ArrowRight size={20} color="#fff" />}
            iconPosition="right"
            disabled={step === 2 && !name.trim()}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  stepIndicatorActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  stepIndicatorCompleted: {
    backgroundColor: colors.primary,
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  featureList: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  formInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalsContainer: {
    flex: 1,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(74, 111, 165, 0.05)',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  goalIconText: {
    fontSize: 20,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  goalCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 24,
  },
});