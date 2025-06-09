import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RecipeMetaItemProps {
	icon: keyof typeof Ionicons.glyphMap;
	text: string;
}

export const RecipeMetaItem: React.FC<RecipeMetaItemProps> = ({
	icon,
	text,
}) => {
	return (
		<View className='flex-row items-center mr-6 mb-2'>
			<Ionicons
				name={icon}
				size={20}
				color='#6B7280'
			/>
			<Text className='text-gray-600 ml-1'>{text}</Text>
		</View>
	);
};

interface RecipeMetaProps {
	prepTime?: number | null;
	cookTime?: number | null;
	readyInMinutes?: number | null;
	servings?: string | null;
	category?: string | null;
}

const RecipeMeta: React.FC<RecipeMetaProps> = ({
	prepTime,
	cookTime,
	readyInMinutes,
	servings,
	category,
}) => {
	return (
		<View className='flex-row flex-wrap mb-6 mt-4'>
			{readyInMinutes && (
				<RecipeMetaItem
					icon='time-outline'
					text={`${readyInMinutes} min total`}
				/>
			)}

			{prepTime && (
				<RecipeMetaItem
					icon='cart-outline'
					text={`${prepTime} min prep`}
				/>
			)}

			{cookTime && (
				<RecipeMetaItem
					icon='flame-outline'
					text={`${cookTime} min cook`}
				/>
			)}

			{servings && (
				<RecipeMetaItem
					icon='restaurant-outline'
					text={servings}
				/>
			)}

			{category && (
				<View className='bg-blue-100 px-3 py-1 rounded-full mt-1 mb-2'>
					<Text className='text-blue-800'>{category}</Text>
				</View>
			)}
		</View>
	);
};

export default RecipeMeta;
