import { FeatherIcons } from "@/components";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

interface Message {
  _id: string;
  text?: string;
  image?: string | null | undefined;
  senderId: string;
  createdAt: string;
}

let typingTimeout: ReturnType<typeof setTimeout> | null = null;

const ChatDetailScreen = () => {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const {
    messages,
    getMessages,
    sendMessage,
    isMessagesLoading,
    selectedUser,
    setSelectedUser,
    users,
    subscribeToMessages,
    unsubscribeFromMessages,
    isOtherUserTyping,
    subscribeToTyping,
    unsubscribeFromTyping,
    emitTyping,
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();

  const [message, setMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const flatListRef = useRef<FlatList | null>(null);

  // Find and set the selected user
  useEffect(() => {
    if (userId && users.length > 0) {
      const user = users.find((u) => u._id === userId);
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [userId, users, setSelectedUser]);

  // Get messages and subscribe to real-time updates
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      subscribeToTyping();

      return () => {
        unsubscribeFromMessages();
        unsubscribeFromTyping();
      };
    }
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !selectedUser?._id || isSending) return;

    const messageText = message.trim();
    setMessage("");
    setIsSending(true);

    try {
      await sendMessage({
        text: messageText,
        image: "",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to send message. Please try again.");
      setMessage(messageText); 
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (text: string) => {
    setMessage(text);

    if (!isTyping && text.trim()) {
      setIsTyping(true);
      emitTyping(true);
    }

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      emitTyping(false);
    }, 1000);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === authUser?._id;
    // const senderProfilePic = isOwnMessage
    //   ? authUser?.profilePic
    //   : selectedUser?.profilePic;

    return (
      <View
        className={`flex-row mb-4 px-5 ${
          isOwnMessage ? "justify-end" : "justify-start"
        }`}
      >
        <View
          className={`w-full ${isOwnMessage ? "items-end" : "items-start"}`}
        >
          <View
            className={`px-4 py-2 rounded-2xl ${
              isOwnMessage
                ? "bg-blue-500 rounded-br-md"
                : "bg-gray-700 rounded-bl-md"
            }`}
          >
            {item.image && (
              <Image
                source={{ uri: item.image }}
                className="w-48 h-48 rounded-lg mb-2"
                resizeMode="cover"
              />
            )}
            {item.text && (
              <Text className={`${isOwnMessage ? "text-white" : "text-white"}`}>
                {item.text}
              </Text>
            )}
          </View>

          <Text className="text-xs text-gray-400 mt-1 ">
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  // let typingTimeout: NodeJS.Timeout | null = null;

  if (isMessagesLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#192230]">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-white mt-2">Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-primary"
    >
      <View className="flex-1 ">
        {/* Header */}
        <View className="flex-row items-center p-4 border-b border-gray-700">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <FeatherIcons
              icon="back-arrow"
              iconWidth={moderateScale(24)}
              iconHeight={moderateScale(24)}
              iconStrokeColor="white"
            />
          </TouchableOpacity>

          <View className="relative">
            <Image
              source={{
                uri:
                  selectedUser?.profilePic ||
                  "https://via.placeholder.com/40x40/cccccc/ffffff?text=U",
              }}
              className="w-10 h-10 rounded-full mr-3 bg-red-50"
            />
            {selectedUser?._id && onlineUsers.includes(selectedUser?._id) && (
              <View className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-lg">
              {selectedUser?.fullName || selectedUser?.name || "User"}
            </Text>
            <Text className="text-gray-400 text-sm">
              {isOtherUserTyping
                ? "Typing..."
                : selectedUser?._id && onlineUsers.includes(selectedUser?._id)
                ? "Online"
                : "Offline"}
            </Text>
          </View>

          <TouchableOpacity className="p-2">
            <Ionicons name="call" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity className="p-2 ml-2">
            <Ionicons name="videocam" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="chatbubbles-outline" size={64} color="#6b7280" />
              <Text className="text-gray-400 text-center mt-4">
                No messages yet. Start the conversation!
              </Text>
            </View>
          }
        />

        {/* Message Input */}
        <View className="flex-row items-center p-4 border-t border-gray-700">
          <TouchableOpacity className="mr-3">
            <Ionicons name="add" size={24} color="#6b7280" />
          </TouchableOpacity>

          <TextInput
            className="flex-1 bg-gray-700 text-white rounded-full px-4 py-3 mr-3"
            placeholder="Type a message..."
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={handleTyping}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            className={`p-3 rounded-full ${
              message.trim() && !isSending ? "bg-blue-500" : "bg-gray-600"
            }`}
            onPress={handleSend}
            disabled={!message.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size={20} color="white" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={message.trim() ? "white" : "#9ca3af"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatDetailScreen;
