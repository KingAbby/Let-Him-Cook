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

interface RouteParams {
	recipeId: string;
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

const HEADER_HEIGHT = Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

const MyRecipeDetailScreen = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const { recipeId } = route.params as RouteParams;
	const [recipe, setRecipe] = useState<Recipe | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchRecipeDetails();
	}, [recipeId]);

	const fetchRecipeDetails = async () => {
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

	if (!recipe) {
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
	}

	return (
		<View className='flex-1 bg-gray-50'>
			<StatusBar
				translucent
				backgroundColor='transparent'
				barStyle='dark-content'
			/>

			{/* Menggunakan Header dengan properti yang sesuai */}
			<Header
				title='Recipe Details'
				showBackButton={true}
			/>

			<ScrollView
				className='flex-1'
				contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Recipe Image */}
				{recipe.image_url ? (
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
									className={`flex-row py-2 ${index < recipe.ingredients!.length - 1
											? "border-b border-gray-100"
											: ""
										}`}
								>
									<View className='w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2' />
									<Text className='text-gray-700'>
										<Text className='font-medium'>
											{ingredient.amount} {ingredient.unit}
										</Text>{" "}
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
									className={`flex-row py-3 ${index < recipe.cooking_steps!.length - 1
											? "border-b border-gray-100"
											: ""
										}`}
								>
									<View className='bg-blue-500 w-6 h-6 rounded-full items-center justify-center mr-3'>
										<Text className='text-white font-medium'>{step.step}</Text>
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
		</View>
	);
};

export default MyRecipeDetailScreen;