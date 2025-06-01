import React, { useState } from "react";

import { router } from "expo-router";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView, Text, View } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";
import {
  Button,
  Header,
  InputBox,
  SelectColor,
  SelectImage,
  SelectRules,
} from "@/components";
import TabBar from "@/components/form-elements/TabBar";
import SelectSize from "@/components/form-elements/SelectSize";

export default function CreateEventScreenTwo() {
  const [selectSize, setSelectSize] = useState("");
  const [selectColor, setSelectColor] = useState("");
  const [eventRules, setEventRules] = useState<
    Array<{ id: string; text: string }>
  >([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const handleImageChange = (imageUri: string | string[]) => {
    // If we receive an array, take the first image, otherwise use the string directly
    const singleImageUri = Array.isArray(imageUri) ? imageUri[0] : imageUri;
    setProfileImage(singleImageUri);
    console.log("Selected image URI:", singleImageUri);
  };

  const tabData = [
    { value: "Free", name: "Free" },
    { value: "Paid", name: "Paid" },
  ];
  const [tabValue, setTabValue] = useState<string>("Free");

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 px-5">
        <Header />
        {/* Header */}
        <View className="gap-5">
          <Text
            className="text-white font-poppins-regular mt-2"
            style={{ fontSize: moderateScale(24) }}
          >
            Customize your event
          </Text>
        </View>

        {/* Scrollable Form Content */}
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          extraHeight={verticalScale(100)}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="mt-5"
        >
          <View className="flex-1 gap-4">
            <View>
              <TabBar
                tabData={tabData}
                setTabValue={setTabValue}
                tabValue={tabValue}
              />
            </View>

            {tabValue === "Paid" && (
              <InputBox
                label="Entry Fee"
                placeholder="Enter amount"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
                startIcon="rupee-icon"
                iconWidth={24}
                iconHeight={24}
                iconStrokeColor=""
                iconFillColor=""
                error=""
              />
            )}

            <SelectImage
              label="Add Event Picture"
              value={profileImage}
              onChange={handleImageChange}
              placeholder="Add event pictures"
              title="Upload Profile Picture"
              startIcon="image-upload"
              iconWidth={24}
              iconHeight={24}
              iconStrokeColor="white"
              iconFillColor="transparent"
              error=""
            />
            <SelectSize
              label="Pick Group Size"
              value={selectSize}
              onChange={setSelectSize}
              placeholder="Select group size"
              options={["Travel", "Food", "movie"]}
              startIcon="group-icon"
              iconHeight={24}
              iconWidth={24}
              iconStrokeColor="white"
              iconFillColor=""
              error=""
            />
            <SelectColor
              label="Choose a Color for Your Event"
              value={selectColor}
              onChange={setSelectColor}
              placeholder="Select Primary Color"
              options={["Travel", "Food", "movie"]}
              startIcon="color-icon"
              iconHeight={24}
              iconWidth={24}
              error=""
            />
            <SelectRules
              label="Add a Rule"
              value={eventRules}
              onChange={setEventRules}
              placeholder="Add event rules"
              title="Event Rules"
              startIcon="rules-icon"
              iconHeight={24}
              iconWidth={24}
              error=""
            />
          </View>
          {/* Fixed Footer */}
          <View className="mt-8 mb-8">
            <Button
              text="Next"
              buttonColor="bg-secondary"
              textColor="text-black"
              onPress={() => router.replace("/(main-tabs)")}
              className={`rounded-[38px]`}
              textClassName="font-poppins-semibold text-base tracking-wider"
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}
