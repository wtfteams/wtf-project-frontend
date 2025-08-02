import { FeatherIcons } from "@/components";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

interface Message {
  _id: string;
  text?: string;
  mediaType?: "text" | "image" | "video" | "gif" | "file";
  mediaUrl?: string;
  thumbnail?: string;
  fileName?: string;
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

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const [sendingImages, setSendingImages] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      // result.assets is always present and always an array when not canceled
      const uris = result.assets.map((a) => a.uri);
      setSelectedImages((prev) => [...prev, ...uris]);
      setShowPreview(true);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      videoMaxDuration: 60,
      quality: 0.7,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        await sendMessage({
          mediaType: "video",
          mediaUri: result.assets[0].uri,
          fileName: "video.mp4",
        });
      } finally {
        setUploading(false);
        setShowMediaOptions(false);
      }
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        await sendMessage({
          mediaType: "file",
          mediaUri: result.assets[0].uri,
          fileName: result.assets[0].name,
        });
      } finally {
        setUploading(false);
        setShowMediaOptions(false);
      }
    }
  };

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
    if (!message.trim() || !selectedUser?._id) return;
    const messageText = message.trim();
    setMessage("");

    // Just trigger the send - let socket handle UI update
    sendMessage({
      text: messageText,
      mediaType: "text",
    }).catch(() => {
      // Optional: show error
    });
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

  // ADD to renderMessage function in ChatDetailScreen.tsx

  const renderMessage = ({ item }: { item: any }) => {
    const isOwnMessage = item.senderId === authUser?._id;

    const renderMediaContent = () => {
      switch (item.mediaType) {
        case "image":
        case "gif":
          return (
            <Image
              source={{ uri: item.mediaUrl }}
              className="w-48 h-48 rounded-lg mb-2"
              resizeMode="cover"
            />
          );

        case "video":
          return (
            <Video
              source={{ uri: item.mediaUrl }}
              className="w-48 h-48 rounded-lg mb-2"
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              posterSource={
                item.thumbnail ? { uri: item.thumbnail } : undefined
              }
            />
          );

        case "file":
          return (
            <TouchableOpacity className="flex-row items-center bg-gray-600 p-3 rounded-lg mb-2">
              <Ionicons name="document" size={24} color="white" />
              <Text className="text-white ml-2 flex-1" numberOfLines={1}>
                {item.fileName || "Document"}
              </Text>
            </TouchableOpacity>
          );

        default:
          return null;
      }
    };

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
            {renderMediaContent()}
            {item.text && <Text className="text-white">{item.text}</Text>}
          </View>
          <Text className="text-xs text-gray-400 mt-1">
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
    <>
      {showPreview && (
        <View className="absolute inset-0 bg-black z-20 flex-1 justify-center items-center">
          {/* Main Preview */}
          {selectedImages.length > 0 && (
            <Image
              source={{ uri: selectedImages[previewIndex] }}
              style={{
                width: 340,
                height: 340,
                borderRadius: 14,
                marginBottom: 12,
                marginTop: 18,
                borderWidth: 2,
                borderColor: "#2563eb",
              }}
              resizeMode="cover"
            />
          )}

          {/* Row of Thumbnails */}
          {selectedImages.length > 1 && (
            <FlatList
              data={selectedImages}
              horizontal
              style={{ maxHeight: 84, marginBottom: 12 }}
              contentContainerStyle={{ alignItems: "center" }}
              keyExtractor={(item, i) => item + i}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => setPreviewIndex(index)}
                  style={{
                    borderWidth: previewIndex === index ? 2 : 0,
                    borderColor: "#2563eb",
                    borderRadius: 8,
                    marginHorizontal: 5,
                  }}
                >
                  <Image
                    source={{ uri: item }}
                    style={{ width: 70, height: 70, borderRadius: 8 }}
                  />
                </TouchableOpacity>
              )}
            />
          )}

          {/* Plus Button */}
          <TouchableOpacity
            onPress={pickImage}
            style={{
              position: "absolute",
              bottom: 90,
              left: 30,
              backgroundColor: "#2563eb",
              borderRadius: 30,
              padding: 15,
            }}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
          {/* Message input with send */}
          <View
            style={{
              position: "absolute",
              bottom: 30,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                backgroundColor: "#374151",
                color: "white",
                borderRadius: 20,
                paddingHorizontal: 16,
                marginRight: 10,
              }}
              value={message}
              onChangeText={setMessage}
              placeholder="Add a message (optional)"
              placeholderTextColor="#9ca3af"
              multiline
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#1d4ed8",
                padding: 12,
                borderRadius: 999,
                alignItems: "center",
                opacity: sendingImages ? 0.5 : 1,
              }}
              disabled={sendingImages || selectedImages.length === 0}
              onPress={async () => {
                setSendingImages(true);
                try {
                  await Promise.all(
                    selectedImages.map((image) =>
                      sendMessage({
                        text: message || undefined,
                        mediaType: "image",
                        mediaUri: image,
                        fileName: "image.jpg",
                      })
                    )
                  );
                  setSelectedImages([]);
                  setShowPreview(false);
                  setMessage("");
                  setPreviewIndex(0); // reset
                } catch (err) {
                  // show error if desired
                } finally {
                  setSendingImages(false);
                }
              }}
            >
              {sendingImages ? (
                <ActivityIndicator color="white" />
              ) : (
                <Ionicons name="send" size={22} color="white" />
              )}
            </TouchableOpacity>
          </View>
          {/* Cancel Button (optional) */}
          <TouchableOpacity
            style={{ position: "absolute", top: 40, right: 20, padding: 8 }}
            onPress={() => {
              setShowPreview(false);
              setSelectedImages([]);
            }}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
      )}
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
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <Ionicons
                  name="chatbubbles-outline"
                  size={64}
                  color="#6b7280"
                />
                <Text className="text-gray-400 text-center mt-4">
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
          />
          {/* Message Input */}
          <View className="flex-row items-center p-4 border-t border-gray-700">
            <TouchableOpacity
              className="mr-3"
              onPress={() => setShowMediaOptions(!showMediaOptions)}
            >
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
              className="mr-3"
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Text className="text-2xl">😊</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-3 rounded-full ${
                message.trim() && !isSending ? "bg-blue-500" : "bg-gray-600"
              }`}
              onPress={handleSend}
              disabled={(!message.trim() || isSending) && !uploading}
            >
              {isSending || uploading ? (
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
          {/* Media Options Modal */}
          {showMediaOptions && (
            <View className="absolute bottom-20 left-4 right-4 bg-gray-800 rounded-lg p-4">
              <TouchableOpacity
                className="flex-row items-center py-3"
                onPress={pickImage}
              >
                <Ionicons name="image" size={24} color="white" />
                <Text className="text-white ml-3">Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center py-3"
                onPress={pickVideo}
              >
                <Ionicons name="videocam" size={24} color="white" />
                <Text className="text-white ml-3">Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center py-3"
                onPress={pickDocument}
              >
                <Ionicons name="document" size={24} color="white" />
                <Text className="text-white ml-3">Document</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <View className="absolute bottom-20 left-0 right-0 h-64">
              <EmojiSelector
                onEmojiSelected={(emoji) => {
                  setMessage(message + emoji);
                  setShowEmojiPicker(false);
                }}
                showTabs={true}
                showSearchBar={false}
                theme="#192230"
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default ChatDetailScreen;
