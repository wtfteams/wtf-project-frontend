import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useChat } from '@/context/ChatContext';
import { useSocket } from '@/context/SocketContext';
import { Header } from '@/components';
import { Ionicons } from '@expo/vector-icons';


const ChatListScreen = () => {
  const { state, getChats, selectChat } = useChat();
  const { onlineUsers } = useSocket();
  
  useEffect(() => {
    // Wrap in try/catch to prevent crashes
    try {
      getChats();
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, []);

  const handleChatPress = (chat:any) => {
    try {
      selectChat(chat);
      router.push('/(chats)/chat-detail');
    } catch (error) {
      console.error("Error navigating to chat:", error);
    }
  };

  const renderChatItem = ({ item }:any) => {
    // Add null checks to prevent crashes
    if (!item) return null;
    
    const isOnline = item.isGroupChat 
      ? false 
      : onlineUsers?.includes(item.users?.[1]?._id);
    
    return (
      <TouchableOpacity 
        className="flex-row items-center p-4 border-b border-gray-700"
        onPress={() => handleChatPress(item)}
      >
        <View className="relative">
          <Image 
            source={{ uri: item?.isGroupChat 
              ? '' 
              : item?.users?.[1]?.avatar || '' }} 
            className="w-12 h-12 rounded-full"
          />
          {isOnline && (
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white" />
          )}
        </View>
        
        <View className="ml-3 flex-1">
          <Text className="text-white font-semibold">{item.chatName || item.users?.[1]?.name || 'Chat'}</Text>
          <Text className="text-gray-400 text-sm" numberOfLines={1}>
            {item.latestMessage?.content || 'No messages yet'}
          </Text>
        </View>
        
        <Text className="text-gray-500 text-xs">
          {item.latestMessage?.createdAt 
            ? new Date(item.latestMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#192230]">
      <SafeAreaView edges={['top']}>
        <Header title="Chats" />
        
        <View className="flex-row justify-between px-4 py-2">
          <TouchableOpacity 
            className="bg-[#FFCD00] p-3 rounded-full"
            onPress={() => router.push('/(chats)/user-search')}
          >
            <Ionicons name="search" size={20} color="#000" />
            <Text className="font-semibold">Find Users</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-[#FFCD00] p-3 rounded-full"
            onPress={() => router.push('/(chats)/create-group')}
          >
            <Text className="font-semibold">New Group</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={state?.chats || []}
          keyExtractor={(item) => item?._id || Math.random().toString()}
          renderItem={renderChatItem}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-10">
              <Text className="text-white text-center">No chats yet. Start a conversation!</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
};

export default ChatListScreen;
