import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Recipe {
	id: string;
	title: string;
	description: string | null;
	prep_time: number | null;
	cook_time: number | null;
	servings: string | null;
	category: string | null;
	image_url: string | null;
	created_at: string | null;
}

interface RecipeCardProps {
	recipe: Recipe;
	onPress: (recipeId: string) => void;
	onAddToCollection?: (recipe: Recipe) => void;
}

const RecipeCard = ({ recipe, onPress, onAddToCollection }: RecipeCardProps) => {
	// Format date for display
	const formatDate = (dateString: string | null) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Calculate total cooking time
	const getTotalCookingTime = (
		prepTime: number | null,
		cookTime: number | null
	) => {
		const total = (prepTime || 0) + (cookTime || 0);
		return total > 0 ? `${total} min` : "-";
	};

	return (
		<TouchableOpacity
			className='bg-white rounded-xl shadow-sm overflow-hidden mx-4 mb-4 border-hairline border-blue-500'
			onPress={() => onPress(recipe.id)}
			activeOpacity={0.7}
		>
			<View>
				{/* Recipe Image */}
				{recipe.image_url ? (
					<Image
						source={{ uri: recipe.image_url }}
						className='w-full h-36'
						resizeMode='cover'
					/>
				) : (
					<View className='w-full h-36 bg-gray-200 items-center justify-center'>
						<Ionicons
							name='image-outline'
							size={40}
							color='#9CA3AF'
						/>
					</View>
				)}

				{/* Recipe Info */}
				<View className='p-4'>
					<Text
						className='text-lg font-bold text-gray-800 mb-1'
						numberOfLines={1}
					>
						{recipe.title}
					</Text>

					{recipe.description && (
						<Text
							className='text-gray-500 text-sm mb-3'
							numberOfLines={2}
						>
							{recipe.description}
						</Text>
					)}

					<View className='flex-row items-center flex-wrap'>
						<View className='flex-row items-center mr-3 mb-1'>
							<Ionicons
								name='time-outline'
								size={16}
								color='#9CA3AF'
							/>
							<Text className='text-gray-500 text-xs ml-1'>
								{getTotalCookingTime(recipe.prep_time, recipe.cook_time)}
							</Text>
						</View>

						{recipe.servings && (
							<View className='flex-row items-center mr-3 mb-1'>
								<Ionicons
									name='restaurant-outline'
									size={16}
									color='#9CA3AF'
								/>
								<Text className='text-gray-500 text-xs ml-1'>
									{recipe.servings}
								</Text>
							</View>
						)}

						{recipe.category && (
							<View className='bg-blue-50 px-2 py-1 rounded-full mb-1'>
								<Text className='text-blue-600 text-xs'>{recipe.category}</Text>
							</View>
						)}

						<View className='flex-1 items-end'>
							<Text className='text-gray-400 text-xs'>
								{formatDate(recipe.created_at)}
							</Text>
						</View>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

export default RecipeCard;
