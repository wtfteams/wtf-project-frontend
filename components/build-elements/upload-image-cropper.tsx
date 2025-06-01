import React from "react";

import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Animated,
  Dimensions,
  ImageSourcePropType,
  Linking,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FeatherIcons from "./FeatherIcons";

const UploadImageCropper = ({
  children,
  setImage,
  showModal,
  setShowModal,
  title = "Upload Image",
  maxImages = 1,
}: {
  children: React.ReactNode;
  setImage: React.Dispatch<React.SetStateAction<ImageSourcePropType>>;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  maxImages?: number;
}) => {
  const screenHeight = Dimensions.get("window").height;
  const modalHeight = screenHeight * 0.3;
  const slideAnim = React.useRef(new Animated.Value(screenHeight)).current;
  const [images, setImages] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (showModal) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showModal]);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need camera access to take photos",
        [
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
          { text: "Cancel" },
        ]
      );
    }
    return status === "granted";
  };

  const requestGalleryPermission = async () => {
    const { status, canAskAgain } =
      await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status === "granted") return true;
    if (!canAskAgain) return false;
    const { status: newStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    return newStatus === "granted";
  };

  const handleImagePick = async (type: "camera" | "gallery") => {
    try {
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
          }));
      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage({ uri: result.assets[0].uri });
        setShowModal(false);
      }
    } catch (error) {
      console.error(`${type} Error:`, error);
      Alert.alert("Error", `Could not open ${type}`);
    }
  };

  return (
    <>
      {children}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowModal(false)}
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
                {title}
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center items-center gap-12 my-8">
              <TouchableOpacity
                onPress={() => handleImagePick("camera")}
                className="items-center "
              >
                <View className="bg-fourth rounded-full w-20 h-20 items-center justify-center mb-2">
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
              >
                <View className="bg-fourth rounded-full w-20 h-20 items-center justify-center mb-2">
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
    </>
  );
};

export default UploadImageCropper;
