import React, { useState } from "react";

import { router } from "expo-router";
import { View, Text } from "react-native";

import { Button, Header, OtpInputBox } from "@/components";
import { moderateScale } from "react-native-size-matters";

export default function OtpScreen() {
  const [otpValue, setOtpValue] = useState<string>("");

  return (
    <View className="flex-1 bg-[#192230] px-5">
      <Header />
      <View className="flex-1 gap-20">
        <View className="gap-5">
          <View className="gap-2">
            <Text
              className="text-white font-poppins-regular mt-2"
              style={{ fontSize: moderateScale(24) }}
            >
              Verification code
            </Text>
            <Text className="font-poppins-regular text-xs tracking-wider text-white">
              we have send the verification code
            </Text>
            <Text className="text-white font-poppins-regular tracking-wider text-xs">
              to +91 81****1234.
              <Text className="text-[#FFCD00]" onPress={() => router.back()}>
                {" "}
                Change the phone number ?
              </Text>
            </Text>
          </View>
          <OtpInputBox
            type="numeric"
            onTextValue={(text: string) => setOtpValue(text)}
            onFilledValue={(text: string) => setOtpValue(text)}
          />
        </View>
        <View className="flex-row gap-4 w-full items-center justify-center">
          <Button
            text="Resend"
            buttonColor="bg-white"
            textColor="text-black"
            onPress={() => alert("hi")}
            className="rounded-[38px] w-1/2"
            textClassName="font-poppins-semibold text-base tracking-wider"
          />
          <Button
            text="Confirm"
            buttonColor="bg-[#FFCD00]"
            textColor="text-black"
            onPress={()=> router.push("/(auth)/setup-two-factor")}
            // onPress={() => router.push("/(auth)/create-account-screen")}
            className="rounded-[38px] w-1/2"
            textClassName="font-poppins-semibold text-base tracking-wider"
          />
        </View>
      </View>
    </View>
  );
}
