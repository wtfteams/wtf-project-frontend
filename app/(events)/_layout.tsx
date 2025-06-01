import React from "react";
import { Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: '#192230' },
      animation: 'slide_from_right',
    }} >
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
