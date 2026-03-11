import { Colors } from "@/constants/theme";
import { useFontScale } from "@/context/font-scale-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, LayoutList, Plus, Settings } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import DashboardScreen from "./app/(app)/dashboard";
import AddEditTaskScreen from "./screens/AddEditTaskScreen";
import TaskListScreen from "./screens/TaskListScreen";

const Tab = createBottomTabNavigator();

const SettingsScreen = () => (
  <View>
    <Text>Settings Screen</Text>
  </View>
);

const TabNavigator = () => {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const tabBarBg = isDark ? Colors.dark.background : "#fff";
  const tabBarBorder = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const tabBarActiveTint = isDark ? Colors.dark.tint : "#111827";
  const tabBarInactiveTint = isDark ? "#9BA1A6" : "#6B7280";
  const plusButtonBg = isDark ? "#312e81" : "#CBE4F7";
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
        component={SettingsScreen}
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
          tabBarIcon: () => (
            <Plus
              color={plusButtonColor}
              size={22}
              style={[styles.plusButton, { backgroundColor: plusButtonBg }]}
            />
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
  plusButton: {
    padding: 10,
    borderRadius: 7,
  },
});

export default TabNavigator;
