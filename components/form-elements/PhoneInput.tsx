import React, { useState } from "react";

import { Feather } from "@expo/vector-icons";
import {
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
];

interface PhoneInputProps {
  value: string | undefined;
  onChangePhone: (phone: string) => void ;
  onChangeCountry?: (country: Country) => void;
  placeholder?: string;
  containerClassName?: string;
  inputClassName?: string;
  label?: string;
  error?: string;
  description?: string;
}

export default function PhoneInput({
  value,
  onChangePhone,
  onChangeCountry,
  placeholder = "Enter phone number",
  containerClassName = "",
  inputClassName = "",
  label,
  error,
  description,
}: PhoneInputProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    if (onChangeCountry) {
      onChangeCountry(country);
    }
    setModalVisible(false);
  };

  const filteredCountries = searchQuery
    ? countries.filter(
        (country) =>
          country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.dialCode.includes(searchQuery) ||
          country.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : countries;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View className={`mb-4 w-full ${containerClassName}`}>
      {/* Label */}
      {label !== "" && typeof label !== "undefined" && (
        <Text className="text-textWhiteShade tracking-wide text-base mb-2 font-poppins-medium">
          {label}
        </Text>
      )}

      <View
        className={`flex-row bg-tertiary items-center border-2 rounded-[10px] ${
          isFocused ? "border-2 border-fourth" : "border-fourth"
        } ${error ? "border-red-500" : ""}`}
        style={{
          // Ensure consistent shadows across platforms
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 1.5,
            },
            android: {
              elevation: 2,
            },
          }),
        }}
      >
        {/* Country Code Button */}
        <TouchableOpacity
          className="flex-row items-center px-3 py-4"
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text className="mr-1 text-lg">{selectedCountry.flag}</Text>
          <Text className="mr-1 font-poppins-medium text-white">
            {selectedCountry.dialCode}
          </Text>
          <Feather name="chevron-down" size={16} color="#FFFFFF80" />
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          className={`flex-1 py-4 px-3 text-white font-poppins-medium tracking-wide text-left ${inputClassName}`}
          value={value}
          onChangeText={onChangePhone}
          placeholder={placeholder}
          placeholderTextColor="#FFFFFF80"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          selectionColor="#ffcd00"
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            // Ensure consistent text input styling
            ...Platform.select({
              ios: {
                paddingVertical: 12,
              },
              android: {
                paddingVertical: 10,
              },
            }),
          }}
        />
      </View>

      {/* Description or Error Message */}
      {error ? (
        <Text className="text-red-500 text-sm mt-1 font-poppins-regular">{error}</Text>
      ) : description ? (
        <Text className="text-gray-500 text-sm mt-1 font-poppins-regular">{description}</Text>
      ) : null}

      {/* Country Selection Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-primary" style={{ paddingTop: Platform.OS === 'android' ? 25 : 0 }}>
          <View className="p-4 border-b border-fourth gap-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-white">
                Select Country
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View className="mt-2 flex-row items-center border border-fourth rounded-lg px-3 py-3">
              <Feather name="search" size={18} color="#FFFFFF80" />
              <TextInput
                className="flex-1 ml-2 py-1 text-white"
                placeholder="Search by country name or code"
                placeholderTextColor="#FFFFFF80"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Feather name="x-circle" size={18} color="#FFFFFF80" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`flex-row items-center p-4 border-b border-fourth ${
                  selectedCountry.code === item.code ? "bg-tertiary" : ""
                }`}
                onPress={() => handleCountrySelect(item)}
                activeOpacity={0.7}
              >
                <Text className="text-lg mr-3">{item.flag}</Text>
                <View className="flex-1">
                  <Text className="font-medium text-white">{item.name}</Text>
                  <Text className="text-textWhiteShade">{item.dialCode}</Text>
                </View>
                {selectedCountry.code === item.code && (
                  <Feather name="check" size={20} color="#FFCD00" />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
