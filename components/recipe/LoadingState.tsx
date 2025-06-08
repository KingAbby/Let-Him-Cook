import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LoadingStateProps {
	isSearching: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isSearching }) => {
	return (
		<View className='items-center justify-center p-8'>
			<View className='bg-white rounded-full p-5 shadow-sm mb-4'>
				<ActivityIndicator
					size='large'
					color='#3b82f6'
				/>
			</View>
			<Text className='text-gray-700 font-medium text-base'>
				{isSearching ? "Searching recipes..." : "Loading delicious recipes..."}
			</Text>
			<Text className='text-gray-500 mt-1 text-sm text-center max-w-xs'>
				We're preparing something tasty for you
			</Text>
		</View>
	);
};

export default LoadingState;
