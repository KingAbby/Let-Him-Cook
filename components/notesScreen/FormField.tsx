import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface FormFieldProps extends TextInputProps {
    label: string;
    containerStyle?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    containerStyle = "mx-4 mt-4",
    ...textInputProps 
}) => {
    return (
        <View className={containerStyle}>
            <Text className='text-gray-700 font-medium mb-2'>{label}</Text>
            <TextInput
                className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
                {...textInputProps}
            />
        </View>
    )
}