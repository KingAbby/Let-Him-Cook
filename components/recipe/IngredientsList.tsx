import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Ingredient as SpoonacularIngredient } from "../../services/SpoonacularService";

interface Ingredient {
	id?: string;
	name: string;
	amount?: string | number;
	unit?: string;
}

interface IngredientsListProps {
	ingredients: Ingredient[] | SpoonacularIngredient[];
	isSpoonacular?: boolean;
}

const IngredientsList: React.FC<IngredientsListProps> = ({
	ingredients,
	isSpoonacular = false,
}) => {
	if (!ingredients || ingredients.length === 0) {
		return (
			<Text className='text-gray-500'>
				No ingredients information available
			</Text>
		);
	}

	return (
		<>
			<View className='flex-row items-center mb-4'>
				<Ionicons
					name='list-outline'
					size={22}
					color='#4B5563'
				/>
				<Text className='text-xl font-bold text-gray-700 ml-2'>
					Ingredients
				</Text>
			</View>

			{ingredients.map((ingredient, index) => (
				<View
					key={ingredient.id || index}
					className='flex-row items-center mb-2 bg-white p-3 rounded-lg'
				>
					<View className='w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3'>
						<Text className='text-blue-600 font-bold'>{index + 1}</Text>
					</View>
					<View className='flex-1'>
						<Text className='text-gray-700 font-medium capitalize'>
							{ingredient.name}
						</Text>
						{isSpoonacular ? (
							<Text className='text-gray-500 text-sm'>
								{(ingredient as SpoonacularIngredient).amount.us.value}{" "}
								{(ingredient as SpoonacularIngredient).amount.us.unit}
							</Text>
						) : (
							<Text className='text-gray-500 text-sm'>
								{(ingredient as Ingredient).amount}{" "}
								{(ingredient as Ingredient).unit}
							</Text>
						)}
					</View>
				</View>
			))}
		</>
	);
};

export default IngredientsList;
