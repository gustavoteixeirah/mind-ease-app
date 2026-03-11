import { useAuth } from "@/context/auth-context";
import { TasksProvider } from "@/context/tasks-context";
import TabNavigator from "@/Navigation";
import FocusModeScreen from "@/screens/FocusModeScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import ProfileScreen from "./profile";

const Stack = createNativeStackNavigator();

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [user, isLoading, router]);

  return (
    <TasksProvider>
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Tabs"
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="FocusMode" component={FocusModeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
    </TasksProvider>
  );
}
