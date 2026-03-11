import { Colors } from "@/constants/theme";
import { useFontScale } from "@/context/font-scale-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeAccent } from "@/hooks/use-theme-accent";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, LayoutList, Plus, Settings } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import DashboardScreen from "./app/(app)/dashboard";
import ProfileScreen from "./app/(app)/profile";
import AddEditTaskScreen from "./screens/AddEditTaskScreen";
import TaskListScreen from "./screens/TaskListScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const themeAccent = useThemeAccent();

  const tabBarBg = isDark ? Colors.dark.background : "#fff";
  const tabBarBorder = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const tabBarActiveTint = isDark ? Colors.dark.tint : "#111827";
  const tabBarInactiveTint = isDark ? "#9BA1A6" : "#6B7280";
  const plusButtonBg = isDark ? themeAccent.buttonBg : themeAccent.accent;
  const plusButtonColor = isDark ? "#C7D2FE" : "#111827";
  const { fs } = useFontScale();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: tabBarBg, borderTopColor: tabBarBorder },
        ],
        tabBarLabelStyle: [styles.tabBarLabel, { fontSize: fs(11) }],
        tabBarActiveTintColor: tabBarActiveTint,
        tabBarInactiveTintColor: tabBarInactiveTint,
        headerShown: false,
        tabBarIconStyle: { fontSize: 18 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="Tarefas"
        component={TaskListScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <LayoutList color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Settings color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="AddTask"
        component={AddEditTaskScreen}
        options={{
          tabBarLabel: "",
          headerShown: false,
          tabBarItemStyle: styles.addTaskTabItem,
          tabBarIcon: () => (
            <View
              style={[styles.plusButton, { backgroundColor: plusButtonBg }]}
            >
              <Plus color={plusButtonColor} size={22} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    height: 70,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  addTaskTabItem: {
    justifyContent: "flex-start",
    paddingTop: 10,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TabNavigator;
