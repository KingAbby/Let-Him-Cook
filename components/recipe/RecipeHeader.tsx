import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RecipeHeaderProps {
	title: string;
	description?: string | null;
	imageUrl?: string | null;
}

const RecipeHeader: React.FC<RecipeHeaderProps> = ({
	title,
	description,
	imageUrl,
}) => {
	return (
		<>
			{/* Recipe Image */}
			{imageUrl ? (
				<Image
					source={{ uri: imageUrl }}
					className='w-full h-64'
					resizeMode='cover'
				/>
			) : (
				<View className='w-full h-64 bg-gray-200 items-center justify-center'>
					<Ionicons
						name='image-outline'
						size={48}
						color='#9CA3AF'
					/>
				</View>
			)}

			{/* Recipe Title and Description */}
			<View className='px-4 pt-4'>
				<Text className='text-2xl font-bold text-gray-800 mb-2'>{title}</Text>

				{description && <Text className='text-gray-600'>{description}</Text>}
			</View>
		</>
	);
};

export default RecipeHeader;
