import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ScrollView } from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';

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

export const CategoryInput: React.FC<CategoryInputProps> = ({ label, value, onChangeText, placeholder = "Select Category" }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectCategory = (category: string) => {
    onChangeText(category);
    setIsModalVisible(false);
  };

  return (
    <View className="flex-col gap-4">
      <Text className="text-blue-800 font-bold">
        {label}
      </Text>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="bg-blue-50 px-4 py-4 rounded-xl border-2 border-blue-100 flex-row items-center justify-between shadow-sm"
      >
        <View className="flex-row gap-5 items-center">
          <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
            <Ionicons
              name="restaurant"
              size={18}
              color="white"
            />
          </View>
          <Text className={`text-base font-medium ${value ? 'text-blue-800' : 'text-blue-400'}`}>
            {value || placeholder}
          </Text>
        </View>
        {/* Icon */}
        <View className="w-6 h-6 bg-blue-200 rounded-full items-center justify-center">
          <Ionicons
            name="chevron-down"
            size={14}
            color="#1E40AF"
          />
        </View>
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
            <View className="bg-blue-500 rounded-t-3xl">
              <View className="flex-row justify-between items-center p-4">
                <View className="flex-row gap-4 items-center">
                  <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
                    <Ionicons
                      name="list"
                      size={18}
                      color="white"
                    />
                  </View>
                  <Text className="text-white text-xl font-bold">
                    Select Category
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* Category List */}
            <ScrollView className="flex-1 px-4 py-4">
              {CATEGORIES.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectCategory(category)}
                  className={`py-4 px-4 rounded-xl my-2 flex-row items-center justify-between ${value === category
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                    }`}
                >
                  <View className="flex-row gap-2 items-center">
                    {/* Icon Section */}
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${value === category ? 'bg-blue-500' : 'bg-gray-200'}`}>
                      <FontAwesome6 name="utensils" size={14} color={value === category ? 'white' : '#6B7280'} />
                    </View>
                    {/* Category Name */}
                    <Text className={`text-base font-medium ${value === category ? 'text-blue-800' : 'text-gray-800'}`}>
                      {category}
                    </Text>
                  </View>
                  {value === category && (
                    <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color="white"
                      />
                    </View>
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