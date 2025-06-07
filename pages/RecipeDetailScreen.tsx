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
import { Ionicons } from "@expo/vector-icons";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import {
	getRecipeIngredients,
	getRecipeInstructions,
	Ingredient as SpoonacularIngredient,
	Instruction,
} from "../services/SpoonacularService";

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
	Platform.OS === "ios" ? HEADER_HEIGHTS.ios : HEADER_HEIGHTS.android;

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
	};

	// Render Spoonacular recipe content
	const renderSpoonacularContent = () => {
		if (!spoonacularRecipe) return null;

		return (
			<ScrollView
				className='flex-1'
				contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 30 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Recipe Image */}
				<View className='w-full h-64 bg-gray-200'>
					{spoonacularRecipe.image ? (
						<Image
							source={{ uri: spoonacularRecipe.image }}
							className='w-full h-full'
							resizeMode='cover'
						/>
					) : (
						<View className='w-full h-full items-center justify-center'>
							<Ionicons
								name='image-outline'
								size={48}
								color='#9CA3AF'
							/>
						</View>
					)}
				</View>

				{/* Recipe Info */}
				<View className='p-4'>
					<Text className='text-2xl font-bold text-gray-800 mb-2'>
						{spoonacularRecipe.title}
					</Text>

					{/* Recipe Meta */}
					<View className='flex-row flex-wrap mb-6 mt-2'>
						<View className='flex-row items-center mr-6 mb-2'>
							<Ionicons
								name='time-outline'
								size={20}
								color='#6B7280'
							/>
							<Text className='text-gray-600 ml-1'>
								{spoonacularRecipe.readyInMinutes
									? `${spoonacularRecipe.readyInMinutes} min total`
									: "No time info"}
							</Text>
						</View>

						<View className='flex-row items-center mr-6 mb-2'>
							<Ionicons
								name='people-outline'
								size={20}
								color='#6B7280'
							/>
							<Text className='text-gray-600 ml-1'>
								{spoonacularRecipe.servings
									? `${spoonacularRecipe.servings} servings`
									: "Servings unknown"}
							</Text>
						</View>
					</View>

					{/* Ingredients Section */}
					<View className='mb-6'>
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

						{spoonacularIngredients.length > 0 ? (
							spoonacularIngredients.map((ingredient, index) => (
								<View
									key={index}
									className='flex-row items-center mb-2 bg-white p-3 rounded-lg'
								>
									<View className='w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3'>
										<Text className='text-blue-600 font-bold'>{index + 1}</Text>
									</View>
									<View className='flex-1'>
										<Text className='text-gray-700 font-medium capitalize'>
											{ingredient.name}
										</Text>
										<Text className='text-gray-500 text-sm'>
											{ingredient.amount.us.value} {ingredient.amount.us.unit}
											{ingredient.amount.us.unit ? "" : " "}(
											{ingredient.amount.metric.value}
											{ingredient.amount.metric.unit})
										</Text>
									</View>
								</View>
							))
						) : (
							<Text className='text-gray-500'>
								No ingredients information available
							</Text>
						)}
					</View>

					{/* Instructions Section */}
					<View className='mb-4'>
						<View className='flex-row items-center mb-4'>
							<Ionicons
								name='document-text-outline'
								size={22}
								color='#4B5563'
							/>
							<Text className='text-xl font-bold text-gray-700 ml-2'>
								Instructions
							</Text>
						</View>

						{spoonacularInstructions.length > 0 &&
						spoonacularInstructions[0]?.steps?.length > 0 ? (
							spoonacularInstructions[0].steps.map((step) => (
								<View
									key={step.number}
									className='mb-4 bg-white p-4 rounded-lg'
								>
									<View className='flex-row mb-2'>
										<View className='w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2'>
											<Text className='text-blue-600 font-bold'>
												{step.number}
											</Text>
										</View>
										<Text className='text-gray-700 flex-1'>{step.step}</Text>
									</View>

									{/* Equipment list if available */}
									{step.equipment && step.equipment.length > 0 && (
										<View className='ml-10 mt-2'>
											<Text className='text-gray-600 font-medium mb-1'>
												Equipment:
											</Text>
											<Text className='text-gray-500'>
												{step.equipment.map((e) => e.name).join(", ")}
											</Text>
										</View>
									)}
								</View>
							))
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
					{/* Recipe Image */}
					{recipe?.image_url ? (
						<Image
							source={{ uri: recipe.image_url }}
							className='w-full h-48'
							resizeMode='cover'
						/>
					) : (
						<View className='w-full h-48 bg-gray-200 items-center justify-center'>
							<Ionicons
								name='image-outline'
								size={48}
								color='#9CA3AF'
							/>
						</View>
					)}
					{/* Recipe Info */}
					<View className='p-4'>
						<Text className='text-2xl font-bold text-gray-800 mb-2'>
							{recipe.title}
						</Text>

						{recipe.description && (
							<Text className='text-gray-600 mb-4'>{recipe.description}</Text>
						)}

						{/* Recipe Meta */}
						<View className='flex-row flex-wrap mb-6 mt-2'>
							<View className='flex-row items-center mr-6 mb-2'>
								<Ionicons
									name='time-outline'
									size={20}
									color='#6B7280'
								/>
								<Text className='text-gray-600 ml-1'>
									{recipe.prep_time
										? `${recipe.prep_time} min prep`
										: "No prep time"}
								</Text>
							</View>

							<View className='flex-row items-center mr-6 mb-2'>
								<Ionicons
									name='flame-outline'
									size={20}
									color='#6B7280'
								/>
								<Text className='text-gray-600 ml-1'>
									{recipe.cook_time
										? `${recipe.cook_time} min cook`
										: "No cook time"}
								</Text>
							</View>

							<View className='flex-row items-center mr-6 mb-2'>
								<Ionicons
									name='people-outline'
									size={20}
									color='#6B7280'
								/>
								<Text className='text-gray-600 ml-1'>
									{recipe.servings || "N/A"}
								</Text>
							</View>

							{recipe.category && (
								<View className='bg-blue-100 px-3 py-1 rounded-full mb-2'>
									<Text className='text-blue-800'>{recipe.category}</Text>
								</View>
							)}
						</View>
					</View>
					{/* Ingredients */}
					<View className='mx-4 mb-6'>
						<Text className='text-xl font-bold text-gray-800 mb-3'>
							Ingredients
						</Text>

						<View className='bg-white rounded-xl p-4 shadow-sm'>
							{recipe.ingredients && recipe.ingredients.length > 0 ? (
								recipe.ingredients.map((ingredient, index) => (
									<View
										key={ingredient.id || index}
										className={`flex-row py-2 ${
											index < recipe.ingredients!.length - 1
												? "border-b border-gray-100"
												: ""
										}`}
									>
										<View className='w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2' />
										<Text className='text-gray-700'>
											<Text className='font-medium'>
												{ingredient.amount} {ingredient.unit}
											</Text>
											{ingredient.name}
										</Text>
									</View>
								))
							) : (
								<Text className='text-gray-500'>No ingredients listed</Text>
							)}
						</View>
					</View>
					{/* Cooking Steps */}
					<View className='mx-4 mb-6'>
						<Text className='text-xl font-bold text-gray-800 mb-3'>
							Cooking Steps
						</Text>

						<View className='bg-white rounded-xl p-4 shadow-sm'>
							{recipe.cooking_steps && recipe.cooking_steps.length > 0 ? (
								recipe.cooking_steps.map((step, index) => (
									<View
										key={step.id || index}
										className={`flex-row py-3 ${
											index < recipe.cooking_steps!.length - 1
												? "border-b border-gray-100"
												: ""
										}`}
									>
										<View className='bg-blue-500 w-6 h-6 rounded-full items-center justify-center mr-3'>
											<Text className='text-white font-medium'>
												{step.step}
											</Text>
										</View>
										<Text className='text-gray-700 flex-1'>
											{step.description}
										</Text>
									</View>
								))
							) : (
								<Text className='text-gray-500'>No cooking steps provided</Text>
							)}
						</View>
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
