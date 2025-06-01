import { Header } from "@/components";
import React from "react";
import { View } from "react-native";

export default function EventScreen() {
    return (
        <View className="flex-1 bg-[#192230] px-5">
            <Header />
            <View className="p-4 bg-[#FFCD00] h-[300px] rounded-[40px] relative border-[10px] border-solid border-[#192230]">
                <View className="absolute -bottom-2 -right-2 w-[100px] h-[100px] bg-white rounded-[40px] border-[10px] border-[#192230]">
                </View>
                <View style={{ boxShadow: "5px 12px 0 #192230" }} className="absolute right-[93px] w-[50px] h-[50px] bottom-0 rounded-br-full rounded-tr-full">
                </View>
            </View>
        </View>

    )
}