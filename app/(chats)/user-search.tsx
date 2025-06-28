// app/(chats)/user-search.tsx
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
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
}

const UserSearchScreen = () => {
  const { searchResults, searchUsers, isSearchingUsers, sendFriendRequest, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<string[]>([]); 

  useEffect(() => {
    setSearchQuery("");
    setError(null);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }
    setError(null);
    await searchUsers(searchQuery);
  };

  const handleSendFriendRequest = async (receiverId: string) => {
    try {
      console.log("Sending friend request to receiverId:", receiverId);
      await sendFriendRequest(receiverId);
      setError(null);
      setSentRequests((prev) => [...prev, receiverId]); // Mark as sent
      console.log("Friend request sent successfully");
    } catch (err: any) {
      console.error("Error in handleSendFriendRequest:", err.message);
      setError(err.message || "Failed to send friend request");
    }
  };

  const handleUserPress = (user: User) => {
    setSelectedUser(user);
    router.push(`/(chats)/chat-detail/${user._id}` as any);
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isOnline = onlineUsers.includes(item._id);
    const isRequestSent = sentRequests.includes(item._id);

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-fourth rounded-[10px] bg-primary"
        onPress={() => handleUserPress(item)}
        activeOpacity={0.7}
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
            {item.fullName}
          </Text>
          <Text className="text-sm text-gray-400">{item.email}</Text>
        </View>
        <TouchableOpacity
          className={`py-2 px-3 rounded-[10px] ${isRequestSent ? "bg-gray-500" : "bg-tertiary"}`}
          onPress={() => handleSendFriendRequest(item._id)}
          disabled={isRequestSent}
        >
          <Ionicons name={isRequestSent ? "checkmark" : "person-add"} size={20} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary px-5">
      <Header />
      <View className="flex-1 gap-5">
        <View className="flex-row items-center bg-tertiary rounded-[20px] px-3 py-2">
          <FeatherIcons
            icon="search-icon"
            iconWidth={24}
            iconHeight={24}
            iconStrokeColor="white"
          />
          <TextInput
            className="flex-1 ml-2 text-white font-poppins-regular"
            placeholder="Search by name or email"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Text className="text-red-500 text-center font-poppins-regular">
            {error}
          </Text>
        )}
        {isSearchingUsers ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-500 mt-2">Searching users...</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item._id}
            renderItem={renderUserItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center p-8">
                <Ionicons name="people-outline" size={64} color="#d1d5db" />
                <Text className="text-gray-500 text-center mt-4 text-lg">
                  No users found
                </Text>
                <Text className="text-gray-400 text-center mt-2">
                  Try searching with a different name or email
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default UserSearchScreen;