import { Header } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useSocket } from '@/context/SocketContext';
import { getChatDisplayImage, getChatDisplayName } from '@/utils/chatTransform';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatListScreen = () => {
  const { state, getChats, selectChat } = useChat();
  const { onlineUsers } = useSocket();
  
  // Correct way to get current user from AuthContext
  const { state: authState } = useAuth();
  const currentUserId = authState.user?._id || '';

  useEffect(() => {
    // Wrap in try/catch to prevent crashes
    try {
      getChats();
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, []);

  const handleChatPress = (chat: any) => {
    try {
      selectChat(chat);
      router.push('/(chats)/chat-detail');
    } catch (error) {
      console.error("Error navigating to chat:", error);
    }
  };

  // Move helper function outside of renderChatItem to avoid recreation
  const getOtherUserId = (chat: any, currentUserId: string) => {
    if (chat.isGroupChat) return null;
    
    // Find the user that is not the current user
    const otherUser = chat.users?.find((user: any) => {
      const userId = user._id || user;
      return userId !== currentUserId;
    });
    
    return otherUser?._id || otherUser;
  };

  const renderChatItem = ({ item }: any) => {
    // Add null checks to prevent crashes
    if (!item) return null;
    
    const otherUserId = getOtherUserId(item, currentUserId);
    
    // Fix: More robust online status check with additional validation
    const isOnline = !item.isGroupChat && 
                     otherUserId && 
                     otherUserId !== currentUserId &&
                     Array.isArray(onlineUsers) && 
                     onlineUsers.includes(otherUserId);
    
    // Debug logging for online status
    console.log('🔍 [DEBUG] Chat item online check:', {
      chatId: item._id,
      chatName: getChatDisplayName(item, currentUserId),
      isGroupChat: item.isGroupChat,
      otherUserId,
      currentUserId,
      onlineUsers: onlineUsers,
      onlineUsersCount: onlineUsers?.length || 0,
      isOnline
    });
    
    // Use the utility functions for display name and image
    const displayName = getChatDisplayName(item, currentUserId);
    const displayImage = getChatDisplayImage(item, currentUserId);

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-200"
        onPress={() => handleChatPress(item)}
      >
        <View className="relative">
          <Image
            source={{ 
              uri: displayImage || 'https://via.placeholder.com/50' 
            }}
            className="w-12 h-12 rounded-full"
          />
          {isOnline && (
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>
        
        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-900">
              {displayName}
            </Text>
            <Text className="text-sm text-gray-500">
              {item.latestMessage?.createdAt
                ? new Date(item.latestMessage.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : ''}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 mt-1" numberOfLines={1}>
            {item.latestMessage?.content || 'No messages yet'}
          </Text>
          {/* Debug info - remove in production */}
          {__DEV__ && (
            <Text className="text-xs text-blue-500">
              Online: {isOnline ? '🟢 Yes' : '🔴 No'} | UserID: {otherUserId?.substring(0, 8)}...
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />
      
      <View className="flex-row p-4 space-x-3">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center bg-blue-500 py-3 px-4 rounded-lg"
          onPress={() => router.push('/(chats)/user-search')}
        >
          <Ionicons name="search" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Find Users</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center bg-green-500 py-3 px-4 rounded-lg"
          onPress={() => router.push('/(chats)/create-group')}
        >
          <Ionicons name="people" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">New Group</Text>
        </TouchableOpacity>
      </View>
      
      {/* Debug info - remove in production */}
      {__DEV__ && (
        <View className="bg-yellow-100 p-2 m-4 rounded">
          <Text className="text-xs">
            Debug - Online Users: {JSON.stringify(onlineUsers)} | Current User: {currentUserId}
          </Text>
        </View>
      )}
      
      <FlatList
        data={state.chats}
        keyExtractor={(item) => item?._id || Math.random().toString()}
        renderItem={renderChatItem}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-gray-500 text-center">
              No chats yet. Start a conversation!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ChatListScreen;