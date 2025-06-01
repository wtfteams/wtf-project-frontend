import React from "react";

import LoadingDots from "./LoadingDots";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  text: string;
  onPress: () => void;
  buttonColor?: string | undefined;
  textColor?: string | undefined;
  strokeColor?: string | undefined;
  startIcon?: keyof typeof Ionicons.glyphMap;
  endIcon?: keyof typeof Ionicons.glyphMap;
  className?: string | undefined;
  textClassName?: string | undefined;
  loading?: boolean | undefined;
}

export default function Button({
  text,
  onPress,
  buttonColor = "bg-secondary",
  textColor = "text-black",
  strokeColor,
  startIcon,
  endIcon,
  className = "",
  textClassName = "",
  loading = false,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={loading}
      className={`
        flex-row items-center justify-center py-4 px-4 h-[56px]
        rounded-[38px] shadow-md
        ${buttonColor} ${strokeColor ? `border border-${strokeColor}` : ""}
        ${className}
      `}
    >
      {loading ? (
        <LoadingDots size={6} color="black" animationDuration={400}/>
      ) : (
        <>
          {startIcon && (
            <Ionicons
              name={startIcon}
              size={20}
              className={`${textColor} mr-2`}
            />
          )}

          <Text
            className={`text-base font-poppins-semibold tracking-wider ${textColor} ${textClassName}`}
          >
            {text}
          </Text>

          {endIcon && (
            <Ionicons
              name={endIcon}
              size={20}
              className={`${textColor} ml-2`}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
