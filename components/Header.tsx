import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define consistent header heights
const HEADER_HEIGHTS = {
  android: 120,
  ios: 110
};

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  variant?: "default" | "recipe";
  className?: string;
  showBookmark?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  rightIcon,
  onRightIconPress,
  variant = "default",
  className = "",
  showBookmark = true,
}) => {
  const navigation = useNavigation();
const route = useRoute();

  // Check if current route is Bookmarks page
  const isBookmarkPage = route.name === 'Bookmarks';

  const handleBookmarkPress = () => {
    if (!isBookmarkPage) {
      navigation.navigate('Bookmarks' as never);
    }
  };

  const headerHeight = Platform.OS === 'android' ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

  if (variant === "recipe") {
    return (
      <View style={[styles.headerContainer, { height: headerHeight }]} className="w-full absolute z-50">
        <View className="absolute inset-0 bg-white" style={{ opacity: 0.98 }} />
        <SafeAreaView className="flex-1">
        <View className={`flex-1 items-center justify-center px-4 ${className}`}>
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
          <View className="h-[2px] w-8 bg-blue-500/80 rounded-full mt-1" />
        </View>
        </SafeAreaView>
        <View className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-300/50" />
        {/* Bookmark icon for recipe variant */}
        {showBookmark && !isBookmarkPage && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 16,
              top: Platform.OS === 'android' ? 50 : 40,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 1,
              elevation: 1,
            }}
            onPress={handleBookmarkPress}
          >
            <Ionicons name="bookmark-outline" size={24} color="#3b82f6" />
          </TouchableOpacity>
        )}
        </View>
    );
  }

  return (
    <View style={[styles.headerContainer, { height: headerHeight }]} className="w-full absolute z-50">
      <View className="absolute inset-0" style={{ backgroundColor: '#FFFFFF', opacity: 0.98 }} />
      <SafeAreaView className="flex-1" style={{ paddingHorizontal: 20 }}>
        {/* Layout container with absolute positioning for centered title */}
        <View className="flex-1 flex-row items-center justify-between">
          {/* Left side - Back button */}
          <View className="w-8 h-8 items-center justify-center">
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
          <View className="flex-1 items-center justify-center">
            <Text className="text-blue-500 text-lg font-bold">{title}</Text>
            <View className="h-[2px] w-10 bg-blue-300 rounded-full mt-1" />
          </View>

          {/* Right side - Bookmark icon */}
          <View className="w-8 h-8 items-center justify-center">
            {rightIcon ? (
              <TouchableOpacity onPress={onRightIconPress}>
                {rightIcon}
              </TouchableOpacity>
            ) : showBookmark && !isBookmarkPage ? (
              <TouchableOpacity
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 1,
                  elevation: 1,
                }}
                onPress={handleBookmarkPress}
              >
                <Ionicons name="bookmark-outline" size={24} color="#3b82f6" />
              </TouchableOpacity>
            ) : null}
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

export { HEADER_HEIGHTS };
export default Header;
