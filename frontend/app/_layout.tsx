import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="role" />
      <Stack.Screen name="admin-login" />
      <Stack.Screen name="(user)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}
