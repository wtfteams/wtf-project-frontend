import React from "react";
import { SafeAreaView, View } from "react-native";
import { Stack } from "expo-router";

const AuthLayout = () => {
  return (
    <View className="flex-1">
      <SafeAreaView className="bg-primary"/>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#192230' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="register-screen" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="create-account-screen" />
        <Stack.Screen name="avatar-screen" />
        <Stack.Screen name="friend-suggestion-screen" />
        <Stack.Screen name="interest-screen" />
        <Stack.Screen name="auth/verify-email" options={{ headerShown: false }} />
        <Stack.Screen name="setup-two-factor" options={{ headerShown: false }} />
        <Stack.Screen name="verify-two-factor" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
};

export default AuthLayout;
