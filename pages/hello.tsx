import React from 'react';
import { View, Text } from "react-native";
const hello = () => {
    return (
        <View className='flex flex-row gap-5 p-10'>
            <Text className="text-black">Indonesia Cerah...</Text>
            <Text className='text-blue-600 font-semibold'>Langitnya</Text>
        </View>
    );
}

export default hello;