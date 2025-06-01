import React, { useState, useRef, useEffect } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
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

export default function SelectBox({
  label,
  value,
  onChange,
  placeholder = "Select option",
  title,
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
  const [selectedOption, setSelectedOption] = useState<string | null>(value);
  const screenHeight = Dimensions.get("window").height;
  const modalHeight = screenHeight * 0.6;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    // Update internal state when external value changes
    setSelectedOption(value);
  }, [value]);

  const openModal = () => {
    slideAnim.setValue(screenHeight);
    setModalVisible(true);
  };

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    // Don't close modal or call onChange yet
  };

  const handleConfirm = () => {
    if (selectedOption) {
      onChange(selectedOption);
    }
    setModalVisible(false);
  };

  const handleCancel = () => {
    // Reset to original value
    setSelectedOption(value);
    setModalVisible(false);
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
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Animated.View
            className="bg-tertiary rounded-t-[20px] p-5"
            style={{
              maxHeight: modalHeight,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-white font-poppins-semibold text-lg">
                {title || `Select ${label}`}
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="rounded w-full mb-2"
              style={{ height: modalHeight * 0.4 }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              bounces={Platform.OS === "ios"}
            >
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleOptionSelect(option)}
                  className={`
                    py-7 border-b border-fourth 
                    ${selectedOption === option ? "bg-secondary/80" : ""}
                  `}
                >
                  <Text
                    className={`
                      font-poppins-medium text-base pl-3
                      ${selectedOption === option ? "text-black" : "text-white"}
                    `}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row justify-between my-8">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCancel}
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
        </View>
      </Modal>
    </View>
  );
}
