import React, { useState, useRef, useEffect } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  Platform,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FeatherIcons from "../build-elements/FeatherIcons";
import * as ImagePicker from "expo-image-picker";

interface Props {
  label: string;
  value: string[] | null | undefined | string;
  onChange: (value: string[] | string) => void;
  placeholder?: string;
  title?: string;
  error?: string;
  endIcon?: string;
  startIcon?: string;
  iconWidth?: number;
  iconHeight?: number;
  iconStrokeColor?: string;
  iconFillColor?: string;
  maxImages?: number;
}

export default function SelectImage({
  label,
  value,
  onChange,
  placeholder = "Select images",
  title = "Upload Images",
  error = "",
  endIcon,
  startIcon,
  iconWidth = 20,
  iconHeight = 20,
  iconStrokeColor = "white",
  iconFillColor = "white",
  maxImages = 5,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState<{ uri: string }[]>(
    Array.isArray(value)
      ? value.map((uri: string) => ({ uri }))
      : typeof value === "string"
      ? [{ uri: value }]
      : []
  );

  const screenHeight = Dimensions.get("window").height;
  const modalHeight = screenHeight * 0.3;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    // Update internal state when external value changes
    if (value) {
      setImages(
        Array.isArray(value)
          ? value.map((uri: string) => ({ uri }))
          : typeof value === "string"
          ? [{ uri: value }]
          : []
      );
    } else {
      setImages([]);
    }
  }, [value]);

  const openModal = () => {
    slideAnim.setValue(screenHeight);
    setModalVisible(true);
  };

  useEffect(() => {
    if (modalVisible) {
      // Use spring animation for a natural feel on both platforms
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      // Use timing animation for closing
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const handleCancel = () => {
    setModalVisible(false);
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera permission is required to take photos"
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Gallery permission is required to select photos"
      );
      return false;
    }
    return true;
  };

  const handleImagePick = async (type: "camera" | "gallery") => {
    try {
      if (images.length >= maxImages) {
        Alert.alert(
          "Maximum images",
          `You can only select up to ${maxImages} images`
        );
        return;
      }

      const hasPermission =
        type === "camera"
          ? await requestCameraPermission()
          : await requestGalleryPermission();
      if (!hasPermission) return;

      const result = await (type === "camera"
        ? ImagePicker.launchCameraAsync({
            cameraType: ImagePicker.CameraType.front,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            allowsMultipleSelection: true,
            selectionLimit: maxImages - images.length,
          }));

      if (!result.canceled && result.assets?.length > 0) {
        const newImages = [...images];

        result.assets.forEach((asset) => {
          if (newImages.length < maxImages) {
            newImages.push({ uri: asset.uri });
          }
        });

        setImages(newImages);
        onChange(newImages.map((img) => img.uri));
        setModalVisible(false);
      }
    } catch (error) {
      console.error(`${type} Error:`, error);
      Alert.alert("Error", `Could not open ${type}`);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    onChange(newImages.map((img) => img.uri));
  };

  return (
    <View className="w-full mb-5">
      <Text className="text-textWhiteShade tracking-wide text-base mb-2 font-poppins-medium">
        {label}
      </Text>

      <TouchableOpacity
        onPress={openModal}
        activeOpacity={0.8}
        className={`
          bg-tertiary rounded-[10px] py-4 px-4
          border-2 ${error ? "border-red-500" : "border-fourth"}
          flex-row justify-between items-center
        `}
      >
        {startIcon && (
          <View className="mr-3">
            <FeatherIcons
              icon={startIcon}
              iconWidth={iconWidth}
              iconHeight={iconHeight}
              iconStrokeColor={iconStrokeColor}
              iconFillColor={iconFillColor}
            />
          </View>
        )}

        <View className="flex-1 ">
          <View className="flex-row items-center flex-wrap">
            {images.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {images.map((img, index) => (
                  <View key={index} className="relative mr-2">
                    <Image
                      source={{ uri: img.uri }}
                      className="w-12 h-12 rounded-full"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      className="absolute -top-0 -right-1 bg-secondary text-black rounded-full w-6 h-6 items-center justify-center"
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close" size={16} color="black" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text className="font-poppins-medium text-base tracking-wide flex-1 text-textWhiteShade text-sm">
                {placeholder}
              </Text>
            )}
          </View>
          {images.length > 0 && (
            <Text className="text-white text-xs mt-1">
              {images.length} of {maxImages} images selected
            </Text>
          )}
        </View>

        {endIcon ? (
          <View className="ml-3">
            <FeatherIcons
              icon={endIcon}
              iconWidth={iconWidth}
              iconHeight={iconHeight}
              iconStrokeColor={iconStrokeColor}
              iconFillColor={iconFillColor}
            />
          </View>
        ) : (
          <Ionicons name="chevron-down" size={20} color="#FFFFFF80" />
        )}
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 text-xs font-poppins-regular ml-1 mt-1">
          {error}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCancel}
        statusBarTranslucent={true}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Animated.View
            className="bg-tertiary rounded-t-[20px] p-5"
            style={{
              maxHeight: modalHeight,
              transform: [{ translateY: slideAnim }],
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 5,
                },
              }),
            }}
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-poppins-semibold text-lg">
                {title} ({images.length}/{maxImages})
              </Text>
              <TouchableOpacity
                onPress={handleCancel}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center items-center gap-12 my-8">
              <TouchableOpacity
                onPress={() => handleImagePick("camera")}
                className="items-center"
                disabled={images.length >= maxImages}
              >
                <View
                  className={`bg-fourth rounded-full w-20 h-20 items-center justify-center mb-2 ${
                    images.length >= maxImages ? "opacity-50" : ""
                  }`}
                >
                  <FeatherIcons
                    icon="camera-icon"
                    iconWidth={40}
                    iconHeight={40}
                    iconStrokeColor="#ffcd00"
                    iconFillColor="transparent"
                  />
                </View>
                <Text className="text-white font-poppins-medium text-sm">
                  Camera
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleImagePick("gallery")}
                className="items-center"
                disabled={images.length >= maxImages}
              >
                <View
                  className={`bg-fourth rounded-full w-20 h-20 items-center justify-center mb-2 ${
                    images.length >= maxImages ? "opacity-50" : ""
                  }`}
                >
                  <FeatherIcons
                    icon="gallery-icon"
                    iconWidth={40}
                    iconHeight={40}
                    iconStrokeColor="#ffcd00"
                    iconFillColor="transparent"
                  />
                </View>
                <Text className="text-white font-poppins-medium text-sm">
                  Gallery
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
