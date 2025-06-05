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
    <View className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4 shadow-sm">
      <View className="flex-row">
        {/* Enhanced step number with blue theme */}
        <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-4 shadow-md">
          <Text className="text-white font-bold text-sm">
            {step.step}
          </Text>
        </View>

        <View className="flex-1">
          {/* Step label with blue accent */}
          <View className="flex-row items-center mb-3">
            <Text className="font-bold text-blue-800 text-base">
              Step {step.step}
            </Text>
            <View className="h-0.5 bg-blue-200 flex-1 ml-2" />
          </View>

          {/* Enhanced text input */}
          <TextInput
            value={step.description}
            onChangeText={(value) => onUpdate(step.id, value)}
            placeholder="Describe this cooking step in detail..."
            multiline
            className="bg-white px-4 py-3 rounded-lg border border-blue-200 min-h-[80px] text-gray-800"
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
            style={{
              fontSize: 15,
              lineHeight: 22,
            }}
          />

          {/* Helper text */}
          <Text className="text-blue-400 text-xs mt-2">
            Be specific about timing, temperature, and techniques
          </Text>
        </View>

        {/* Enhanced remove button */}
        {showRemoveButton && onRemove && (
          <TouchableOpacity
            onPress={() => onRemove(step.id)}
            className="ml-3 w-8 h-8 bg-red-100 rounded-full items-center justify-center"
          >
            <Ionicons
              name="close"
              size={16}
              color="#EF4444"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};