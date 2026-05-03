import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function UserLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#080f2e",
          borderTopColor: "#1a3bff22",
          height: 62,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#4d7aff",
        tabBarInactiveTintColor: "#2a3050",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Parking",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarLabel: "AI Insights",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
