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
    <View className="flex-col gap-2">
      <Text className="text-gray-700 font-medium">{label}</Text>
      <View className="bg-white px-4 py-3 rounded-lg border border-blue-500 shadow-sm flex-row gap-2 items-center justify-between">
        <Ionicons name="time-outline" size={20} color="#6B7280" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType="numeric"
        />
        <Text className="text-gray-500">{unit}</Text>
      </View>
    </View>
  );
};