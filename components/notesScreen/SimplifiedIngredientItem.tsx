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
    const handleFullTextChange = (text: string) => {
        const parts = text.trim().split(' ');

        if (parts.length >= 3) {
            const amount = parts[0];
            const unit = parts[1];
            const name = parts.slice(2).join(' ');

            onUpdate(ingredient.id, 'amount', amount);
            onUpdate(ingredient.id, 'unit', unit);
            onUpdate(ingredient.id, 'name', name);
        } else if (parts.length === 2) {
            const amount = parts[0];
            const name = parts[1];

            onUpdate(ingredient.id, 'amount', amount);
            onUpdate(ingredient.id, 'unit', '');
            onUpdate(ingredient.id, 'name', name);
        } else if (parts.length === 1) {
            onUpdate(ingredient.id, 'amount', '');
            onUpdate(ingredient.id, 'unit', '');
            onUpdate(ingredient.id, 'name', text);
        }
    };

    const getFullText = () => {
        const parts = [];
        if (ingredient.amount) parts.push(ingredient.amount);
        if (ingredient.unit) parts.push(ingredient.unit);
        if (ingredient.name) parts.push(ingredient.name);
        return parts.join(' ');
    };

    return (
        <View className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center">
                {/* Ingredient number indicator */}
                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold text-sm">
                        {index + 1}
                    </Text>
                </View>

                {/* Simplified single input */}
                <View className="flex-1">
                    <TextInput
                        value={getFullText()}
                        onChangeText={handleFullTextChange}
                        placeholder="e.g., 100 gram flour"
                        className="text-gray-800 text-base font-medium"
                        placeholderTextColor="#9CA3AF"
                        multiline={false}
                    />
                    <Text className="text-blue-400 text-xs mt-1">
                        Format: amount unit ingredient (e.g., 2 cups sugar)
                    </Text>
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
        </View>
    );
};
