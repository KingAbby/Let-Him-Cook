import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CookingStep {
  id: string;
  step: number;
  description: string;
}

interface CookingStepItemProps {
  step: CookingStep;
  onUpdate: (id: string, description: string) => void;
  onRemove?: (id: string) => void;
  showRemoveButton?: boolean;
}

export const CookingStepItem: React.FC<CookingStepItemProps> = ({ step, onUpdate, onRemove, showRemoveButton = false }) => {
  return (
    <View className="flex-row mb-6 bg-neutral-200 rounded-lg p-4">
      <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center mr-3 -mt-1">
        <Text className="text-white font-bold text-sm">{step.step}</Text>
      </View>
      
      <View className="flex-1">
        <Text className="font-medium text-gray-800 mb-1">Step {step.step}</Text>
        <TextInput
          value={step.description}
          onChangeText={(value) => onUpdate(step.id, value)}
          placeholder="Explain the cooking steps..."
          multiline
          className="bg-gray-50 px-3 py-2 rounded border border-gray-200 min-h-[60px]"
          textAlignVertical="top"
        />
      </View>

      {showRemoveButton && onRemove && (
        <TouchableOpacity 
          onPress={() => onRemove(step.id)}
          className="p-1 ml-2"
        >
          <Ionicons name="close-circle" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};