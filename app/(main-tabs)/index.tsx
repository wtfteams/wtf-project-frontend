import { View, Text, SafeAreaView, Button } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const HomeScreen = () => {
  return (
    <View>
      <SafeAreaView/>
      <Text>HomeScreen</Text>
      <Button title="Event Details" onPress={() => router.push("/(events)")} />
      <Button title="Event Settings" onPress={() => router.push("/(events)/settings")} />
    </View>
  )
}

export default HomeScreen