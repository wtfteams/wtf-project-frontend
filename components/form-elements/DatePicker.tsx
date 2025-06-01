import React, { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  label?: string;
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  maxDate?: Date;
  minDate?: Date;
  error?: string;
  mode?: "date" | "time" | "datetime";
  displayFormat?: string;
}

const WheelPicker = ({
  items,
  selectedIndex,
  onIndexChange,
  containerStyle,
}: {
  items: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  containerStyle?: any;
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Ensure the ScrollView snaps to the selected index when it changes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: selectedIndex * 40, animated: false });
    }
  }, [selectedIndex]);

  return (
    <View style={[{ height: 200 }, containerStyle]}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={40}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: 80 }}
        onMomentumScrollEnd={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const index = Math.round(y / 40);
          if (index >= 0 && index < items.length) {
            onIndexChange(index);
          }
        }}
        scrollEventThrottle={16}
        style={{ zIndex: 3 }} // Ensure ScrollView is above highlight
      >
        {items.map((item, index) => (
          <View key={index} style={{ height: 40, justifyContent: "center" }}>
            <Text
              style={[
                styles.pickerItemText,
                selectedIndex === index && styles.pickerItemTextSelected,
              ]}
            >
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default function DatePicker({
  label = "Date of birth",
  value,
  onChange,
  placeholder = "Select date",
  maxDate,
  minDate,
  error = "",
  mode = "date",
  displayFormat,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  // Use a safe default for tempDate
  const [tempDate, setTempDate] = useState(
    value instanceof Date && !isNaN(value.getTime()) ? value : new Date()
  );
  const [currentMode, setCurrentMode] = useState<"date" | "time">(
    mode === "time" ? "time" : "date"
  );

  const screenHeight = Dimensions.get("window").height;
  const modalHeight = screenHeight * 0.6;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  // Generate years with some padding (100 years)
  const currentYear = new Date().getFullYear();
  const startYear = minDate ? minDate.getFullYear() : currentYear - 80;
  const endYear = maxDate ? maxDate.getFullYear() : currentYear + 20;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => (startYear + i).toString()
  );

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  // For time picker
  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = i === 0 ? 12 : i;
    return hour.toString().padStart(2, "0");
  });
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const ampm = ["AM", "PM"];

  // Utility function to get days in month
  const getDayCount = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Reset currentMode and tempDate when mode prop changes or modal opens
  useEffect(() => {
    if (mode === "datetime") {
      setCurrentMode("date");
    } else {
      setCurrentMode(mode === "time" ? "time" : "date");
    }
    // Use a safe default for tempDate
    setTempDate(
      value instanceof Date && !isNaN(value.getTime()) ? value : new Date()
    );
  }, [mode, modalVisible, value]);

  const openModal = () => {
    // Initialize with current value or default to today
    setTempDate(
      value instanceof Date && !isNaN(value.getTime()) ? value : new Date()
    );
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
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (!modalVisible) {
          setCurrentMode(mode === "time" ? "time" : "date");
        }
      });
    }
  }, [modalVisible, screenHeight, slideAnim, mode]);

  const handleDateConfirm = () => {
    if (mode === "datetime" && currentMode === "date") {
      setCurrentMode("time");
    } else {
      onChange(tempDate);
      setModalVisible(false);
    }
  };

  const getFormattedValue = () => {
    if (!(tempDate instanceof Date) || isNaN(tempDate.getTime())) return "";

    if (displayFormat) {
      return format(tempDate, displayFormat);
    }

    switch (mode) {
      case "date":
        return format(tempDate, "MMM dd, yyyy");
      case "time":
        return format(tempDate, "h:mm a");
      case "datetime":
        return format(tempDate, "MMM dd, yyyy - h:mm a");
      default:
        return format(tempDate, "MMM dd, yyyy");
    }
  };

  const formattedDate = getFormattedValue();

  const getModalTitle = () => {
    if (mode === "time") return "Select Time";
    if (mode === "datetime") {
      return currentMode === "date" ? "Select Date" : "Select Time";
    }
    return `Select ${label}`;
  };

  const getConfirmButtonText = () => {
    if (mode === "datetime" && currentMode === "date") {
      return "Next";
    }
    return "Confirm";
  };

  // Date picker handlers with validation
  const handleYearChange = (index: number) => {
    if (index < 0 || index >= years.length) return;

    const newYear = parseInt(years[index]);
    const newDate = new Date(tempDate);
    newDate.setFullYear(newYear);

    const currentDay = newDate.getDate();
    const dayCount = getDayCount(newYear, newDate.getMonth());

    if (currentDay > dayCount) {
      newDate.setDate(dayCount);
    }

    setTempDate(newDate);
  };

  const handleMonthChange = (index: number) => {
    if (index < 0 || index >= 12) return;

    const newDate = new Date(tempDate);
    newDate.setMonth(index);

    const currentDay = newDate.getDate();
    const dayCount = getDayCount(newDate.getFullYear(), index);

    if (currentDay > dayCount) {
      newDate.setDate(dayCount);
    }

    setTempDate(newDate);
  };

  const handleDayChange = (index: number) => {
    if (index < 0) return;

    const newDay = index + 1;
    const newDate = new Date(tempDate);
    const dayCount = getDayCount(newDate.getFullYear(), newDate.getMonth());

    if (newDay <= dayCount) {
      newDate.setDate(newDay);
      setTempDate(newDate);
    }
  };

  // Time picker handlers
  const handleHourChange = (index: number) => {
    if (index < 0 || index >= hours.length) return;

    const hourValue = parseInt(hours[index]);
    const newDate = new Date(tempDate);
    const isPM = newDate.getHours() >= 12;

    let newHour = hourValue;
    if (isPM && hourValue !== 12) {
      newHour = hourValue + 12;
    }
    if (!isPM && hourValue === 12) {
      newHour = 0;
    }

    newDate.setHours(newHour);
    setTempDate(newDate);
  };

  const handleMinuteChange = (index: number) => {
    if (index < 0 || index >= 60) return;

    const newDate = new Date(tempDate);
    newDate.setMinutes(index);
    setTempDate(newDate);
  };

  const handleAmPmChange = (index: number) => {
    if (index < 0 || index > 1) return;

    const isPM = index === 1;
    const newDate = new Date(tempDate);
    let hours = newDate.getHours();

    if (isPM && hours < 12) {
      newDate.setHours(hours + 12);
    } else if (!isPM && hours >= 12) {
      newDate.setHours(hours - 12);
    }

    setTempDate(newDate);
  };

  // Validate date against min/max constraints
  const validateDateRange = (date: Date): boolean => {
    if (minDate && date < minDate) {
      return false;
    }
    if (maxDate && date > maxDate) {
      return false;
    }
    return true;
  };

  // Calculate indices for picker wheels
  const getYearIndex = () => {
    const year = tempDate.getFullYear();
    return years.indexOf(year.toString());
  };

  const getMonthIndex = () => {
    return tempDate.getMonth();
  };

  const getDayIndex = () => {
    return tempDate.getDate() - 1;
  };

  const getHourIndex = () => {
    let hour = tempDate.getHours() % 12;
    if (hour === 0 && tempDate.getHours() !== 0) hour = 12;
    return hours.indexOf(hour.toString().padStart(2, "0"));
  };

  const getMinuteIndex = () => {
    return tempDate.getMinutes();
  };

  const getAmPmIndex = () => {
    return tempDate.getHours() >= 12 ? 1 : 0;
  };

  const getValidDaysForCurrentMonth = () => {
    const dayCount = getDayCount(tempDate.getFullYear(), tempDate.getMonth());
    return days.slice(0, dayCount);
  };

  const handleConfirm = () => {
    if (!validateDateRange(tempDate)) {
      if (minDate && tempDate < minDate) {
        setTempDate(new Date(minDate));
      } else if (maxDate && tempDate > maxDate) {
        setTempDate(new Date(maxDate));
      }
      return;
    }
    handleDateConfirm();
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
        <Text
          className={`
            font-poppins-medium text-base tracking-wide
            ${formattedDate ? "text-white text-sm" : "text-textWhiteShade text-sm"}
          `}
        >
          {formattedDate || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#FFFFFF80" />
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
        <View className="flex-1 justify-end bg-black/50">
          <Animated.View
            className="bg-tertiary rounded-t-[20px] p-5"
            style={{
              maxHeight: modalHeight,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-white font-poppins-semibold text-lg">
                {getModalTitle()}
              </Text>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerWrapper}>
              {currentMode === "date" && (
                <View style={styles.pickerContainer}>
                  <WheelPicker
                    items={months}
                    selectedIndex={getMonthIndex()}
                    onIndexChange={handleMonthChange}
                    containerStyle={{ width: 100 }}
                  />
                  <WheelPicker
                    items={getValidDaysForCurrentMonth()}
                    selectedIndex={getDayIndex()}
                    onIndexChange={handleDayChange}
                    containerStyle={{ width: 80 }}
                  />
                  <WheelPicker
                    items={years}
                    selectedIndex={getYearIndex()}
                    onIndexChange={handleYearChange}
                    containerStyle={{ width: 100 }}
                  />
                  {/* Add single highlight box with radius */}
                  <View style={styles.pickerHighlight} />
                </View>
              )}

              {currentMode === "time" && (
                <View style={styles.pickerContainer}>
                  <WheelPicker
                    items={hours}
                    selectedIndex={getHourIndex()}
                    onIndexChange={handleHourChange}
                    containerStyle={{ width: 80 }}
                  />
                  <Text style={styles.pickerSeparator}>:</Text>
                  <WheelPicker
                    items={minutes}
                    selectedIndex={getMinuteIndex()}
                    onIndexChange={handleMinuteChange}
                    containerStyle={{ width: 80 }}
                  />
                  <WheelPicker
                    items={ampm}
                    selectedIndex={getAmPmIndex()}
                    onIndexChange={handleAmPmChange}
                    containerStyle={{ width: 80 }}
                  />
                  {/* Add single highlight box with radius */}
                  <View style={styles.pickerHighlight} />
                </View>
              )}
            </View>

            <View className="flex-row justify-between my-8">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setModalVisible(false)}
                className="bg-white py-3 px-6 rounded-[38px] flex-1 mr-2"
              >
                <Text className="font-poppins-medium text-center">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleConfirm}
                className="bg-secondary py-3 px-6 rounded-[38px] flex-1 ml-2"
              >
                <Text className="text-black font-poppins-medium text-center">
                  {getConfirmButtonText()}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  pickerWrapper: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    position: "relative",
    paddingHorizontal: 10,
    // Ensure container doesn't block touch events
    pointerEvents: "box-none",
  },
  pickerHighlight: {
    position: "absolute",
    width: "100%",
    height: 40,
    top: 80,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    zIndex: 1,
    pointerEvents: "none", // This makes the highlight non-interactive
  },
  pickerItemText: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    zIndex: 2,
  },
  pickerItemTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  pickerSeparator: {
    fontSize: 24,
    color: "white",
    paddingHorizontal: 5,
    marginTop: 0,
    zIndex: 2,
  },
});
