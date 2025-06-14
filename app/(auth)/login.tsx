import { Button, Header, InputBox } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { FormData } from "@/types/common";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";

const LoginScreen: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
  });
  // Use the auth context
  const { login, state } = useAuth();
  const isLoading = state.isLoading;

  const handleLogin = async () => {
    try {
      await login({
        email: formData.email || "",
        password: formData.password || "",
      });
      router.push("/(chats)");
    } catch (error) {
      console.log("state", state);
    }
  };

  const getErrorMessage = (field: any) => {
    const error = Array.isArray(state.error)
      ? state.error.find((err: any) => err.path === field)
      : null;
    return error ? error.msg : "";
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
            value={formData.email || ""}
            onChangeText={(value: string) => {
              setFormData({
                ...formData,
                email: value,
              });
            }}
            error={getErrorMessage("email")}
            className="!mb-0"
          />
          <InputBox
            label="Password"
            secureTextEntry
            value={formData.password || ""}
            onChangeText={(value: string) => {
              setFormData({
                ...formData,
                password: value,
              });
            }}
            error={getErrorMessage("password")}
            className="!mb-0"
          />

          <View className="gap-2 flex-row justify-between items-center">
            <Text className="font-poppins-regular text-xs tracking-wider text-secondary">
              Forgot your password ?
            </Text>
            <View>
              {typeof state.error === "string" && (
                <Text className="text-red-500 text-sm mt-1 items-center flex-row justify-center align-middle">
                  {state.error}
                </Text>
              )}
            </View>
          </View>
          <View className="gap-5">
            <Button
              text="Next"
              buttonColor="bg-secondary"
              textColor="text-black"
              onPress={handleLogin}
              className="rounded-[38px]"
              textClassName="font-poppins-semibold text-base tracking-wider"
              loading={isLoading}
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
