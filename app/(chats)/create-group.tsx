import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useChat } from '@/context/ChatContext';
import { Header, Button } from '@/components';

interface User {
  _id: string;
  name: string;
  avatar: string;
}

interface CreateGroupParams {
  name: string;
  users: string[];
}

const CreateGroupScreen = () => {
  const { createGroupChat } = useChat();
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  
  useEffect(() => {
    // Fetch users from API
    // For now using dummy data
    setUsers([
      { _id: '1', name: 'John Doe', avatar: '' },
      { _id: '2', name: 'Jane Smith', avatar: '' },
      { _id: '3', name: 'Bob Johnson', avatar: '' },
    ]);
  }, []);
  
  const handleUserSelect = (user: User) => {
    if (selectedUsers.some(u => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) {
      // Show error
      return;
    }
    
    try {
      await createGroupChat({
        name: groupName,
        users: selectedUsers.map(user => user._id)
      } as CreateGroupParams);
      
      router.back();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.some(user => user._id === item._id);
    
    return (
      <TouchableOpacity 
        className={`flex-row items-center p-4 border-b border-gray-700 ${isSelected ? 'bg-gray-800' : ''}`}
        onPress={() => handleUserSelect(item)}
      >
        <Image 
          source={{ uri: item.avatar }} 
          className="w-10 h-10 rounded-full"
        />
        
        <Text className="ml-3 text-white">{item.name}</Text>
        
        {isSelected && (
          <View className="ml-auto bg-[#FFCD00] w-6 h-6 rounded-full justify-center items-center">
            <Text>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View className="flex-1 bg-[#192230]">
      <SafeAreaView edges={['top']} className="flex-1">
        <Header title="Create Group" isSkip={true} />
        
        <View className="p-4">
          <TextInput
            className="bg-gray-700 text-white rounded-lg px-4 py-3 mb-4"
            placeholder="Group Name"
            placeholderTextColor="#999"
            value={groupName}
            onChangeText={setGroupName}
          />
          
          <TextInput
            className="bg-gray-700 text-white rounded-lg px-4 py-3 mb-4"
            placeholder="Search Users"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          {selectedUsers.length > 0 && (
            <View className="mb-4">
              <Text className="text-white mb-2">Selected Users ({selectedUsers.length})</Text>
              <View className="flex-row flex-wrap">
                {selectedUsers.map(user => (
                  <View key={user._id} className="bg-gray-700 rounded-full px-3 py-1 m-1 flex-row items-center">
                    <Text className="text-white mr-2">{user.name}</Text>
                    <TouchableOpacity onPress={() => handleUserSelect(user)}>
                      <Text className="text-red-500">✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
        />
        
        <View className="p-4">
          <Button
            text="Create Group"
            buttonColor="bg-[#FFCD00]"
            textColor="text-black"
            onPress={handleCreateGroup}
            textClassName="font-poppins-semibold text-base tracking-wider"
            loading={!groupName.trim() || selectedUsers.length < 1}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default CreateGroupScreen;
