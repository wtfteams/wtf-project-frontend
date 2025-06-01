import React, { useState } from "react";

import { Alert, useWindowDimensions } from "react-native";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Button, Header } from "@/components";
import { moderateScale, scale } from "react-native-size-matters";
import { router } from "expo-router";

interface Interest {
  id: string;
  name: string;
}

const availableInterests: Interest[] = [
  { id: "1", name: "Movies" },
  { id: "2", name: "Music" },
  { id: "3", name: "Books" },
  { id: "4", name: "Gaming" },
  { id: "5", name: "Art" },
  { id: "6", name: "Cooking" },
  { id: "7", name: "Fitness" },
  { id: "8", name: "Technology" },
  { id: "9", name: "Travel" },
];

const MAX_SELECTIONS = 5;

export default function InterestSelectionScreen({ navigation }: any) {
  const { width } = useWindowDimensions();

  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);

  // Function to toggle interest selection
  const toggleInterest = (interest: Interest) => {
    if (selectedInterests.some((item) => item.id === interest.id)) {
      setSelectedInterests(
        selectedInterests.filter((item) => item.id !== interest.id)
      );
    } else {
      if (selectedInterests.length >= MAX_SELECTIONS) {
        Alert.alert(
          "Maximum Selections Reached",
          `You can only select up to ${MAX_SELECTIONS} interests.`
        );
        return;
      }
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const removeSelected = (interest: Interest) => {
    setSelectedInterests(
      selectedInterests.filter((item) => item.id !== interest.id)
    );
  };

  // Handle continue button press
  const handleContinue = () => {
    console.log("Selected interests:", selectedInterests);
    // navigation.navigate('NextScreen', { selectedInterests });
  };

  // Calculate circle size based on screen width
  const getCircleSize = () => {
    const circlesPerRow = 3;
    const padding = scale(8);
    const availableWidth = width - scale(40);
    const size = Math.floor(availableWidth / circlesPerRow - padding);
    return Math.min(size, scale(90));
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar style="light" />
      <View className="flex-1 px-5">
        {/* Header with back button and skip */}
        <Header isSkip={true} />

        {/* Main content - fixed structure */}
        <View className="flex-1">
          <View className="mb-6 gap-3">
            <Text
              className="text-white font-poppins-regular mt-2"
              style={{ fontSize: moderateScale(24) }}
            >
              What are you passionate about?
            </Text>
            <Text className="text-white font-poppins-regular">
              We will personalise your feed and connect you with people who
              share your interests
            </Text>
          </View>

          {/* Selected interests chips - fixed height container */}
          <View
            className="flex-row flex-wrap mb-8 items-center justify-center"
            style={{ minHeight: 90 }}
          >
            {selectedInterests.map((interest) => (
              <View key={interest.id} className="mr-2 mb-2">
                <TouchableOpacity
                  className="bg-secondary rounded-full flex-row items-center px-4 py-2"
                  onPress={() => removeSelected(interest)}
                >
                  <Text className="text-black font-bold mr-2">
                    {interest.name}
                  </Text>
                  <Ionicons name="close" size={18} color="black" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* "Select your interests" section - fixed position */}
          <Text className="text-white text-2xl font-poppins-regular mb-4">
            Select your interests
          </Text>

          {/* Interest selection circles - fixed grid layout */}
          <View className="flex-row flex-wrap justify-center">
            {availableInterests.map((interest) => (
              <View key={interest.id} className="w-1/3 aspect-square p-2">
                <TouchableOpacity
                  className={`w-24 h-24 rounded-full items-center justify-center ${
                    selectedInterests.some((item) => item.id === interest.id)
                      ? "bg-secondary"
                      : selectedInterests.length >= MAX_SELECTIONS
                      ? "bg-fourth/50"
                      : "bg-fourth"
                  }`}
                  onPress={() => toggleInterest(interest)}
                  disabled={
                    selectedInterests.length >= MAX_SELECTIONS &&
                    !selectedInterests.some((item) => item.id === interest.id)
                  }
                >
                  <Text
                    className={`font-semibold text-center px-2 ${
                      selectedInterests.some((item) => item.id === interest.id)
                        ? "text-black"
                        : "text-white"
                    }`}
                  >
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>
      {/* Continue button - fixed at bottom */}
      <View className="px-6 pb-8">
        <Button
          text="Continue"
          buttonColor="bg-secondary"
          textColor="text-black"
          onPress={() => router.push("/(auth)/friend-suggestion-screen")}
          className={`rounded-[38px]`}
          textClassName="font-poppins-semibold text-base tracking-wider"
        />
      </View>
    </SafeAreaView>
  );
}
