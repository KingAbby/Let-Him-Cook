import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

const CATEGORIES = [
  'Main Course',
  'Appetizer',
  'Dessert',
  'Snack',
  'Beverage',
  'Soup',
  'Salad',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Side Dish',
  'Sauce',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Traditional',
  'Western',
  'Asian',
  'Indonesian',
  'Chinese',
  'Japanese',
  'Korean',
  'Italian',
  'Mexican',
  'Thai',
  'Indian'
];

export const CategoryInput: React.FC<CategoryInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "Select Category",
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectCategory = (category: string) => {
    onChangeText(category);
    setIsModalVisible(false);
  };

  return (
    <View className="flex-1">
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1">
          <Ionicons name="restaurant" size={20} color="#6B7280" />
          <Text className={`ml-2 flex-1 ${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {value || placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl min-h-[70%]">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Select Category</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="p-1"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Category List */}
            <ScrollView className="flex-1 px-4">
              {CATEGORIES.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectCategory(category)}
                  className={`py-4 border-b border-gray-100 flex-row items-center justify-between ${value === category ? 'bg-green-50' : ''
                    }`}
                >
                  <Text className={`text-base ${value === category ? 'text-green-600 font-medium' : 'text-gray-900'
                    }`}>
                    {category}
                  </Text>
                  {value === category && (
                    <Ionicons name="checkmark" size={20} color="#16A34A" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};