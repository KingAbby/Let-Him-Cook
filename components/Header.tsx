import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  variant?: "default" | "recipe";
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  rightIcon,
  onRightIconPress,
  variant = "default",
  className = "",
}) => {
  const navigation = useNavigation();

  if (variant === "recipe") {
    return (
      <View style={styles.headerContainer} className="w-full absolute z-50">
        <View className="absolute inset-0 bg-white" style={{ opacity: 0.98 }} />
        <View className={`items-center justify-between px-4 py-2 ${className}`}>
          <Text
            className="text-gray-800 text-base font-semibold"
            style={{
              textShadowColor: "rgba(255, 255, 255, 0.5)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 1,
            }}
          >
            {title}
          </Text>
          <View className="h-[2px] w-8 bg-blue-500/80 rounded-full mt-0.5" />
        </View>
        <View className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-300/50" />      </View>
    );
  }

  return (
    <View style={styles.headerContainer} className="w-full absolute z-50">
      <View className="absolute inset-0" style={{ backgroundColor: '#FFFFFF', opacity: 0.98 }} />
      <SafeAreaView
        className={`w-full px-5 py-3 ${className}`}
      >
        {/* Layout container with absolute positioning for centered title */}
        <View className="flex-row items-center relative">
          {/* Left side - Back button */}
          <View className="z-10">
            {showBackButton && (
              <TouchableOpacity
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 1,
                  elevation: 1,
                }}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={20} color="#3b82f6" />
              </TouchableOpacity>
            )}
          </View>

          {/* Center title - positioned absolutely to ensure true center alignment */}
          <View className="absolute left-0 right-0 items-center justify-center">
            <Text className="text-blue-500 text-lg font-bold">{title}</Text>
            <View className="h-[2px] w-10 bg-blue-300 rounded-full mt-0.5" />
          </View>
        </View>
      </SafeAreaView>
      <View className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/20" />
    </View>
  );
};

// Additional styles for visual effects
const styles = StyleSheet.create({
  absoluteFillObject: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(229, 231, 235, 0.7)',
      },
    }),
  },
});

export default Header;
