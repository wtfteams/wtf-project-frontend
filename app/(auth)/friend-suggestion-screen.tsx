import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useNavigation } from "@react-navigation/native";
import { Button, Header } from "@/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isAppUser: boolean;
  isSelected: boolean;
}

import { ParamListBase } from "@react-navigation/native";

interface RootStackParamList extends ParamListBase {
  Home: undefined;
  Friends: undefined;
}

export default function FriendsSuggestionScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === "granted") {
          fetchContactsAndCheckAppUsers();
        } else {
          // Handle permission denied
          setLoading(false);
        }
      } catch (error) {
        console.error("Error requesting contacts permission:", error);
        setLoading(false);
      }
    })();
  }, []);

  // Fetch contacts and check which ones are app users
  const fetchContactsAndCheckAppUsers = async () => {
    try {
      // Fetch device contacts
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      // This would be replaced with your actual API call to check which contacts are app users
      const mockApiCall = async (phoneContacts: Contacts.Contact[]) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - this would be your actual API response
        // Creating 10 mock contacts that are app users (as shown in the image)
        return Array(10)
          .fill(0)
          .map((_, index) => ({
            id: `banish_${index}`,
            name: "Banish",
            username: "ba_ni_sh",
            avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
            isAppUser: true,
            isSelected: true,
          }));
      };

      // This would call your backend API to check which contacts have accounts
      const appUsers = await mockApiCall(data);
      setContacts(appUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setLoading(false);
    }
  };

  // Toggle selection of a contact
  const toggleContactSelection = (id: string) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.id === id
          ? { ...contact, isSelected: !contact.isSelected }
          : contact
      )
    );
  };

  // Add selected friends
  const addSelectedFriends = () => {
    const selectedFriends = contacts.filter((contact) => contact.isSelected);
    // Here you would send the selected friends to your backend
    console.log("Selected friends:", selectedFriends);

    // Navigate back or to next screen
    router.push("/(events)/event-screen");
  };

  // Skip adding friends
  const skipAddingFriends = () => {
    navigation.goBack();
  };

  // Render a contact item with consistent design across devices
  const renderContactItem = ({
    item,
    index,
  }: {
    item: Contact;
    index: number;
  }) => (
    <TouchableOpacity
      onPress={() => toggleContactSelection(item.id)}
      className="flex-row items-center justify-between p-3 mb-1 border-b border-b-fourth"
    >
      <View className="flex-row items-center">
        <Image
          source={{ uri: item.avatar }}
          className="w-12 h-12 rounded-full"
        />
        <View className="ml-3">
          <Text className="text-white text-lg font-poppins-medium">
            {item.name}
          </Text>
          <Text className="text-textWhiteShade text-sm font-poppins-regular">
            {item.username}
          </Text>
        </View>
      </View>

      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: item.isSelected ? "#ffcd00" : "transparent",
          borderWidth: item.isSelected ? 0 : 1,
          borderColor: "rgba(255, 255, 255, 0.3)",
        }}
      >
        {item.isSelected && (
          <Ionicons name="checkmark" size={18} color="#000" />
        )}
      </View>
    </TouchableOpacity>
  );

  // Use safe area insets for consistent padding across devices
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header with consistent padding */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: Platform.OS === "android" ? 10 : 0,
        }}
      >
        <Header isSkip={true} />
      </View>

      {/* Title with consistent padding */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <Text className="text-white text-3xl font-poppins-regular">
          Add friends
        </Text>
        <Text className="text-textWhiteShade text-sm mt-1 font-poppins-regular">
          people you might know, they are already using WTF app.
        </Text>
      </View>

      {/* Contact list with consistent styling */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#2c2f38",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
          borderBottomLeftRadius: 24,
          marginHorizontal: 20,
          paddingHorizontal: 16,
          paddingTop: 16,
          marginBottom: 70
        }}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#ffcd00" />
          </View>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContactItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 100 + insets.bottom,
            }}
          />
        )}
      </View>

      {/* Add friends button with consistent positioning */}
      <View
        style={{
          bottom: insets.bottom > 0 ? insets.bottom : 50,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
        }}
      >
        <Button
          text="Add Friends"
          buttonColor="bg-secondary"
          textColor="text-black"
          onPress={() =>router.push("/(auth)/create-event-screen-one")}
          className="rounded-[38px]"
          textClassName="font-poppins-semibold text-base tracking-wider"
        />
      </View>
    </SafeAreaView>
  );
}
