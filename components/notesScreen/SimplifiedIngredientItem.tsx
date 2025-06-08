import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Ingredient {
    id: string;
    amount: string;
    unit: string;
    name: string;
}

interface SimplifiedIngredientItemProps {
    ingredient: Ingredient;
    onUpdate: (id: string, field: keyof Ingredient, value: string) => void;
    onRemove?: (id: string) => void;
    showRemoveButton?: boolean;
    index: number;
}

export const SimplifiedIngredientItem: React.FC<SimplifiedIngredientItemProps> = ({
    ingredient,
    onUpdate,
    onRemove,
    showRemoveButton = false,
    index
}) => {
    return (
        <View className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center">
                {/* Ingredient number indicator */}
                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold text-sm">
                        {index + 1}
                    </Text>
                </View>

                {/* Three separate inputs */}
                <View className="flex-1 flex-row items-center gap-2">
                    {/* Amount input */}
                    <View className="w-16">
                        <TextInput
                            value={ingredient.amount}
                            onChangeText={(value) => onUpdate(ingredient.id, 'amount', value)}
                            placeholder="100"
                            className="bg-white px-2 py-2 rounded-lg border border-blue-200 text-center text-sm"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Unit input */}
                    <View className="w-20">
                        <TextInput
                            value={ingredient.unit}
                            onChangeText={(value) => onUpdate(ingredient.id, 'unit', value)}
                            placeholder="gram"
                            className="bg-white px-2 py-2 rounded-lg border border-blue-200 text-center text-sm"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Name input */}
                    <View className="flex-1">
                        <TextInput
                            value={ingredient.name}
                            onChangeText={(value) => onUpdate(ingredient.id, 'name', value)}
                            placeholder="flour"
                            className="bg-white px-3 py-2 rounded-lg border border-blue-200 text-sm"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                {/* Remove button */}
                {showRemoveButton && onRemove && (
                    <TouchableOpacity
                        onPress={() => onRemove(ingredient.id)}
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

            {/* Helper text */}
            <Text className="text-blue-400 text-xs mt-2 ml-11">
                Enter amount, unit, and ingredient name separately
            </Text>
        </View>
    );
};
