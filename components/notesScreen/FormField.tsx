import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface FormFieldProps extends TextInputProps {
    label: string;
    containerStyle?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    ...textInputProps
}) => {
    return (
        <View className='flex-col gap-2'>
            <Text className='text-gray-700 font-medium'>{label}</Text>
            <TextInput
                className="bg-white px-4 py-3 rounded-lg border border-blue-500 shadow-sm"
                {...textInputProps}
            />
        </View>
    )
}