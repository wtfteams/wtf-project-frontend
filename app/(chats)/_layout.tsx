import { Stack } from "expo-router";
import React from "react";

export default function ChatsLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: '#192230' },
      animation: 'slide_from_right',
    }} >
      <Stack.Screen name="index" />
      <Stack.Screen name="chat-detail/[userId]" />
      <Stack.Screen name="create-group" />
      <Stack.Screen name="user-search" />
    </Stack>
  );
}
