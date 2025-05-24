import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimeInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  unit?: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder = "0",
  unit = "minutes"
}) => {
  return (
    <View className="flex-1">
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      <View className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center">
        <Ionicons name="time-outline" size={20} color="#6B7280" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          className="ml-2 flex-1"
          keyboardType="numeric"
        />
        <Text className="text-gray-500">{unit}</Text>
      </View>
    </View>
  );
};