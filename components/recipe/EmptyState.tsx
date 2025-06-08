import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
	searchQuery: string;
	onClearSearch: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
	searchQuery,
	onClearSearch,
}) => {
	return (
		<View className='items-center justify-center py-16'>
			<Ionicons
				name='search-outline'
				size={50}
				color='#d1d5db'
			/>
			<Text className='text-gray-500 mt-4 font-medium text-base'>
				No recipes found
			</Text>
			<Text className='text-gray-400 text-center mt-1 max-w-xs'>
				{searchQuery
					? `We couldn't find any recipes matching "${searchQuery}"`
					: "Try searching for a recipe"}
			</Text>
			{searchQuery && (
				<TouchableOpacity
					onPress={onClearSearch}
					className='mt-5 bg-blue-500 px-5 py-2.5 rounded-full'
				>
					<Text className='text-white font-medium'>Clear Search</Text>
				</TouchableOpacity>
			)}
		</View>
	);
};

export default EmptyState;
