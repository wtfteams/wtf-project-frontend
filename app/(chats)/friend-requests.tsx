// app/(chats)/friend-requests.tsx
import { axiosInstance } from "@/api/axios";
import { Header } from "@/components";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
}

const FriendRequestsScreen = () => {
  const { friendRequests, getFriendRequests, onlineUsers } = useAuthStore();

  useEffect(() => {
    getFriendRequests();
  }, [getFriendRequests]);

  const handleRespondToFriendRequest = async (
    senderId: string,
    action: "accept" | "reject"
  ) => {
    try {
      await axiosInstance.post("/friends/respond", { senderId, action });
      getFriendRequests(); // Refresh friend requests
    } catch (error: any) {
      console.error(
        "Error responding to friend request:",
        error.response?.data?.message || error.message
      );
    }
  };

  const renderRequestItem = ({ item }: { item: User }) => {
    const isOnline = onlineUsers.includes(item._id);

    return (
      <View className="flex-row items-center p-4 border-b border-fourth rounded-[10px] bg-primary">
        <View className="relative">
          <Image
            source={{
              uri:
                item.profilePic ||
                "https://via.placeholder.com/50x50/cccccc/ffffff?text=Avatar",
            }}
            className="w-12 h-12 rounded-full"
            defaultSource={{
              uri: "https://via.placeholder.com/50x50/cccccc/ffffff?text=Avatar",
            }}
          />
          {isOnline && (
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-[16px] font-poppins-regular tracking-wider text-white">
            {item.fullName}
          </Text>
          <Text className="text-sm text-gray-400">{item.email}</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="bg-green-500 py-2 px-3 rounded-[10px]"
            onPress={() => handleRespondToFriendRequest(item._id, "accept")}
          >
            <Ionicons name="checkmark" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 py-2 px-3 rounded-[10px]"
            onPress={() => handleRespondToFriendRequest(item._id, "reject")}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary px-5">
      <Header />
      <View className="flex-1">
        <FlatList
          data={friendRequests as any}
          keyExtractor={(item) => item._id}
          renderItem={renderRequestItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-8">
              <Ionicons name="people-outline" size={64} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-4 text-lg">
                No friend requests
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default FriendRequestsScreen;
