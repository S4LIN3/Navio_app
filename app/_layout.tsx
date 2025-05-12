import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useUserStore } from "@/store/userStore";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This component handles the initial navigation based on authentication state
function InitialLayout() {
  const segments = useSegments();
  const router = useRouter();
  const { isOnboarded, isLoading } = useUserStore();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(tabs)";

    if (isOnboarded && !inAuthGroup) {
      // Redirect to the tabs if the user is onboarded but not in the tabs group
      router.replace("/(tabs)");
    } else if (!isOnboarded && inAuthGroup) {
      // Redirect to the onboarding if the user is not onboarded but in the tabs group
      router.replace("/");
    }
  }, [isOnboarded, segments, isLoading]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="goal-details/[id]" options={{ title: "Goal Details" }} />
      <Stack.Screen name="resource-details/[id]" options={{ title: "Resource Details" }} />
      <Stack.Screen name="learning-session/[id]" options={{ title: "Learning Session" }} />
      <Stack.Screen name="transaction-details/[id]" options={{ title: "Transaction Details" }} />
      <Stack.Screen name="financial-goal/[id]" options={{ title: "Financial Goal" }} />
      <Stack.Screen name="budget/[id]" options={{ title: "Budget Details" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const { setLoading } = useUserStore();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Once fonts are loaded, mark user store as not loading
      setLoading(false);
    }
  }, [loaded, setLoading]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <InitialLayout />
    </ErrorBoundary>
  );
}