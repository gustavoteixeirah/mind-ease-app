import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, LayoutList, Plus, Settings } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import DashboardScreen from "./app/(app)/dashboard";
import TaskListScreen from "./screens/TaskListScreen";

const Tab = createBottomTabNavigator();

const SettingsScreen = () => (
  <View>
    <Text>Settings Screen</Text>
  </View>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarIconStyle: { fontSize: 18 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tab.Screen
        name="Tarefas"
        component={TaskListScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <LayoutList color={color} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={SettingsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Settings color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "",
          headerShown: false,
          tabBarIcon: () => (
            <Plus color={styles.plusButton.color} style={styles.plusButton} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    height: 70,
    borderColor: "#e0e0e0",
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  plusButton: {
    position: "absolute",
    top: 2,
    backgroundColor: "#CBE4f7",
    padding: 10,
    borderRadius: 7,
    color: "#000",
  },
});
export default TabNavigator;
