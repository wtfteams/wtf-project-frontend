import { Button } from "@/components";
import { router } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

import LOGO from "@/assets/images/loogo2.png";

export default function Welcome() {

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: '#192230',
      }} 
      className="flex-1 px-5 justify-around"
    >
      <View className="gap-5 items-center justify-center">
        <Image source={LOGO} className="w-36 h-36" />
        <View className="gap-1">
          <View>
            <Text className="text-white font-black text-4xl text-center font-poppins-bold">
              HANG OUT
            </Text>
            <Text className="text-white font-black text-4xl text-center font-poppins-bold">
              WITH THE FRIENDS
            </Text>
          </View>
          <View>
            <Text className="text-white font-semibold text-center text-lg font-poppins-regular">
              Link up with the friends Experience fun and connection with your
              favorite app!
            </Text>
          </View>
        </View>
      </View>
      <View></View>
      <View className="gap-5">
        <Button
          text="Register"
          onPress={() => router.push("/register-screen")}
          // onPress={() => router.push("/(auth)/register-screen")}
          buttonColor="bg-white rounded-[38px]"
          textColor="text-black font-poppins-semibold"
          textClassName="tracking-wider text-base font-poppins-semibold"
        />
        <Button
          text="Login"
          onPress={() => router.push("/(auth)/login")}
          buttonColor="bg-secondary rounded-[38px]"
          textColor="text-black font-poppins-semibold"
          textClassName="tracking-wider text-base font-poppins-semibold"
        />
      </View>
    </View>
  );
}
