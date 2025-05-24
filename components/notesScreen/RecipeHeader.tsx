import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecipeHeaderProps {
  title: string;
}

export const RecipeHeader: React.FC<RecipeHeaderProps> = ({ 
  title,
}) => {
  return (
    <View className="items-center justify-between px-4 py-3 border-b border-gray-200">
      <Text className="text-lg font-semibold">{title}</Text>
    </View>
  );
};