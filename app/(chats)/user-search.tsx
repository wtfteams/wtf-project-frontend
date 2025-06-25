// import { axiosInstance } from '@/api/axios';
// import { Header } from '@/components';
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import React, { useState } from 'react';
// import { ActivityIndicator, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const UserSearchScreen = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) return;
//     setLoading(true);
//     try {
//       const response = await axiosInstance.get(`/users?search=${searchQuery}`);
//       setUsers(response.data);
//     } catch (error) {
//       console.error('Error searching users:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUserSelect = async (userId:any) => {
//     try {
//       setLoading(true);
//       router.push('/(chats)/chat-detail');
//     } catch (error) {
//       console.error('Error accessing chat:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View className="flex-1 bg-[#192230]">
//       <SafeAreaView edges={['top']} className="flex-1">
//         <Header title="Find Users" />
        
//         <View className="p-4">
//           <View className="flex-row items-center bg-gray-700 rounded-lg px-4 py-2 mb-4">
//             <TextInput
//               className="flex-1 text-white"
//               placeholder="Search users..."
//               placeholderTextColor="#999"
//               value={searchQuery}
//               autoCapitalize="none"
//               onChangeText={setSearchQuery}
//               onSubmitEditing={handleSearch}
//             />
//             <TouchableOpacity onPress={handleSearch}>
//               <Ionicons name="search" size={24} color="#FFCD00" />
//             </TouchableOpacity>
//           </View>
//         </View>
        
//         {loading ? (
//           <ActivityIndicator size="large" color="#FFCD00" />
//         ) : (
//           <FlatList
//             data={users}
//             keyExtractor={(user:any) => user._id }
//             renderItem={({ item }) => (
//               <TouchableOpacity 
//                 className="flex-row items-center p-4 border-b border-gray-700"
//                 onPress={() => handleUserSelect(item._id)}
//               >
//                 <Image 
//                   source={{ uri: item.avatar || '' }} 
//                   className="w-12 h-12 rounded-full"
//                 />
//                 <View className="ml-3">
//                   <Text className="text-white font-semibold">{item.name}</Text>
//                   <Text className="text-gray-400">{item.email}</Text>
//                 </View>
//               </TouchableOpacity>
//             )}
//             ListEmptyComponent={
//               <View className="p-4">
//                 <Text className="text-white text-center">
//                   {searchQuery ? "No users found" : "Search for users to start chatting"}
//                 </Text>
//               </View>
//             }
//           />
//         )}
//       </SafeAreaView>
//     </View>
//   );
// };

// export default UserSearchScreen;