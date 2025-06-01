import React, { useState, useRef, useEffect } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FeatherIcons from "../build-elements/FeatherIcons";

interface Rule {
  id: string;
  text: string;
}

interface Props {
  label: string;
  value: Rule[] | null;
  onChange: (value: Rule[]) => void;
  placeholder?: string;
  title?: string;
  error?: string;
  endIcon?: string;
  startIcon?: string;
  iconWidth?: number;
  iconHeight?: number;
  iconStrokeColor?: string;
  iconFillColor?: string;
}

export default function SelectRules({
  label,
  value,
  onChange,
  placeholder = "Add rules",
  title = "Event Rules",
  error = "",
  endIcon,
  startIcon,
  iconWidth = 20,
  iconHeight = 20,
  iconStrokeColor = "white",
  iconFillColor = "white",
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [rules, setRules] = useState<Rule[]>(value || []);
  const [newRule, setNewRule] = useState("");
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const screenHeight = Dimensions.get("window").height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const inputRef = useRef<TextInput>(null);
  const editInputRef = useRef<TextInput>(null);

  const openModal = () => {
    slideAnim.setValue(screenHeight);
    setModalVisible(true);
  };

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();
      // Focus the input after animation completes
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const handleAddRule = () => {
    if (newRule.trim()) {
      const updatedRules = [
        ...rules,
        { id: Date.now().toString(), text: newRule.trim() },
      ];
      setRules(updatedRules);
      setNewRule("");
      onChange(updatedRules);
    }
  };

  const handleDeleteRule = (id: string) => {
    const updatedRules = rules.filter((rule) => rule.id !== id);
    setRules(updatedRules);
    onChange(updatedRules);
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRuleId(rule.id);
    setEditingText(rule.text);
    setTimeout(() => editInputRef.current?.focus(), 100);
  };

  const handleSaveEdit = () => {
    if (editingRuleId && editingText.trim()) {
      const updatedRules = rules.map((rule) =>
        rule.id === editingRuleId ? { ...rule, text: editingText.trim() } : rule
      );
      setRules(updatedRules);
      onChange(updatedRules);
      setEditingRuleId(null);
      setEditingText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setEditingText("");
  };

  const handleConfirm = () => {
    // Save any pending edits before closing
    if (editingRuleId && editingText.trim()) {
      handleSaveEdit();
    }
    onChange(rules);
    setModalVisible(false);
  };

  const getRulesSummary = () => {
    if (!rules || rules.length === 0) return null;
    return `${rules.length} rule${rules.length > 1 ? "s" : ""}`;
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

        <View className="flex-row items-center flex-1">
          <Text
            className={`
              font-poppins-medium text-base tracking-wide
              ${
                rules && rules.length > 0
                  ? "text-white text-sm"
                  : "text-textWhiteShade text-sm"
              }
            `}
          >
            {rules && rules.length > 0 ? getRulesSummary() : placeholder}
          </Text>
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
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-primary">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <Animated.View
              className="flex-1 bg-tertiary"
              style={{
                transform: [{ translateY: slideAnim }],
              }}
            >
              <StatusBar barStyle="light-content" />
              <View className="flex-row justify-between items-center px-4 pt-4 pb-2 border-b border-fourth">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="p-2"
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-poppins-semibold text-lg">
                  {title}
                </Text>
                <TouchableOpacity onPress={handleConfirm} className="p-2">
                  <Text className="text-secondary font-poppins-medium">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-1 px-4">
                {rules.length > 0 ? (
                  <FlatList
                    data={rules}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                      <View className="flex-row items-center py-4 border-b border-fourth">
                        <View className="w-8 h-8 bg-fourth rounded-full items-center justify-center mr-3">
                          <Text className="text-white font-poppins-medium">
                            {index + 1}
                          </Text>
                        </View>

                        {editingRuleId === item.id ? (
                          <View className="flex-1 flex-row items-center">
                            <TextInput
                              ref={editInputRef}
                              value={editingText}
                              onChangeText={setEditingText}
                              className="flex-1 bg-fourth rounded-lg px-4 py-2 text-white font-poppins-regular"
                              autoFocus
                              onSubmitEditing={handleSaveEdit}
                              returnKeyType="done"
                            />
                            <TouchableOpacity
                              onPress={handleSaveEdit}
                              className="ml-2 p-2"
                            >
                              <Ionicons
                                name="checkmark"
                                size={20}
                                color="#2ecc71"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={handleCancelEdit}
                              className="p-2"
                            >
                              <Ionicons
                                name="close"
                                size={20}
                                color="#e74c3c"
                              />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <>
                            <Text className="text-white flex-1 font-poppins-regular">
                              {item.text}
                            </Text>
                            <TouchableOpacity
                              onPress={() => handleEditRule(item)}
                              className="p-2 mr-1"
                            >
                              <Ionicons
                                name="pencil"
                                size={18}
                                color="#3498db"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteRule(item.id)}
                              className="p-2"
                            >
                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color="#e74c3c"
                              />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                  />
                ) : (
                  <View className="items-center justify-center py-10">
                    <Ionicons name="list" size={48} color="#FFFFFF40" />
                    <Text className="text-textWhiteShade font-poppins-medium mt-4">
                      No rules added yet
                    </Text>
                    <Text className="text-textWhiteShade font-poppins-regular text-xs mt-2 text-center px-10">
                      Add your first rule using the input field below
                    </Text>
                  </View>
                )}
              </View>

              <View className="px-4 pb-6 pt-2 border-t border-fourth bg-tertiary">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-secondary rounded-full items-center justify-center mr-3">
                    <Text className="text-black font-poppins-medium">
                      {rules.length + 1}
                    </Text>
                  </View>
                  <TextInput
                    ref={inputRef}
                    value={newRule}
                    onChangeText={setNewRule}
                    placeholder="Add a new rule..."
                    placeholderTextColor="#FFFFFF80"
                    className="flex-1 bg-fourth rounded-lg px-4 py-3 text-white font-poppins-regular"
                    onSubmitEditing={handleAddRule}
                    returnKeyType="done"
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    onPress={handleAddRule}
                    className="ml-3 bg-secondary p-3 rounded-full"
                    disabled={!newRule.trim()}
                    style={{ opacity: newRule.trim() ? 1 : 0.5 }}
                  >
                    <Ionicons name="add" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
