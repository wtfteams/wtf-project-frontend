import React, { useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import FeatherIcons from "../build-elements/FeatherIcons";

interface Props {
  label?: string;
  placeholder?: string;
  description?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  error?: string;
  className?: string;
  placeholderTextColor?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  numberOfLines?: number;
  multiline?: boolean;
  textAlignVertical?: "auto" | "top" | "bottom" | "center";
  maxLength?: number;
  height?: number;
  startIcon?: string;
  iconWidth?: number;
  iconHeight?: number;
  iconStrokeColor?: string;
  iconFillColor?: string;
}

export default function InputBox({
  label,
  placeholder,
  description,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  error,
  className,
  placeholderTextColor = "#9CA3AF",
  onFocus,
  onBlur,
  numberOfLines,
  multiline = false,
  textAlignVertical = "center",
  maxLength,
  height,
  startIcon,
  iconWidth = 20,
  iconHeight = 20,
  iconStrokeColor = "white",
  iconFillColor = "white",
}: Props) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText("");
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View className={`mb-4 w-full ${className}`}>
      {/* Label */}
      {label !== "" && typeof label !== "undefined" && (
        <Text className="text-textWhiteShade tracking-wide text-base mb-2 font-poppins-medium">
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View
        className={`flex-row bg-tertiary items-center border-2 rounded-[10px]  ${
          isFocused ? "border-2 border-fourth" : "border-fourth"
        } ${error ? "border-red-500" : ""}`}
        style={{ minHeight: multiline && height ? height : undefined }}
      >
        {startIcon && (
          <View className="ml-3 mr-1">
            <FeatherIcons
              icon={startIcon}
              iconWidth={iconWidth}
              iconHeight={iconHeight}
              iconStrokeColor={iconStrokeColor}
              iconFillColor={iconFillColor}
            />
          </View>
        )}
        <TextInput
          className="flex-1 py-4 px-4 text-white font-poppins-medium tracking-wide text-left placeholder:text-sm placeholder:text-textWhiteShade"
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          numberOfLines={numberOfLines}
          selectionColor="#ffcd00"
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : textAlignVertical}
          autoCapitalize="none"
          maxLength={maxLength}
          style={{ 
            height: multiline && height ? height : undefined,
            textAlignVertical: multiline ? "top" : textAlignVertical
          }}
        />

        {/* Clear Button (only visible when there's text) */}
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            className={`mr-2 rounded-full bg-fourth w-7 h-7 flex items-center justify-center  ${multiline ? "mb-auto mt-3" : ""}`}
          >
            <MaterialIcons name="clear" size={15} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Description or Error Message */}
      {error ? (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      ) : description ? (
        <Text className="text-gray-500 text-sm mt-1">{description}</Text>
      ) : null}
    </View>
  );
}
