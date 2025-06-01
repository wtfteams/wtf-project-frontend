import { Button, Header, InputBox, PhoneInput } from "@/components";
import TabBar from "@/components/form-elements/TabBar";
import { useAuth } from "@/context/AuthContext";
import { FormData } from "@/types/common";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

const RegisterScreen = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [activeTab, setActiveTab] = React.useState("email");

  const tabs = [
    { 
      id: "email-tab", 
      label: "Email", 
      value: "email" 
    },
    { 
      id: "phone-tab", 
      label: "Phone", 
      value: "phone" 
    },
  ];

  const { register, state } = useAuth();
  const isLoading = state?.isLoading ?? false;

  const handleRegister = async () => {
    if (activeTab === "phone") {
      if (!phoneNumber) {
        console.warn("Phone number is required for phone registration");
        return;
      }
      console.warn("Phone registration not implemented yet");
      return;
    }

    if (activeTab === "email") {
      try {
        if (!formData.name || !formData.email || !formData.password) {
          console.warn(
            "Missing required fields for email registration",
            formData
          );
          return;
        }
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        router.push("/(auth)/login");
      } catch (error) {
        console.error("Registration error:", error);
      }
    }
  };

  const getErrorMessage = (field: keyof FormData) => {
    if (!state?.error) return "";
    const error = Array.isArray(state.error)
      ? state.error.find((err: any) => err.path === field)
      : null;
    return error ? error.msg : "";
  };

  const displayInputBox = () => {
    switch (activeTab) {
      case "phone":
        return (
          <View className="gap-4">
            <PhoneInput
              value={phoneNumber}
              onChangePhone={setPhoneNumber}
              placeholder="Phone number"
            />
            {/* Add phone-specific error handling if needed */}
            {typeof state.error === "string" && (
              <Text className="text-red-500 text-sm mt-1">{state.error}</Text>
            )}
          </View>
        );
      case "email":
        return (
          <View className="gap-4">
            <InputBox
              placeholder="Name"
              value={formData.name || ""}
              onChangeText={(value: string) =>
                setFormData({ ...formData, name: value })
              }
              error={getErrorMessage("name")}
              className="!mb-0"
            />
            <InputBox
              placeholder="Email"
              value={formData.email || ""}
              onChangeText={(value: string) =>
                setFormData({ ...formData, email: value })
              }
              error={getErrorMessage("email")}
              className="!mb-0"
            />
            <InputBox
              placeholder="Password"
              value={formData.password || ""}
              onChangeText={(value: string) =>
                setFormData({ ...formData, password: value })
              }
              error={getErrorMessage("password")}
              className="!mb-0"
              secureTextEntry
            />
            {typeof state.error === "string" && (
              <Text className="text-red-500 text-sm mt-1">{state.error}</Text>
            )}
          </View>
        );
      default:
        console.warn("Invalid tabValue:", activeTab);
        return (
          <Text className="text-red-500 font-poppins-medium text-center">
            Invalid tab selected
          </Text>
        );
    }
  };

  // Helper function to get button text based on active tab
  const getButtonText = () => {
    switch (activeTab) {
      case "phone":
        return "Register with Phone";
      case "email":
        return "Register with Email";
      default:
        return "Next";
    }
  };

  // Helper function to check if form is valid
  const isFormValid = () => {
    if (activeTab === "email") {
      return formData.name && formData.email && formData.password;
    }
    if (activeTab === "phone") {
      return phoneNumber;
    }
    return false;
  };

  return (
    <View className="flex-1 bg-[#192230] px-5">
      <Header />
      <View className="flex-1 gap-10">
        <Text
          className="text-white font-poppins-regular mt-2"
          style={{ fontSize: moderateScale(24) }}
        >
          Choose which works best for you.
        </Text>
        <View className="gap-8">
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeBackgroundColor="#007AFF"
            backgroundColor="#2C2F38"
            borderRadius={12}
            padding={4}
            testID="registration-tabs"
          />
          
          {displayInputBox()}
          
          <Button
            text={getButtonText()}
            buttonColor="bg-secondary"
            textColor="text-black"
            onPress={handleRegister}
            className="rounded-[38px]"
            textClassName="font-poppins-semibold text-base tracking-wider"
            loading={isLoading}
          />
        </View>
      </View>
    </View>
  );
};

export default RegisterScreen;