import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { Button, DatePicker, Header, InputBox, SelectBox } from "@/components";

export default function CreateAccountScreen() {
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-5">
          <Header />

          {/* Header */}
          <View className="gap-5">
            <Text
              className="text-white font-poppins-regular mt-2"
              style={{ fontSize: moderateScale(24) }}
            >
              Create an account
            </Text>
          </View>

          {/* Form Content */}
          <ScrollView
           className="mt-5 flex-1"
           contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}>
           <View>
           <InputBox
              label="User Name"
              placeholder="Enter your user name"
              value={userName}
              onChangeText={setUserName}
              className={`mb-4`}
              description="eg : user_007"
            />

            <InputBox
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className={`mb-4`}
              description="password must be 8 characters and more"
            />

            <DatePicker
              label="Date of Birth"
              value={selectedDate || new Date()}
              onChange={setSelectedDate}
            />

            <SelectBox
              label="Gender"
              value={selectedGender}
              onChange={setSelectedGender}
              placeholder="Select gender"
              options={["Male", "Female", "Other"]}
              error=""
            />
           </View>
            
            {/* Fixed Footer */}
            <View className="mt-20 mb-8 gap-8">
              <Button
                text="Continue"
                buttonColor="bg-secondary"
                textColor="text-black"
                onPress={() => router.push("/(auth)/avatar-screen")}
                className={`rounded-[38px]`}
                textClassName="font-poppins-semibold text-base tracking-wider"
              />

              <Text
                className="text-white text-center !text-xs"
                style={{ fontSize: moderateScale(12) }}
              >
                By continuing to create an account I agree to the{" "}
                <Text className="text-secondary text-xs">
                  Terms and Conditions and Privacy Policy
                </Text>{" "}
                and that I am at least 18 years of age
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
