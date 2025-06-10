import React from "react";
import { TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shareRecipeAsPDF } from "../utils/pdfGenerator";
import * as Sharing from "expo-sharing";

// Type for recipe data to be shared
interface ShareButtonProps {
	recipe: any;
	isSpoonacularRecipe: boolean;
	spoonacularIngredients?: any[];
	spoonacularInstructions?: any[];
}

/**
 * ShareRecipeButton component for sharing recipes as PDF
 * This component can be added to recipe screens to provide sharing functionality
 */
const ShareRecipeButton: React.FC<ShareButtonProps> = ({
	recipe,
	isSpoonacularRecipe,
	spoonacularIngredients = [],
	spoonacularInstructions = [],
}) => {
	const [isSharing, setIsSharing] = React.useState(false);
	const handleShareRecipe = async () => {
		try {
			// Check if sharing is available before beginning
			if (!(await Sharing.isAvailableAsync())) {
				Alert.alert(
					"Sharing Not Available",
					"Sharing is not available on this device"
				);
				return;
			}

			setIsSharing(true);

			if (isSpoonacularRecipe) {
				// Format Spoonacular recipe data for PDF generation
				const recipeData = {
					title: recipe.title,
					image_url: recipe.image,
					description: recipe.summary,
					prep_time: recipe.preparationMinutes,
					cook_time: recipe.cookingMinutes,
					ready_in_minutes: recipe.readyInMinutes,
					servings: recipe.servings ? `${recipe.servings}` : null,
					category: recipe.dishTypes?.join(", "),
					ingredients: spoonacularIngredients.map((ing) => ({
						name: ing.name,
						quantity: ing.amount.toString(),
						unit: ing.unit || "",
					})),
					instructions:
						spoonacularInstructions.length > 0 &&
						spoonacularInstructions[0]?.steps
							? spoonacularInstructions[0].steps.map((step) => step.step)
							: [],
				};

				await shareRecipeAsPDF(recipeData);
			} else if (recipe) {
				// Format user's own recipe for PDF generation
				const recipeData = {
					title: recipe.title,
					image_url: recipe.image_url,
					description: recipe.description,
					prep_time: recipe.prep_time,
					cook_time: recipe.cook_time,
					servings: recipe.servings,
					category: recipe.category,
					ingredients: recipe.ingredients
						? recipe.ingredients.map((ing) => ({
								name: ing.name,
								quantity: ing.amount,
								unit: ing.unit,
						  }))
						: [],
					instructions: recipe.cooking_steps
						? recipe.cooking_steps.map((step) => step.description)
						: [],
					isMyRecipe: true,
				};

				await shareRecipeAsPDF(recipeData);
			} else {
				throw new Error("No recipe data available");
			}
		} catch (error) {
			console.error("Failed to share recipe:", error);
			Alert.alert(
				"Sharing Failed",
				"There was a problem sharing this recipe. Please try again later.",
				[{ text: "OK" }]
			);
		} finally {
			setIsSharing(false);
		}
	};
	return (
		<TouchableOpacity
			onPress={handleShareRecipe}
			disabled={isSharing}
		>
			{isSharing ? (
				<ActivityIndicator
					color='#3B82F6'
					size='small'
				/>
			) : (
				<Ionicons
					name='share-social-outline'
					size={24}
					color='#3B82F6'
				/>
			)}
		</TouchableOpacity>
	);
};

export default ShareRecipeButton;
