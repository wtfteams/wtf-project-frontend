import React, { useState, useRef, useEffect } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  TextInput,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FeatherIcons from "../build-elements/FeatherIcons";

interface Props {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  options: string[];
  error?: string;
  endIcon?: string;
  startIcon?: string;
  iconWidth?: number;
  iconHeight?: number;
  iconStrokeColor?: string;
  iconFillColor?: string;
}

export default function SelectSize({
  label,
  value,
  onChange,
  placeholder = "Select option",
  title = "Pick group people",
  options,
  error = "",
  endIcon,
  startIcon,
  iconWidth = 20,
  iconHeight = 20,
  iconStrokeColor = "white",
  iconFillColor = "white",
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customCount, setCustomCount] = useState("1");

  const screenHeight = Dimensions.get("window").height;
  const modalHeight = screenHeight * 0.6;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const predefinedOptions = ["1-2", "1-5", "1-10", "1-20", "1-30", "1-50"];

  const openModal = () => {
    slideAnim.setValue(screenHeight);
    if (value) {
      if (predefinedOptions.includes(value)) {
        setSelectedSize(value);
        setIsCustomMode(false);
      } else {
        setCustomCount(value);
        setIsCustomMode(true);
        setSelectedSize(null);
      }
    } else {
      setSelectedSize(null);
      setIsCustomMode(false);
    }
    setModalVisible(true);
  };

  useEffect(() => {
    if (modalVisible) {
      // Use spring animation for a natural feel on both platforms
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      // Use timing animation for closing
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const handleConfirm = () => {
    if (selectedSize) {
      onChange(selectedSize);
      setCustomCount("0")
    } else if (isCustomMode) {
      onChange(customCount);
    } else {
      onChange("1");
    }
    setModalVisible(false);
  };

  const handleOptionSelect = (option: string) => {
    if (selectedSize === option) {
      setSelectedSize(null);
    } else {
      setSelectedSize(option);
      setIsCustomMode(false); 
      setCustomCount("0"); 
    }
  };

  const handleCustomCountChange = (text: string) => {
    if (/^\d*$/.test(text)) {
      setCustomCount(text || "1");
      setIsCustomMode(true);
      setSelectedSize(null); 
    }
  };

  const incrementCount = () => {
    const newCount = parseInt(customCount || "1") + 1;
    setCustomCount(newCount.toString());
    setIsCustomMode(true);
    setSelectedSize(null); 
  };

  const decrementCount = () => {
    if (parseInt(customCount || "1") > 1) {
      const newCount = parseInt(customCount || "1") - 1;
      setCustomCount(newCount.toString());
      setIsCustomMode(true);
      setSelectedSize(null); 
    }
  };

  return (
    <View className="w-full mb-5">
      <Text className="text-textWhiteShade tracking-wide text-base mb-2 font-poppins-medium">
        {label}
      </Text>

      <TouchableOpacity
        onPress={openModal}
        activeOpacity={0.8}
        className={`
          bg-tertiary rounded-[10px] py-4 px-4
          border-2 ${error ? "border-red-500" : "border-fourth"}
          flex-row justify-between items-center
        `}
      >
        {startIcon && (
          <View className="mr-3">
            <FeatherIcons
              icon={startIcon}
              iconWidth={iconWidth}
              iconHeight={iconHeight}
              iconStrokeColor={iconStrokeColor}
              iconFillColor={iconFillColor}
            />
          </View>
        )}

        <Text
          className={`
            font-poppins-medium text-base tracking-wide flex-1
            ${value ? "text-white text-sm" : "text-textWhiteShade text-sm"}
          `}
        >
          {value || placeholder}
        </Text>
        {endIcon ? (
          <View className="ml-3">
            <FeatherIcons
              icon={endIcon}
              iconWidth={iconWidth}
              iconHeight={iconHeight}
              iconStrokeColor={iconStrokeColor}
              iconFillColor={iconFillColor}
            />
          </View>
        ) : (
          <Ionicons name="chevron-down" size={20} color="#FFFFFF80" />
        )}
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 text-xs font-poppins-regular ml-1 mt-1">
          {error}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none" // We're using our own animation
        onRequestClose={() => setModalVisible(false)} // Required for Android back button
        statusBarTranslucent={true} // Ensure modal goes under status bar on Android
      >
        <Pressable 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setModalVisible(false)}
        >
          <Animated.View
            className={`bg-tertiary rounded-t-[20px] p-5 absolute bottom-0 left-0 right-0`}
            style={{
              maxHeight: modalHeight,
              transform: [{ translateY: slideAnim }],
              // Add shadow that works on both platforms
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 5,
                },
              }),
            }}
          >
            <Pressable onPress={e => e.stopPropagation()}>
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-white font-poppins-semibold text-lg">
                  {title}
                </Text>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} // Increase touch area for better UX
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </Pressable>

            <ScrollView
              className="rounded w-full mb-4"
              contentContainerStyle={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                paddingBottom: 8,
              }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              bounces={Platform.OS === 'ios'} 
            >
              {predefinedOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleOptionSelect(option)}
                  activeOpacity={0.7} 
                  className={`
                    rounded-[10px] py-3 px-6 mb-2
                    ${selectedSize === option ? "bg-secondary/80" : "bg-fourth"}
                  `}
                  style={{ 
                    width: "30%", 
                    marginHorizontal: "1.5%",
                    ...Platform.select({
                      ios: {
                        // iOS specific styles
                      },
                      android: {
                        // Android specific styles
                      },
                    }),
                  }}
                >
                  <Text className="text-white font-poppins-medium text-base text-center">
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex items-center justify-center gap-8 mb-4">
              <Text className="text-white font-poppins-medium text-base">
                Add custom count
              </Text>
              <View className="flex-row justify-center items-center mb-6">
                <TouchableOpacity
                  onPress={decrementCount}
                  activeOpacity={0.7}
                  className="bg-fourth rounded-full w-12 h-12 flex items-center justify-center"
                  style={Platform.select({
                    android: { elevation: 2 },
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.5,
                    },
                  })}
                >
                  <Text className="text-white font-poppins-medium text-2xl">
                    -
                  </Text>
                </TouchableOpacity>
                <TextInput
                  value={customCount}
                  onChangeText={handleCustomCountChange}
                  keyboardType="numeric"
                  className="text-white text-center w-24 mx-4 bg-fourth rounded-lg py-4 font-poppins-medium text-xl"
                  style={Platform.select({
                    android: { elevation: 2 },
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.5,
                    },
                  })}
                />
                <TouchableOpacity
                  onPress={incrementCount}
                  activeOpacity={0.7}
                  className="bg-fourth rounded-full w-12 h-12 flex items-center justify-center"
                  style={Platform.select({
                    android: { elevation: 2 },
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.5,
                    },
                  })}
                >
                  <Text className="text-white font-poppins-medium text-2xl">
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row justify-between my-4">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setModalVisible(false)}
                className="bg-fourth py-3 px-6 rounded-[38px] flex-1 mr-2"
              >
                <Text className="text-white font-poppins-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleConfirm}
                className="bg-secondary py-3 px-6 rounded-[38px] flex-1 ml-2"
              >
                <Text className="text-black font-poppins-medium text-center">
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
