import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Ingredient {
  id: string;
  amount: string;
  unit: string;
  name: string;
}

interface IngredientItemProps {
  ingredient: Ingredient;
  onUpdate: (id: string, field: keyof Ingredient, value: string) => void;
  onRemove?: (id: string) => void;
  showRemoveButton?: boolean;
}

export const IngredientItem: React.FC<IngredientItemProps> = ({ 
  ingredient, 
  onUpdate, 
  onRemove, 
  showRemoveButton = false 
}) => {
  return (
    <View className="flex-row items-center mb-3">
      <View className="w-16 bg-gray-50 px-2 py-2 rounded border border-gray-200 mr-2">
        <TextInput
          value={ingredient.amount}
          onChangeText={(value) => onUpdate(ingredient.id, 'amount', value)}
          placeholder="100"
          className="text-center text-sm"
          keyboardType="numeric"
        />
      </View>
      
      <View className="w-20 bg-gray-50 px-2 py-2 rounded border border-gray-200 mr-2">
        <TextInput
          value={ingredient.unit}
          onChangeText={(value) => onUpdate(ingredient.id, 'unit', value)}
          placeholder="gram"
          className="text-center text-sm"
        />
      </View>
      
      <View className="flex-1 bg-gray-50 px-3 py-2 rounded border border-gray-200 mr-2">
        <TextInput
          value={ingredient.name}
          onChangeText={(value) => onUpdate(ingredient.id, 'name', value)}
          placeholder="ingredients Name"
          className="text-sm"
        />
      </View>

      {showRemoveButton && onRemove && (
        <TouchableOpacity 
          onPress={() => onRemove(ingredient.id)}
          className="p-1"
        >
          <Ionicons name="close-circle" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};