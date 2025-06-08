import React, { useState, useCallback } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Alert,
	FlatList,
	ActivityIndicator,
	RefreshControl,
	StatusBar,
	Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import RecipeCard from "../components/MyRecipeCard";
import SearchBarTW from "../components/SearchBarTW";
import { ROUTES } from "../components/navigation/routes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Type for navigation parameters
type RootStackParamList = {
	[ROUTES.RECIPE_DETAIL]: { recipeId: string };
	[ROUTES.NOTES]: undefined;
	MainApp: { screen: string };
};

// Type for navigation
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

const HEADER_HEIGHT = Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

const MyRecipesScreen = () => {
	const navigation = useNavigation<NavigationProp>();
	const { user } = useAuth();

	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

	const fetchUserRecipes = async () => {
		if (!user) return;

		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("myrecipes")
				.select(
					"id, title, description, prep_time, cook_time, servings, category, image_url, created_at"
				)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching recipes:", error);
				Alert.alert("Error", "Failed to fetch your recipes");
				return;
			}

			setRecipes(data || []);
			setFilteredRecipes(data || []);
		} catch (error) {
			console.error("Error in fetchUserRecipes:", error);
			Alert.alert("Error", "Something went wrong while fetching your recipes");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	// Fetch recipes on component mount and whenever screen comes into focus
	useFocusEffect(
		useCallback(() => {
			fetchUserRecipes();
			return () => {
				// cleanup if needed
			};
		}, [user])
	);

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchUserRecipes();
	};
	const handleViewRecipe = (recipeId: string) => {
		try {
			navigation.navigate(ROUTES.RECIPE_DETAIL, { recipeId });
		} catch (error) {
			console.error("Navigation error:", error);
			// Fallback method if direct navigation fails
			const navigationRef =
				require("../components/navigation/navigationRef").default;
			if (navigationRef.isReady()) {
				const { CommonActions } = require("@react-navigation/native");
				navigationRef.dispatch(
					CommonActions.navigate({
						name: ROUTES.RECIPE_DETAIL,
						params: { recipeId },
					})
				);
			} else {
				Alert.alert("Error", "Unable to navigate to Recipe Detail screen");
			}
		}
	};
	const handleCreateRecipe = () => {
		try {
			navigation.navigate("MainApp", {
				screen: ROUTES.NOTES,
			});
		} catch (error) {
			console.error("Navigation error:", error);
			// Fallback method if direct navigation fails
			const navigationRef =
				require("../components/navigation/navigationRef").default;
			if (navigationRef.isReady()) {
				const { CommonActions } = require("@react-navigation/native");
				navigationRef.dispatch(
					CommonActions.navigate({
						name: "MainApp",
						params: {
							screen: ROUTES.NOTES,
						},
					})
				);
			} else {
				Alert.alert("Error", "Unable to navigate to Notes screen");
			}
		}
	};

	const handleSearch = (text: string) => {
		setSearchQuery(text);
		if (text.trim() === "") {
			setFilteredRecipes(recipes);
		} else {
			const filtered = recipes.filter(
				(recipe) =>
					recipe.title.toLowerCase().includes(text.toLowerCase()) ||
					(recipe.description &&
						recipe.description.toLowerCase().includes(text.toLowerCase()))
			);
			setFilteredRecipes(filtered);
		}
	};

	const getTotalCookingTime = (
		prepTime: number | null,
		cookTime: number | null
	) => {
		const total = (prepTime || 0) + (cookTime || 0);
		return total > 0 ? `${total} min` : "-";
	};

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
	const renderRecipeItem = ({ item }: { item: Recipe }) => (
		<RecipeCard
			recipe={item}
			onPress={handleViewRecipe}
		/>
	);

	const renderEmptyState = () => (
		<View className='flex-1 items-center justify-center px-4 py-12'>
			<Ionicons
				name='document-text-outline'
				size={64}
				color='#D1D5DB'
			/>
			<Text className='text-gray-500 text-lg font-medium mt-4 text-center'>
				{searchQuery ? "No recipes match your search" : "You Have No Recipes"}
			</Text>
			<Text className='text-gray-400 text-center mt-2 mb-6'>
				{searchQuery
					? "Try a different search term"
					: "Create your first recipe to get started"}
			</Text>
			<TouchableOpacity
				onPress={handleCreateRecipe}
				className='bg-blue-500 py-3 px-6 rounded-lg'
			>
				<Text className='text-white font-medium'>Create Recipe</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<View className='flex-1 bg-gray-50'>
			<StatusBar
				translucent
				backgroundColor='transparent'
				barStyle='dark-content'
			/>
			<Header
				title='My Recipes'
				showBackButton={true}
			/>
			<View
				className='flex-1'
				style={{ marginTop: HEADER_HEIGHT }}
			>
				{/* Search Bar */}
				<View className='px-4 pb-3'>
					<SearchBarTW
						placeholder='Search recipes...'
						value={searchQuery}
						onChangeText={handleSearch}
						onClear={() => handleSearch("")}
						containerClassName='mb-3'
					/>
				</View>
				{loading ? (
					<View className='flex-1 items-center justify-center'>
						<ActivityIndicator
							size='large'
							color='#3B82F6'
						/>
					</View>
				) : (
					<FlatList
						data={filteredRecipes}
						keyExtractor={(item) => item.id}
						renderItem={renderRecipeItem}
						contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
						ListEmptyComponent={renderEmptyState}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={onRefresh}
							/>
						}
					/>
				)}
				{/* Floating Action Button */}
				<TouchableOpacity
					className='absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg'
					onPress={handleCreateRecipe}
					style={{
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.25,
						shadowRadius: 3.84,
						elevation: 5,
					}}
				>
					<Ionicons
						name='add'
						size={30}
						color='white'
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default MyRecipesScreen;