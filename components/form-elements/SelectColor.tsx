import React, { useState, useRef, useEffect } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FeatherIcons from "../build-elements/FeatherIcons";

const colorOptions = [
  { name: "Yellow", value: "#FFCD00" },
  { name: "Blue", value: "#3498db" },
  { name: "Green", value: "#2ecc71" },
  { name: "Red", value: "#e74c3c" },
  { name: "Purple", value: "#9b59b6" },
  { name: "Orange", value: "#e67e22" },
  { name: "Pink", value: "#e84393" },
  { name: "Teal", value: "#1abc9c" },
  { name: "Gray", value: "#95a5a6" },
];

interface Props {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  options?: string[]; 
  error?: string;
  endIcon?: string;
  startIcon?: string;
  iconWidth?: number;
  iconHeight?: number;
  iconStrokeColor?: string;
  iconFillColor?: string;
}

export default function SelectColor({
  label,
  value,
  onChange,
  placeholder = "Select color",
  error = "",
  endIcon,
  startIcon,
  iconWidth = 20,
  iconHeight = 20,
  iconStrokeColor = "white",
  iconFillColor = "white",
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(value);
  const screenHeight = Dimensions.get("window").height;
  const modalHeight = screenHeight * 0.6;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

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

  const handleConfirm = () => {
    if (selectedColor) {
      onChange(selectedColor);
    }
    setModalVisible(false);
  };

  const getSelectedColorName = () => {
    const found = colorOptions.find(color => color.value === value);
    return found ? found.name : null;
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

        <View className="flex-row items-center flex-1">
          {value && (
            <View 
              style={{ backgroundColor: value }} 
              className="w-5 h-5 rounded-full mr-2" 
            />
          )}
          <Text
            className={`
              font-poppins-medium text-base tracking-wide
              ${value ? "text-white text-sm" : "text-textWhiteShade text-sm"}
            `}
          >
            {value ? getSelectedColorName() : placeholder}
          </Text>
        </View>

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
                Select Color
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap justify-between mb-6">
              {colorOptions.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedColor(color.value)}
                  className="mb-4 items-center"
                  style={{ width: '33%' }}
                >
                  <View 
                    style={{ 
                      backgroundColor: color.value,
                      borderWidth: selectedColor === color.value ? 3 : 0,
                      borderColor: 'white'
                    }} 
                    className="w-16 h-16 rounded-full mb-2"
                  />
                  <Text className="text-white font-poppins-medium text-xs">
                    {color.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row justify-between my-4">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setModalVisible(false)}
                className="bg-white py-3 px-6 rounded-[38px] flex-1 mr-2"
              >
                <Text className="font-poppins-medium text-center">Cancel</Text>
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

