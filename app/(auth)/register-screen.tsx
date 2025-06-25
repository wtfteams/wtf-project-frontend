import React, { useState } from "react";

import { Button, Header, InputBox, PhoneInput } from "@/components";
import TabBar from "@/components/form-elements/TabBar";
import { useAuthStore } from "@/store/useAuthStore";
import { FormData } from "@/types/common";
import { router } from "expo-router";
import { Alert, Text, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

const RegisterScreen = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phone:""
  });
  const [formError, setFormError] = useState({
    name: "",
    email: "",
    password: "",
    phone:"",
    general: "",
  });
  const [activeTab, setActiveTab] = React.useState("email");

  const { signup, isSigningUp } = useAuthStore();

  const tabs = [
    {
      id: "email-tab",
      label: "Email",
      value: "email",
    },
    {
      id: "phone-tab",
      label: "Phone",
      value: "phone",
    },
  ];

  const validateEmailForm = () => {
    const errors = {
      name: !formData.name ? "Name is required" : "",
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
    return !errors.name && !errors.email && !errors.password;
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

  const handleRegister = async () => {
    if (activeTab === "phone") {
      if (!validatePhoneForm()) return;
      Alert.alert("Info", "Phone registration not implemented yet");
      return;
    }

    if (activeTab === "email") {
      try {
        if (!validateEmailForm()) return;
        const signupData = {
          fullName: formData.name,
          email: formData.email,
          password: formData.password,
        };
        await signup(signupData);
        const { authUser } = useAuthStore.getState();
        if (authUser) {
          router.push("/(auth)/login");
        }
      } catch (error: any) {
        setFormError({...formError,general : error.message})
        Alert.alert("Error", error.message || "Registration failed");
      }
    }
  };

  const displayInputBox = () => {
    switch (activeTab) {
      case "phone":
        return (
          <View className="gap-4">
            <PhoneInput
              value={formData.phone}
              onChangePhone ={(value: string) =>
                setFormData({ ...formData, phone: value })
              }
              placeholder="Phone number"
              error={formError.phone}
            />
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
              error={formError.name}
              className="!mb-0"
            />
            <InputBox
              placeholder="Email"
              value={formData.email || ""}
              onChangeText={(value: string) =>
                setFormData({ ...formData, email: value })
              }
              error={formError.email}
              className="!mb-0"
            />
            <InputBox
              placeholder="Password"
              value={formData.password || ""}
              onChangeText={(value: string) =>
                setFormData({ ...formData, password: value })
              }
              error={formError.password}
              className="!mb-0"
              secureTextEntry
            />
            {formError.general && (
              <Text className="text-red-500 text-sm mt-1">{formError.general}</Text>
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
            // loading={isLoading}
          />
        </View>
      </View>
    </View>
  );
};

export default RegisterScreen;
