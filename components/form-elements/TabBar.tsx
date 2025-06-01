import React, { useMemo } from 'react';
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced TypeScript interfaces
interface TabItem {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  style?: ViewStyle;
  tabStyle?: ViewStyle;
  activeTabStyle?: ViewStyle;
  textStyle?: TextStyle;
  activeTextStyle?: TextStyle;
  backgroundColor?: string;
  activeBackgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  animationDuration?: number;
  testID?: string;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs = [],
  activeTab = '',
  onTabChange,
  style,
  tabStyle,
  activeTabStyle,
  textStyle,
  activeTextStyle,
  backgroundColor = '#2C2F38',
  activeBackgroundColor = '#007AFF',
  borderRadius = 12,
  padding = 4,
  testID = 'tab-bar',
}) => {
  // Memoized validation
  const isValid = useMemo(() => {
    if (!Array.isArray(tabs) || tabs.length === 0) return false;
    if (typeof onTabChange !== 'function') return false;
    
    return tabs.every(tab => 
      tab && 
      typeof tab.id === 'string' && 
      typeof tab.label === 'string' && 
      typeof tab.value === 'string' &&
      tab.id.trim() !== '' &&
      tab.label.trim() !== '' &&
      tab.value.trim() !== ''
    );
  }, [tabs, onTabChange]);

  // Memoized styles
  const containerStyle = useMemo((): ViewStyle => ({
    ...styles.container,
    backgroundColor,
    borderRadius,
    padding,
    ...style,
  }), [backgroundColor, borderRadius, padding, style]);

  const getTabStyle = useMemo(() => (isActive: boolean): ViewStyle => ({
    ...styles.tab,
    backgroundColor: isActive ? activeBackgroundColor : 'transparent',
    borderRadius: borderRadius - 2,
    ...tabStyle,
    ...(isActive ? activeTabStyle : {}),
    ...Platform.select({
      ios: {
        shadowColor: isActive ? '#000' : 'transparent',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isActive ? 0.1 : 0,
        shadowRadius: isActive ? 2 : 0,
      },
      android: {
        elevation: isActive ? 2 : 0,
      },
    }),
  }), [activeBackgroundColor, borderRadius, tabStyle, activeTabStyle]);

  const getTextStyle = useMemo(() => (isActive: boolean): TextStyle => ({
    ...styles.text,
    color: isActive ? '#FFFFFF' : '#8E8E93',
    fontWeight: isActive ? '600' : '500',
    ...textStyle,
    ...(isActive ? activeTextStyle : {}),
  }), [textStyle, activeTextStyle]);

  // Handle tab press
  const handleTabPress = (tab: TabItem) => {
    if (tab.disabled || tab.value === activeTab) return;
    onTabChange(tab.value);
  };

  // Error states
  if (!isValid) {
    return (
      <View style={[containerStyle, styles.errorContainer]} testID={`${testID}-error`}>
        <Text style={styles.errorText}>
          {!Array.isArray(tabs) || tabs.length === 0 
            ? 'No tabs provided' 
            : 'Invalid tab configuration'}
        </Text>
      </View>
    );
  }

  if (typeof onTabChange !== 'function') {
    return (
      <View style={[containerStyle, styles.errorContainer]} testID={`${testID}-error`}>
        <Text style={styles.errorText}>onTabChange function is required</Text>
      </View>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        const isDisabled = tab.disabled;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              getTabStyle(isActive),
              isDisabled && styles.disabledTab,
              { flex: 1 }
            ]}
            onPress={() => handleTabPress(tab)}
            activeOpacity={isDisabled ? 1 : 0.8}
            disabled={isDisabled}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ 
              selected: isActive,
              disabled: isDisabled 
            }}
            accessibilityLabel={`${tab.label} tab`}
            testID={`${testID}-${tab.id}`}
          >
            <Text 
              style={[
                getTextStyle(isActive),
                isDisabled && styles.disabledText
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    maxWidth: screenWidth - 32,
    alignSelf: 'center',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  disabledTab: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#6D6D70',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    backgroundColor: '#FF3B30',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default TabBar;