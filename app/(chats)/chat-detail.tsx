import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useChat } from '@/context/ChatContext';
import { useSocket } from '@/context/SocketContext';
import { Header } from '@/components';
import { Ionicons } from '@expo/vector-icons';
import { useMessage } from '@/context/MessageContext';
import { useAuth } from '@/context/AuthContext';

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
  const { socket, sendTypingStatus, userTyping } = useSocket();
  const { fetchMessages: fetchMessagesFromContext, state: messageState } = useMessage();
  const { state: authState } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const flatListRef = useRef<FlatList | null>(null);
  
  const { selectedChat } = state;
  let typingTimeout: NodeJS.Timeout | null = null;
  
  useEffect(() => {
    if (!selectedChat || !selectedChat.users) {
      router.back();
      return;
    }
    
    // Fetch messages for this chat
    fetchMessages();
    
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      // Clear typing status when leaving
      if (selectedChat) {
        sendTypingStatus(selectedChat._id, false);
      }
    };
  }, [selectedChat]);

  // Update messages when messageState changes
  useEffect(() => {
    if (selectedChat && messageState.messages[selectedChat._id]) {
      setMessages(messageState.messages[selectedChat._id].map(msg => ({
        ...msg,
        createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt
      })));
    }
  }, [messageState.messages, selectedChat]);
  
  const fetchMessages = async () => {
    if (!selectedChat) return;
    
    try {
      await fetchMessagesFromContext(selectedChat._id);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  const handleSend = () => {
    if (!message.trim() || !selectedChat || !authState.user) return;
    
    // Send message via socket
    if (socket) {
    const newMessage = {
      content: message,
      chat: {
        _id: selectedChat._id,
        users: selectedChat.users.map(user => ({ _id: user._id })), // Include user IDs
      },
      sender: {
        _id: authState.user._id, // Use actual user ID from auth context
      },
      createdAt: new Date().toISOString(),
    };
      
      socket.emit('new message', newMessage);
      
      // Optimistically add to UI
      setMessages(prev => [
        ...prev,
        {
          _id: Date.now().toString(),
          content: message,
          sender: { _id: authState.user ? authState.user._id : '' }, // Safe access
          createdAt: new Date().toISOString()
        }
      ]);
      
      // Clear input and typing status
      setMessage('');
      sendTypingStatus(selectedChat._id, false);
    }
  };
  
  const handleTyping = (text: string) => {
    setMessage(text);
    
    if (!selectedChat) return;
    
    // Handle typing indicator
    if (!isTyping && text) {
      setIsTyping(true);
      sendTypingStatus(selectedChat._id, true);
    }
    
    // Clear typing timeout
    if (typingTimeout) clearTimeout(typingTimeout);
    
    // Set new timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(selectedChat._id, false);
    }, 3000);
    
    typingTimeout = timeout as unknown as NodeJS.Timeout;
  };
  
  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender._id === 'me'; // Replace with actual user ID check
    
    return (
      <View className={`p-3 my-1 rounded-2xl max-w-[80%] ${isMe ? 'bg-[#FFCD00] self-end' : 'bg-gray-700 self-start'}`}>
        <Text className={isMe ? 'text-black' : 'text-white'}>{item.content}</Text>
        <Text className={`text-xs ${isMe ? 'text-gray-800' : 'text-gray-400'} text-right`}>
          {new Date(item.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#192230]"
    >
      <SafeAreaView edges={['top']} className="flex-1">
        <Header 
          title={selectedChat?.chatName || selectedChat?.users[1]?.name || 'Chat'} 
          isSkip={true}
        />
        
        {userTyping?.chatId === selectedChat?._id && (
          <View className="px-4 py-1">
            <Text className="text-gray-400 italic">Typing...</Text>
          </View>
        )}
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 10 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
        
        <View className="flex-row items-center p-2 border-t border-gray-700">
          <TextInput
            className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 mr-2"
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={handleTyping}
          />
          <TouchableOpacity 
            className="bg-[#FFCD00] p-3 rounded-full"
            onPress={handleSend}
          >
            <Ionicons name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ChatDetailScreen;
