import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  unit?: string;
}

export const CategoryInput: React.FC<CategoryInputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder = "0",
}) => {
  return (
    <View className="flex-1">
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      <View className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 flex-row items-center">
        <Ionicons name="restaurant" size={20} color="#6B7280" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          className="ml-2 flex-1"
        />
      </View>
    </View>
  );
};