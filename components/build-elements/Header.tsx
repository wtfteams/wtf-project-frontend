import React from "react";

import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import FeatherIcons from "./FeatherIcons";
import { moderateScale } from "react-native-size-matters";

interface Props {
  isSkip?:boolean
  backButtonClass?: string;
  title?:string;
}

export default function Header({
  isSkip = false,
  backButtonClass = ``,
  title='Skip',
}:Props) {
  return (
    <View className="w-full h-20 flex-row items-center justify-between">
      <TouchableOpacity className={`${backButtonClass}`} onPress={router.back}>
        <FeatherIcons
          icon="back-arrow"
          iconWidth={moderateScale(24)}
          iconHeight={moderateScale(24)}
          iconStrokeColor="white"
        />
      </TouchableOpacity>
      { isSkip && <TouchableOpacity onPress={router.back}>
        <Text
          className="text-white font-poppins-regular mt-2"
          style={{ fontSize: moderateScale(16) }}
        >
         {title}
        </Text>
      </TouchableOpacity>}
    </View>
  );
}
