import React from "react";
import { Stack } from "expo-router";

export default function ChatsLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: '#192230' },
      animation: 'slide_from_right',
    }} >
      <Stack.Screen name="index" />
      <Stack.Screen name="chat-detail" />
      <Stack.Screen name="create-group" />
      <Stack.Screen name="user-search" />
    </Stack>
  );
}
