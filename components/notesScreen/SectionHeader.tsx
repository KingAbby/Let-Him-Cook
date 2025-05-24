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
  buttonText = "Tambah", 
  onButtonPress, 
  showButton = true 
}) => {
  return (
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-lg font-semibold">{title}</Text>
      {showButton && onButtonPress && (
        <TouchableOpacity 
          onPress={onButtonPress}
          className="flex-row items-center"
        >
          <Ionicons name="add-circle" size={20} color="#10B981" />
          <Text className="text-green-600 font-medium ml-1">{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};