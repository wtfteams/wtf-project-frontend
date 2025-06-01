import { View, Text, Button, SafeAreaView } from "react-native";
import React from "react";
import { router } from "expo-router";
import { useState } from "react";
import { FeatherIcons, InputBox } from "@/components";

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View>
      <SafeAreaView />
      <Text>LoginScreen</Text>

      <InputBox
        label="Display name"
        placeholder="Enter your display name"
        value={formData.name}
        onChangeText={(text) => handleChange("name", text)}
        description="you can use emoji and special characters"
      />

      <InputBox
        label="Username"
        placeholder="Enter your user name"
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
        description="eg:user_007"
      />
      <Button title="Register" onPress={() => router.push("/(main-tabs)")} />
    </View>
  );
};

export default LoginScreen;
