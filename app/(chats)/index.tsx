import { FeatherIcons, Header } from "@/components";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatListScreen = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const handleUserPress = (user: any) => {
    setSelectedUser(user);
    // Navigate to chat screen or handle user selection
    router.push(`/(chats)/chat-detail/${user._id}` as any) ;
  };

  const renderUserItem = ({ item }: { item: any }) => {
    const isOnline = onlineUsers.includes(item._id);
    const isSelected = selectedUser?._id === item._id;

    return (
      <TouchableOpacity
        className={`flex-row items-center p-4 border-b border-fourth rounded-[10px] ${
          isSelected ? "bg-fourth" : "bg-primary"
        }`}
        onPress={() => handleUserPress(item)}
      >
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
            {item.fullName || item.name}
          </Text>
          <Text className="text-sm text-gray-400">
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isUsersLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-500 mt-2">Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-primary px-5">
      <Header />

      <View className="flex-1 gap-11">
        {/* Action Buttons */}
        <View className="flex-row items-center justify-between gap-[10px]">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-start  bg-tertiary py-2 px-3 rounded-[20px]"
            onPress={() => router.push("/(chats)/user-search")}
          >
            <FeatherIcons
              icon="search-icon"
              iconWidth={24}
              iconHeight={24}
              iconStrokeColor="white"
            />
            <Text className="text-white text-xs font-poppins-regular tracking-wider  ml-3">
              Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center bg-tertiary py-2 px-3 rounded-[20px]"
            onPress={() => router.push("/(chats)/create-group")}
          >
            <Ionicons name="people" size={24} color="white" />
            <Text className="text-white text-xs font-poppins-regular tracking-wider  ml-3">
              Add friends
            </Text>
          </TouchableOpacity>
        </View>

        {/* Users List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-8">
              <Ionicons name="people-outline" size={64} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-4 text-lg">
                {showOnlineOnly ? "No online users" : "No users found"}
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                {showOnlineOnly
                  ? "Try turning off the online filter"
                  : "Start by finding some users to chat with"}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default ChatListScreen;
