import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SectionHeaderProps {
  title: string;
  buttonText?: string;
  onButtonPress?: () => void;
  showButton?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  buttonText = "Add",
  onButtonPress,
  showButton = true
}) => {
  const getIconName = (title: string) => {
    if (title.toLowerCase().includes('ingredient')) return 'restaurant';
    if (title.toLowerCase().includes('cook')) return 'flame';
    return 'information-circle';
  };

  return (
    <View className="bg-blue-500 rounded-2xl p-4 shadow-lg">
      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-3 items-center">
          <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
            <Ionicons
              name={getIconName(title) as any}
              size={18}
              color="white"
            />
          </View>
          <Text className="text-white text-xl font-bold">
            {title}
          </Text>
        </View>
        {showButton && onButtonPress && (
          <TouchableOpacity
            onPress={onButtonPress}
            className="bg-white/20 rounded-full px-4 py-2 flex-row gap-1 items-center"
          >
            <Ionicons
              name="add"
              size={16}
              color="white"
            />
            <Text className="text-white font-semibold text-sm">
              {buttonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};