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
import { BlurView } from "expo-blur";

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
        <View className="absolute inset-0 bg-white/60" />
        <BlurView
          intensity={15}
          tint="light"
          style={StyleSheet.absoluteFillObject}
        />
        <View className={`items-center justify-between px-4 py-3 ${className}`}>
          <Text
            className="text-gray-800 text-lg font-semibold"
            style={{
              textShadowColor: "rgba(255, 255, 255, 0.5)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {title}
          </Text>
          <View className="h-0.5 w-10 bg-blue-500/70 rounded-full mt-1" />
        </View>
        <View className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-300/50" />
      </View>
    );
  }

  return (
    <View style={styles.headerContainer} className="w-full absolute z-50">
      <View className="absolute inset-0 bg-[#F8F9F9]/40" />
      <BlurView
        intensity={25}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView
        className={`w-full px-5 py-2 flex-row items-center ${className}`}
      >
        {/* Left side - Back button or empty space */}
        <View className="w-10">
          {showBackButton && (
            <TouchableOpacity
              className="bg-white/20 rounded-full p-1.5"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color="#3b82f6" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-1 items-center">
          <Text className="text-blue-500 text-xl font-bold">{title}</Text>
          <View className="h-0.5 w-12 bg-white/50 rounded-full mt-1" />
        </View>

        <View className="w-10 items-end">
          {rightIcon && (
            <TouchableOpacity
              className="bg-white/20 rounded-full p-1.5"
              onPress={onRightIconPress}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
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
      },
    }),
  },
});

export default Header;
