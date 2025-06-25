import React, { useState } from "react";

import { Button, Header, InputBox } from "@/components";
import { useAuthStore } from "@/store/useAuthStore";
import { FormData } from "@/types/common";
import { router } from "expo-router";
import { Alert, Text, View } from "react-native";

const LoginScreen: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    password: "",
  });
  const [formError, setFormError] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    general: "",
  });

  const { login } = useAuthStore();

  const validateEmailForm = () => {
    const errors = {
      email: !formData.email
        ? "Email is required"
        : !/^\S+@\S+\.\S+$/.test(formData.email)
        ? "Invalid email format"
        : "",
      password: !formData.password
        ? "Password is required"
        : formData.password.length < 6
        ? "Password must be at least 6 characters"
        : "",
      phone: "",
      general: "",
    };
    setFormError(errors as any);
    return !errors.email && !errors.password;
  };

  const validatePhoneForm = () => {
    const errors = {
      name: "",
      email: "",
      password: "",
      phone: !formData.phone
        ? "Phone number is required"
        : formData.phone.length < 10
        ? "Invalid phone number"
        : "",
      general: "",
    };
    setFormError(errors as any);
    return !errors.phone;
  };

  const handleLogin = async () => {
    try {
      if (!validateEmailForm()) return;
      await login(formData);
      const { authUser } = useAuthStore.getState();
      if (authUser) {
        router.push("/(chats)");
      }
    } catch (error: any) {
      setFormError({ ...formError, general: error.message });
      Alert.alert("client login");
    }
  };

  return (
    <View className="flex-1 bg-[#192230] px-5">
      <Header />
      <View className="flex-1 gap-10">
        <View className="gap-1">
          <Text className="font-poppins-semibold text-xl tracking-wider text-white">
            Welcome back !
          </Text>
          <Text className="font-poppins-regular text-xs tracking-wider text-white opacity-50">
            we are excited to see you again
          </Text>
        </View>
        <View className="gap-8">
          <InputBox
            label="Email"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(value: string) => {
              setFormData({
                ...formData,
                email: value,
              });
            }}
            error={formError.email}
            className="!mb-0"
          />
          <InputBox
            label="Password"
            secureTextEntry
            value={formData.password}
            onChangeText={(value: string) => {
              setFormData({
                ...formData,
                password: value,
              });
            }}
            error={formError.password}
            className="!mb-0"
          />
          <View className="flex-row justify-between">
            <View className="gap-2 flex-row justify-between items-center">
              <Text className="font-poppins-regular text-xs tracking-wider text-secondary">
                Forgot your password ?
              </Text>
              <View></View>
            </View>
            {formError.general && (
              <Text className="text-red-500 text-sm mt-1">
                {formError.general}
              </Text>
            )}
          </View>
          <View className="gap-5">
            <Button
              text="Next"
              buttonColor="bg-secondary"
              textColor="text-black"
              onPress={handleLogin}
              className="rounded-[38px]"
              textClassName="font-poppins-semibold text-base tracking-wider"
              // loading={isLoading}
            />
            <Text className="font-poppins-regular text-xs tracking-wider text-secondary text-center">
              Login With Passkey
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
