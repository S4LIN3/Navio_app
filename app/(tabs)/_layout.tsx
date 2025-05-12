import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { BlurView } from "expo-blur";
import { 
  Home, 
  BarChart, 
  Target, 
  Brain, 
  Users, 
  BookOpen, 
  DollarSign 
} from "lucide-react-native";
import colors from "@/constants/colors";

export default function TabLayout() {
  // Determine if we should use blur effect (iOS only)
  const useBlur = Platform.OS === 'ios';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          // Add shadow for better visual hierarchy
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 5,
          // Use blur effect on iOS for a more modern look
          ...(useBlur ? { 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          } : {
            backgroundColor: colors.cardBackground,
          }),
        },
        headerStyle: {
          backgroundColor: useBlur ? 'rgba(255, 255, 255, 0.8)' : colors.background,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 3,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 0,
        },
        // Add animation for smoother transitions
        tabBarHideOnKeyboard: true,
        // Removed animationEnabled as it's not a valid property
        // Use blur effect for header on iOS
        ...(useBlur && Platform.OS === 'ios' ? {
          headerTransparent: true,
          headerBackground: () => (
            <BlurView 
              tint="light" 
              intensity={80} 
              style={{ 
                flex: 1,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.05)',
              }} 
            />
          ),
        } : {}),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          // Removed headerLargeTitle as it's not a valid property
          // Use headerLargeTitleStyle only if supported by your version
          headerLargeTitleShadowVisible: false,
          headerLargeTitleStyle: {
            color: colors.text,
            fontSize: 34,
          },
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, size }) => <Target size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mental-health"
        options={{
          title: "Mental",
          tabBarIcon: ({ color, size }) => <Brain size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: "Learning",
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}