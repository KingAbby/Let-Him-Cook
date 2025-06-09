import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	Image,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	StatusBar,
	Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../utils/supabase";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import {
	getRecipeIngredients,
	getRecipeInstructions,
	Ingredient as SpoonacularIngredient,
	Instruction,
} from "../services/SpoonacularService";
import RecipeHeader from "../components/recipe/RecipeHeader";
import RecipeMeta from "../components/recipe/RecipeMeta";
import IngredientsList from "../components/recipe/IngredientsList";
import InstructionsList from "../components/recipe/InstructionsList";

interface RouteParams {
	recipeId?: string;
	recipe?: any; // Recipe from Spoonacular API
}

interface Ingredient {
	id: string;
	amount: string;
	unit: string;
	name: string;
}

interface CookingStep {
	id: string;
	step: number;
	description: string;
}

interface Recipe {
	id: string;
	title: string;
	description: string | null;
	prep_time: number | null;
	cook_time: number | null;
	servings: string | null;
	category: string | null;
	image_url: string | null;
	ingredients: Ingredient[] | null;
	cooking_steps: CookingStep[] | null;
	created_at: string | null;
}

const HEADER_HEIGHT =
	Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

const RecipeDetailScreen = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const params = route.params as RouteParams;

	const [recipe, setRecipe] = useState<Recipe | null>(null);
	const [spoonacularRecipe, setSpoonacularRecipe] = useState<any | null>(null);
	const [spoonacularIngredients, setSpoonacularIngredients] = useState<
		SpoonacularIngredient[]
	>([]);
	const [spoonacularInstructions, setSpoonacularInstructions] = useState<
		Instruction[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [isSpoonacularRecipe, setIsSpoonacularRecipe] = useState(false);
	useEffect(() => {
		if (params.recipe) {
			// Handle Spoonacular recipe
			setSpoonacularRecipe(params.recipe);
			setIsSpoonacularRecipe(true);
			fetchSpoonacularDetails(params.recipe.id);
		} else if (params.recipeId) {
			// Handle database recipe
			fetchRecipeDetails(params.recipeId);
		} else {
			setLoading(false);
			Alert.alert("Error", "No recipe information provided");
			navigation.goBack();
		}
	}, [params]);

	// Fetch additional details for Spoonacular recipes
	const fetchSpoonacularDetails = async (recipeId: number) => {
		try {
			setLoading(true);

			// Fetch ingredients and instructions in parallel
			const [ingredientsData, instructionsData] = await Promise.all([
				getRecipeIngredients(recipeId),
				getRecipeInstructions(recipeId),
			]);

			setSpoonacularIngredients(ingredientsData);
			setSpoonacularInstructions(instructionsData);
		} catch (error) {
			console.error("Error fetching Spoonacular details:", error);
			Alert.alert("Error", "Failed to load complete recipe details");
		} finally {
			setLoading(false);
		}
	};

	const fetchRecipeDetails = async (recipeId: string) => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("myrecipes")
				.select("*")
				.eq("id", recipeId)
				.single();

			if (error) {
				console.error("Error fetching recipe:", error);
				Alert.alert("Error", "Failed to load recipe details");
				return;
			}

			setRecipe(data);
		} catch (error) {
			console.error("Error in fetchRecipeDetails:", error);
			Alert.alert("Error", "Something went wrong while loading the recipe");
		} finally {
			setLoading(false);
		}
	};

	const getTotalTime = () => {
		const total = (recipe?.prep_time || 0) + (recipe?.cook_time || 0);
		return total > 0 ? `${total} minutes` : "N/A";
	};
	const formatDate = (dateString: string | null) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}; // Render Spoonacular recipe content
	const renderSpoonacularContent = () => {
		if (!spoonacularRecipe) return null;

		return (
			<ScrollView
				className='flex-1'
				contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 30 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Recipe Header with Image and Title */}
				<RecipeHeader
					title={spoonacularRecipe.title}
					imageUrl={spoonacularRecipe.image}
				/>

				<View className='px-4'>
					{/* Recipe Meta Information */}
					<RecipeMeta
						prepTime={spoonacularRecipe.preparationMinutes}
						cookTime={spoonacularRecipe.cookingMinutes}
						servings={
							spoonacularRecipe.servings
								? `${spoonacularRecipe.servings} servings`
								: null
						}
					/>

					{/* Ingredients Section */}
					<View className='mb-6'>
						{spoonacularIngredients && spoonacularIngredients.length > 0 ? (
							<IngredientsList
								ingredients={spoonacularIngredients}
								isSpoonacular={true}
							/>
						) : (
							<Text className='text-gray-500'>
								No ingredients information available
							</Text>
						)}
					</View>

					{/* Instructions Section */}
					<View className='mb-4'>
						{spoonacularInstructions.length > 0 &&
						spoonacularInstructions[0]?.steps?.length > 0 ? (
							<InstructionsList
								steps={spoonacularInstructions[0].steps}
								isSpoonacular={true}
							/>
						) : (
							<Text className='text-gray-500'>No instructions available</Text>
						)}
					</View>
				</View>
			</ScrollView>
		);
	};
	if (loading) {
		return (
			<View className='flex-1 items-center justify-center'>
				<ActivityIndicator
					size='large'
					color='#3B82F6'
				/>
			</View>
		);
	}

	if (!recipe && !spoonacularRecipe) {
		return (
			<View className='flex-1 items-center justify-center p-4'>
				<Text className='text-gray-600 text-lg text-center'>
					Recipe not found or was deleted.
				</Text>
				<TouchableOpacity
					className='mt-4 bg-blue-500 px-4 py-2 rounded-lg'
					onPress={() => navigation.goBack()}
				>
					<Text className='text-white font-medium'>Go Back</Text>
				</TouchableOpacity>
			</View>
		);
	} // Render different content based on whether it's a Spoonacular recipe or a database recipe
	return (
		<View className='flex-1 bg-gray-50'>
			<StatusBar
				translucent
				backgroundColor='transparent'
				barStyle='dark-content'
			/>
			<Header
				title={isSpoonacularRecipe ? "Recipe Details" : "My Recipe Details"}
				showBackButton={true}
			/>
			{isSpoonacularRecipe ? (
				// Render Spoonacular recipe content
				renderSpoonacularContent()
			) : (
				// Render database recipe content
				<ScrollView
					className='flex-1'
					contentContainerStyle={{
						paddingTop: HEADER_HEIGHT,
						paddingBottom: 20,
					}}
					showsVerticalScrollIndicator={false}
				>
					{/* Recipe Header with Image and Title */}
					<RecipeHeader
						title={recipe.title}
						description={recipe.description}
						imageUrl={recipe.image_url}
					/>

					{/* Recipe Meta Information */}
					<View className='px-4'>
						<RecipeMeta
							prepTime={recipe.prep_time}
							cookTime={recipe.cook_time}
							servings={recipe.servings}
							category={recipe.category}
						/>
					</View>

					{/* Ingredients */}
					<View className='mx-4 mb-6'>
						{recipe.ingredients && recipe.ingredients.length > 0 ? (
							<IngredientsList
								ingredients={recipe.ingredients}
								isSpoonacular={false}
							/>
						) : (
							<Text className='text-gray-500'>No ingredients listed</Text>
						)}
					</View>

					{/* Cooking Steps/Instructions */}
					<View className='mx-4 mb-6'>
						{recipe.cooking_steps && recipe.cooking_steps.length > 0 ? (
							<InstructionsList
								steps={recipe.cooking_steps}
								isSpoonacular={false}
							/>
						) : (
							<Text className='text-gray-500'>No instructions provided</Text>
						)}
					</View>

					{/* Created Date */}
					<View className='mx-4 mb-6'>
						<Text className='text-sm text-gray-500'>
							Created on {formatDate(recipe.created_at)}
						</Text>
					</View>
				</ScrollView>
			)}
		</View>
	);
};

export default RecipeDetailScreen;
