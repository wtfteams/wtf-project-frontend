import React from 'react'

import { Colors } from '@/constants/Colors'
import { ActivityIndicator, Text, View } from 'react-native'

const SplashScreen = () => {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: "center", 
      alignItems: "center",
      backgroundColor: Colors.light.background
    }}>
      <Text style={{ 
        fontSize: 24,
        marginBottom: 20,
        color: Colors.light.text
      }}>
        Your App Name
      </Text>
      <ActivityIndicator size="large" color={Colors.light.tint} />
    </View>
  )
}

export default SplashScreen