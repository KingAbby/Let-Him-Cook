import React, {useState, forwardRef, useImperativeHandle} from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert } from 'react-native';

/**
 * Regular single-line text input component
 */
const InputText = ({
    value,
    onChangeText,
    placeholder,
    title
}) => {

    return (
        <View className='w-full my-2'>
            <Text className='text-base font-semibold mb-1'>
                {title}
            </Text>
            <TextInput
                className='border border-gray-300 rounded-lg p-2.5 text-base bg-zinc-200'
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
            />
        </View>
    );
};

/**
 * Regular single-line text input component For Time
 */
const InputTextForTime = ({
    value1,
    value2,
    onChangeText1,
    onChangeText2,
    placeholder,
    placeholder2,
    title1,
    title2
}) => {

    return (
        <>
            <View className='flex-row justify-between items-center'>
                <View className='w-1/2 my-2'>
                    <Text className='text-sm font-semibold mb-1'>
                        {title1}
                    </Text>
                    <TextInput
                        className='border border-gray-300 rounded-lg p-2.5 text-base bg-zinc-200'
                        value={value1}
                        onChangeText={onChangeText1}
                        placeholder={placeholder}
                    />
                </View>
                <View className='w-1/2 my-2'>
                    <Text className='text-sm font-semibold mb-1'>
                        {title2}
                    </Text>
                    <TextInput
                        className='border border-gray-300 rounded-lg p-2.5 text-base bg-zinc-200'
                        value={value2}
                        onChangeText={onChangeText2}
                        placeholder={placeholder2}
                    />
                </View>
            </View>
        </>
    );
};

/**
 * Regular single-line text input component For Ingredients
 */
const InputTextForIngredients = forwardRef(({ title = "Ingredients" }, ref) => {
    const [ingredients, setIngredients] = useState([
        { id: 1, quantity: '', unit: '', name: '' }
    ]);

    useImperativeHandle(ref, () => ({
        getIngredients: () => {
            // Filter out empty ingredients
            return ingredients.filter(
                ing => ing.quantity.trim() || ing.unit.trim() || ing.name.trim()
            );
        },
        resetIngredients: () => {
            setIngredients([{ id: 1, quantity: '', unit: '', name: '' }]);
        }
    }));

    const addMoreIngredients = () => {
        const newIngredient = {
            id: Date.now(), // Simple ID generator
            quantity: '',
            unit: '',
            name: ''
        };
        setIngredients([...ingredients, newIngredient]);
    };

    const deleteIngredient = (id) => {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter(ingredient => ingredient.id !== id));
        } else {
            Alert.alert('Warning', 'There must be at least one ingredient');
        }
    };

    const updateIngredient = (id, field, value) => {
        setIngredients(ingredients.map(ingredient => 
            ingredient.id === id 
                ? { ...ingredient, [field]: value }
                : ingredient
        ));
    };

    return (
        <View>
            <View className='flex-row justify-between items-center'>
                <Text className='text-base font-semibold mb-1'>
                    {title}
                </Text>
                <TouchableOpacity onPress={addMoreIngredients}>
                    <Text className='text-sm text-blue-500 mb-1 font-medium'>
                        Add more ingredients
                    </Text>
                </TouchableOpacity>
            </View>
            
            {ingredients.map((ingredient, index) => (
                <View key={ingredient.id}>
                    <View className='flex-row justify-between items-center'>
                        <View className='w-1/4 my-2'>
                            <TextInput
                                className='border border-gray-300 rounded-lg p-2.5 text-base bg-zinc-200'
                                value={ingredient.quantity}
                                onChangeText={(value) => updateIngredient(ingredient.id, 'quantity', value)}
                                placeholder="Amount"
                                keyboardType="numeric"
                            />
                        </View>
                        <View className='w-1/3 my-2'>
                            <TextInput
                                className='border border-gray-300 rounded-lg p-2.5 text-base bg-zinc-200'
                                value={ingredient.unit}
                                onChangeText={(value) => updateIngredient(ingredient.id, 'unit', value)}
                                placeholder="Unit"
                            />
                        </View>
                        <View className='w-1/3 my-2'>
                            <TextInput
                                className='border border-gray-300 rounded-lg p-2.5 text-base bg-zinc-200'
                                value={ingredient.name}
                                onChangeText={(value) => updateIngredient(ingredient.id, 'name', value)}
                                placeholder="Name"
                            />
                        </View>
                    </View>
                    
                    {/* Delete button - only show if more than one ingredient */}
                    {ingredients.length > 1 && (
                        <View className='flex-row justify-end mb-2'>
                            <TouchableOpacity 
                                onPress={() => deleteIngredient(ingredient.id)}
                                className='bg-red-500 px-3 py-1 rounded-md'
                            >
                                <Text className='text-white text-xs font-medium'>
                                    Hapus
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    
                    {/* Separator line between ingredients (except last one) */}
                    {index < ingredients.length - 1 && (
                        <View className='h-px bg-gray-300 my-2' />
                    )}
                </View>
            ))}
        </View>
    );
});

/**
 * Multiline text area input component
 */
const InputTextArea = ({
    value,
    onChangeText,
    placeholder,
    title
}) => {

    return (
        <View className='w-full my-2'>
            <Text className='text-base font-semibold mb-1'>
                {title}
            </Text>
            <TextInput
                className='border border-gray-300 rounded-lg p-2.5 text-base h-24 bg-zinc-200'
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
            />
        </View>
    );
};

export { InputText, InputTextArea, InputTextForTime, InputTextForIngredients };