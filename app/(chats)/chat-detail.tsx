import { Header } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useMessage } from "@/context/MessageContext";
import { useSocket } from "@/context/SocketContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
  };
  createdAt?: string;
}

const ChatDetailScreen = () => {
  const { state } = useChat();
  const { socket, sendTypingStatus, userTyping, joinChat, isConnected } =
    useSocket();
  const { fetchMessages: fetchMessagesFromContext, state: messageState } =
    useMessage();
  const { state: authState } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const flatListRef = useRef<FlatList | null>(null);

  const { selectedChat } = state;

  let typingTimeout: NodeJS.Timeout | null = null;

  console.log("🚀 Selected Chat:", selectedChat);
  console.log("🔌 Socket Connected:", isConnected);
  console.log("👤 Current User:", authState.user?._id);

  useEffect(() => {
    if (!selectedChat || !selectedChat.users) {
      router.back();
      return;
    }

    // Fetch messages for this chat
    fetchMessages();

    // Join the chat room when socket is connected
    if (socket && isConnected && selectedChat._id) {
      console.log("🏠 [FRONTEND] Joining chat room:", selectedChat._id);
      joinChat(selectedChat._id);
    }

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      // Clear typing status when leaving
      if (selectedChat && socket && isConnected) {
        sendTypingStatus(selectedChat._id, false);
      }
    };
  }, [selectedChat, socket, isConnected]);

  // Update messages when messageState changes
  // Listen for real-time messages
  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleMessageReceived = (newMessage: Message) => {
      console.log("📨 [CHAT DETAIL] Message received:", newMessage);

      // Check if this message belongs to the current chat
      if (newMessage._id === selectedChat._id) {
        console.log(
          "✅ [CHAT DETAIL] Message belongs to current chat, adding to messages"
        );
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some((msg) => msg._id === newMessage._id);
          if (exists) {
            console.log("⚠️ [CHAT DETAIL] Message already exists, skipping");
            return prev;
          }
          return [...prev, newMessage];
        });
      } else {
        console.log("⏭️ [CHAT DETAIL] Message not for current chat, ignoring");
      }
    };

    const handleTyping = (data: { userId: string; chatId: string }) => {
      console.log("⌨️ [CHAT DETAIL] Typing event received:", data);
      if (
        data.chatId === selectedChat._id &&
        data.userId !== authState.user?._id
      ) {
        console.log("✅ [CHAT DETAIL] Someone else is typing in current chat");
        setIsTyping(true);

        // Auto-clear typing after 3 seconds
        setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    };

    const handleStopTyping = (data: { userId: string; chatId: string }) => {
      console.log("⌨️ [CHAT DETAIL] Stop typing event received:", data);
      if (data.chatId === selectedChat._id) {
        setIsTyping(false);
      }
    };

    // Add event listeners
    socket.on("message received", handleMessageReceived);
    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);

    // Cleanup listeners
    return () => {
      socket.off("message received", handleMessageReceived);
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
    };
  }, [socket, selectedChat, authState.user?._id]);

  // Update messages when messageState changes
  useEffect(() => {
    if (selectedChat && messageState.messages[selectedChat._id]) {
      console.log("📝 [CHAT DETAIL] Updating messages from context");
      setMessages(
        messageState.messages[selectedChat._id].map((msg) => ({
          ...msg,
          createdAt:
            msg.createdAt instanceof Date
              ? msg.createdAt.toISOString()
              : msg.createdAt,
        }))
      );
    }
  }, [messageState.messages, selectedChat]);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      console.log(
        "📥 [CHAT DETAIL] Fetching messages for chat:",
        selectedChat._id
      );
      await fetchMessagesFromContext(selectedChat._id);
    } catch (error) {
      console.error("❌ [CHAT DETAIL] Error fetching messages:", error);
    }
  };

  const handleSend = () => {
    if (!message.trim() || !selectedChat || !authState.user || !socket || !isConnected) {
      console.warn('⚠️ [CHAT DETAIL] Cannot send message - missing requirements');
      return;
    }

    console.log('📤 [CHAT DETAIL] Sending message:', message);

    // Send message via socket
      const newMessage = {
         _id: Date.now().toString(), // Temporary ID for optimistic update
        content: message,
        chat: {
          _id: selectedChat._id,
          users: selectedChat.users.map((user) => ({ _id: user._id })), // Include user IDs
        },
        sender: {
          _id: authState.user._id, // Use actual user ID from auth context
        },
        createdAt: new Date().toISOString(),
      };

      // Optimistically add to UI first
    setMessages(prev => [...prev, newMessage]);

      socket.emit("new message", newMessage);
      console.log('✅ [CHAT DETAIL] Message sent via socket');

      // // Optimistically add to UI
      // setMessages((prev) => [
      //   ...prev,
      //   {
      //     _id: Date.now().toString(),
      //     content: message,
      //     sender: { _id: authState.user ? authState.user._id : "" }, // Safe access
      //     createdAt: new Date().toISOString(),
      //   },
      // ]);

      // Clear input and typing status
      setMessage('');
    if (isTyping) {
      sendTypingStatus(selectedChat._id, false);
      setIsTyping(false);
    }
  };

  const handleTyping = (text: string) => {
    setMessage(text);

     if (!selectedChat || !socket || !isConnected) return;

    // Handle typing indicator
    if (!isTyping && text.trim()) {
      console.log('⌨️ [CHAT DETAIL] Starting to type');
      setIsTyping(true);
      sendTypingStatus(selectedChat._id, true);
    }

    // Clear typing timeout
    if (typingTimeout) clearTimeout(typingTimeout);

     // Set new timeout to stop typing
    if (text.trim()) {
      const timeout = setTimeout(() => {
        console.log('⌨️ [CHAT DETAIL] Stopping typing due to timeout');
        setIsTyping(false);
        sendTypingStatus(selectedChat._id, false);
      }, 3000);
      
      typingTimeout = timeout as unknown as NodeJS.Timeout;
    } else {
      // If text is empty, immediately stop typing
      setIsTyping(false);
      sendTypingStatus(selectedChat._id, false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    // Fix: Compare with actual user ID from auth context
    const isMe = item.sender._id === authState.user?._id;

      console.log('🎨 [CHAT DETAIL] Rendering message:', {
      messageId: item._id,
      senderId: item.sender._id,
      currentUserId: authState.user?._id,
      isMe
    });
    
    return (
      <View className={`p-3 my-1 rounded-2xl max-w-[80%] ${isMe ? 'bg-[#FFCD00] self-end' : 'bg-gray-700 self-start'}`}>
        <Text className={isMe ? 'text-black' : 'text-white'}>{item.content}</Text>
        <Text className={`text-xs ${isMe ? 'text-gray-800' : 'text-gray-400'} text-right`}>
          {new Date(item.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
    );
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#192230]"
    >
      <SafeAreaView edges={["top"]} className="flex-1">
        <Header
             title={selectedChat?.chatName || selectedChat?.users?.find(u => u._id !== authState.user?._id)?.name || 'Chat'} 
          isSkip={true}
        />

        {/* Connection status indicator */}
        {!isConnected && (
          <View className="px-4 py-1 bg-red-500">
            <Text className="text-white text-center">Connecting...</Text>
          </View>
        )}

         {/* Typing indicator */}
        {(isTyping || (userTyping?.chatId === selectedChat?._id && userTyping?.userId !== authState.user?._id)) && (
          <View className="px-4 py-1">
            <Text className="text-gray-400 italic">Someone is typing...</Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 10 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View className="flex-row items-center p-2 border-t border-gray-700">
          <TextInput
            className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 mr-2"
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={handleTyping}
            editable={isConnected}
          />
          <TouchableOpacity
            className="bg-[#FFCD00] p-3 rounded-full"
            onPress={handleSend}
            disabled={!isConnected}
          >
            <Ionicons name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ChatDetailScreen;
