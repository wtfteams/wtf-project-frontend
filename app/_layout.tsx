import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { AuthProvider } from '../context/AuthContext';
import { ChatProvider } from '../context/ChatContext';
import { MessageProvider } from '../context/MessageContext';
import { SocketProvider } from '../context/SocketContext';
import "../global.css";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ChatProvider>
        <MessageProvider>
          <SocketProvider>
            <View style={styles.container} className="flex-1">
              <StatusBar
                style="light"
                backgroundColor="#192230"
                translucent={Platform.OS === 'android'}
              />
              {Platform.OS === 'android' && <View style={{ height: Platform.OS === 'android' ? 30 : 0 }} className="bg-primary" />}
              <SafeAreaView className="bg-primary" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#192230' },
                  animation: 'slide_from_right',
                  animationDuration: 200,
                  presentation: 'card',
                }}
              >
                <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: '#192230' } }} />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(main-tabs)" />
                <Stack.Screen name="(chats)" />
                <Stack.Screen name="(events)" />
              </Stack>
            </View>
          </SocketProvider>
        </MessageProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#192230',
  }
});
