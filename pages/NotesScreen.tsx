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
	Modal,
} from "react-native";
import {
	useNavigation,
	useFocusEffect,
	useRoute,
	RouteProp,
} from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import RecipeCard from "../components/recipe/MyRecipeCard";
import SearchBarTW from "../components/SearchBarTW";
import CollectionPickerModal from "../components/collection/CollectionPickerModal";
import { ROUTES } from "../components/navigation/routes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Type for navigation parameters
type RootStackParamList = {
	[ROUTES.RECIPE_DETAIL]: { recipeId: string };
	[ROUTES.ADD_RECIPE_NOTES]: undefined;
	[ROUTES.EDIT_RECIPE_NOTES]: { recipeId: string };
	[ROUTES.NOTES]: { fromCollection?: boolean };
	MainApp: { screen: string };
};

// Type for route
type NotesRouteProp = RouteProp<RootStackParamList, typeof ROUTES.NOTES>;

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

const HEADER_HEIGHT =
	Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

const NotesScreen = () => {
	const navigation = useNavigation<NavigationProp>();
	const route = useRoute();
	const { user } = useAuth();

	// Check if screen is accessed from a collection
	const fromCollection = route.params
		? (route.params as any).fromCollection
		: false;

	// Log untuk debugging
	console.log("Route params:", route.params);

	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
	const [showCollectionPicker, setShowCollectionPicker] = useState(false);
	const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
	const [showActionSheet, setShowActionSheet] = useState(false);

	const fetchRecipes = async () => {
		if (!user) return;

		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("myrecipes")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (error) throw error;

			setRecipes(data || []);
			setFilteredRecipes(data || []);
		} catch (error) {
			console.error("Error fetching recipes:", error);
			Alert.alert("Error", "Failed to load recipes");
		} finally {
			setLoading(false);
		}
	};

	// Handle pull to refresh
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchRecipes();
		setRefreshing(false);
	}, [user]);

	// Filter recipes based on search query
	const handleSearch = (query: string) => {
		setSearchQuery(query);
		if (!query.trim()) {
			setFilteredRecipes(recipes);
		} else {
			const filtered = recipes.filter(
				(recipe) =>
					recipe.title.toLowerCase().includes(query.toLowerCase()) ||
					recipe.description?.toLowerCase().includes(query.toLowerCase()) ||
					recipe.category?.toLowerCase().includes(query.toLowerCase())
			);
			setFilteredRecipes(filtered);
		}
	};

	// Navigate to recipe detail
	const handleRecipePress = (recipeId: string) => {
		navigation.navigate(ROUTES.RECIPE_DETAIL, { recipeId });
	};

	// Show action sheet when recipe card is pressed
	const handleRecipeCardPress = (recipe: Recipe) => {
		setSelectedRecipe(recipe);
		setShowActionSheet(true);
	};

	// Handle add to collection
	const handleAddToCollection = () => {
		setShowActionSheet(false);
		setShowCollectionPicker(true);
	};
	// Handle view recipe details
	const handleViewRecipe = () => {
		if (selectedRecipe) {
			setShowActionSheet(false);
			handleRecipePress(selectedRecipe.id);
		}
	};

	// Handle edit recipe
	const handleEditRecipe = () => {
		if (selectedRecipe) {
			setShowActionSheet(false);
			navigation.navigate(ROUTES.EDIT_RECIPE_NOTES, {
				recipeId: selectedRecipe.id,
			});
		}
	};

	// Handle delete recipe
	const handleDeleteRecipe = async () => {
		if (!selectedRecipe) return;

		try {
			setShowActionSheet(false);

			// Show confirmation alert before deletion
			Alert.alert(
				"Delete Recipe",
				`Are you sure you want to delete "${selectedRecipe.title}"?`,
				[
					{
						text: "Cancel",
						style: "cancel",
					},
					{
						text: "Delete",
						style: "destructive",
						onPress: async () => {
							try {
								// Delete recipe from database
								const { error } = await supabase
									.from("myrecipes")
									.delete()
									.eq("id", selectedRecipe.id);

								// Check for foreign key constraint error (recipe is in a collection)
								if (error) {
									// Check if it's a foreign key constraint error
									if (
										error.code === "23503" &&
										error.message.includes("collection_recipes")
									) {
										Alert.alert(
											"Cannot Delete Recipe",
											"This recipe is currently in one or more collections. Please remove it from all collections first before deleting it.",
											[
												{
													text: "OK",
													style: "default",
												},
											]
										);
										return;
									}
									throw error;
								}

								// Update local state to remove the deleted recipe
								const updatedRecipes = recipes.filter(
									(recipe) => recipe.id !== selectedRecipe.id
								);
								setRecipes(updatedRecipes);
								setFilteredRecipes(updatedRecipes);

								// Show success message
								Alert.alert("Success", "Recipe deleted successfully");
							} catch (error) {
								console.error("Error deleting recipe:", error);
								Alert.alert("Error", "Failed to delete recipe");
							}
						},
					},
				]
			);
		} catch (error) {
			console.error("Error in delete process:", error);
			Alert.alert("Error", "Something went wrong");
		}
	};

	// Close action sheet
	const closeActionSheet = () => {
		setShowActionSheet(false);
		setSelectedRecipe(null);
	};

	// Close collection picker
	const closeCollectionPicker = () => {
		setShowCollectionPicker(false);
		setSelectedRecipe(null);
	};

	// Navigate to add recipe screen
	const handleAddRecipe = () => {
		navigation.navigate(ROUTES.ADD_RECIPE_NOTES);
	};

	// Load recipes when screen is focused
	useFocusEffect(
		useCallback(() => {
			fetchRecipes();
		}, [user])
	);

	// Render recipe item
	const renderRecipeItem = ({ item }: { item: Recipe }) => (
		<RecipeCard
			recipe={item}
			onPress={() => handleRecipeCardPress(item)}
		/>
	);

	// Empty state when no recipes found during search
	const renderNoSearchResults = () => (
		<View className='flex-1 justify-center items-center px-6 py-12'>
			<View className='items-center'>
				<View className='w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4'>
					<Ionicons
						name='search-outline'
						size={40}
						color='#9CA3AF'
					/>
				</View>
				<Text className='text-xl font-bold text-gray-800 mb-2 text-center'>
					No Recipes Found
				</Text>
				<Text className='text-gray-500 text-center leading-5'>
					No recipes match your search for "{searchQuery}"
				</Text>
			</View>
		</View>
	);

	// Empty state component when no recipes exist
	const renderEmptyState = () => (
		<View className='flex-1 justify-center items-center px-6 py-12'>
			<Ionicons
				name='restaurant-outline'
				size={80}
				color='#9CA3AF'
			/>
			<Text className='text-gray-500 text-lg font-medium mt-4 text-center'>
				No recipes yet
			</Text>
			<Text className='text-gray-400 text-sm mt-2 text-center'>
				Start creating your personal recipe collection
			</Text>
			<TouchableOpacity
				onPress={handleAddRecipe}
				className='bg-blue-500 px-6 py-3 rounded-full mt-6'
			>
				<Text className='text-white font-semibold'>
					Create Your First Recipe
				</Text>
			</TouchableOpacity>
		</View>
	);
	return (
		<View className='flex-1 bg-gray-50'>
			{/* Set status bar to translucent for content to appear underneath */}
			<StatusBar
				translucent
				backgroundColor='transparent'
				barStyle='dark-content'
			/>
			{/* Header positioned absolutely so it stays fixed at the top */}
			<Header
				title='My Recipe Notes'
				showBackButton={fromCollection}
				showBookmark={false}
			/>

			{/* Fixed Search Bar that doesn't scroll */}
			<View
				style={{
					position: "absolute",
					top: HEADER_HEIGHT,
					left: 0,
					right: 0,
					zIndex: 10,
					backgroundColor: "#f9fafb",
				}}
			>
				<View className='px-5 py-4'>
					<SearchBarTW
						value={searchQuery}
						onChangeText={handleSearch}
						placeholder='Search recipes...'
						containerClassName='border border-gray-200'
					/>
				</View>
				<View className='h-2 bg-gradient-to-b from-gray-100 to-transparent' />
			</View>

			{/* Main Content with padding top to accommodate the fixed header and search bar */}
			{loading ? (
				<View
					className='flex-1 justify-center items-center'
					style={{ paddingTop: HEADER_HEIGHT + 80 }}
				>
					<ActivityIndicator
						size='large'
						color='#3B82F6'
					/>
					<Text className='text-gray-500'>Loading recipes...</Text>
				</View>
			) : (
				<FlatList
					data={filteredRecipes}
					renderItem={renderRecipeItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 80 }}
					showsVerticalScrollIndicator={false}
					contentInset={{ top: 0, left: 0, bottom: 16, right: 0 }}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							colors={["#3B82F6"]}
							tintColor='#3B82F6'
							progressViewOffset={HEADER_HEIGHT + 60}
						/>
					}
					ListEmptyComponent={
						recipes.length === 0 ? renderEmptyState : renderNoSearchResults
					}
				/>
			)}
			{/* Floating Action Button - Only show when there are recipes */}
			{!loading && filteredRecipes.length > 0 && (
				<TouchableOpacity
					onPress={handleAddRecipe}
					className='absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg'
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
						size={28}
						color='white'
					/>
				</TouchableOpacity>
			)}

			{/* Action Sheet Modal */}
			<Modal
				visible={showActionSheet}
				transparent={true}
				animationType='slide'
				onRequestClose={closeActionSheet}
			>
				<TouchableOpacity
					className='flex-1 bg-gray-800/50 justify-end'
					activeOpacity={1}
					onPress={closeActionSheet}
				>
					<View className='bg-white rounded-t-3xl p-6'>
						{selectedRecipe && (
							<View className='mb-4'>
								<Text className='text-lg font-bold text-gray-800 mb-1'>
									{selectedRecipe.title}
								</Text>
								{selectedRecipe.description && (
									<Text
										className='text-gray-500 text-sm'
										numberOfLines={2}
									>
										{selectedRecipe.description}
									</Text>
								)}
							</View>
						)}

						<View className='flex-col gap-3'>
							<TouchableOpacity
								className='flex-row items-center p-4 bg-blue-50 rounded-xl'
								onPress={handleViewRecipe}
							>
								<View className='w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3'>
									<Ionicons
										name='eye-outline'
										size={20}
										color='white'
									/>
								</View>
								<View className='flex-1'>
									<Text className='font-semibold text-blue-800'>
										View Recipe
									</Text>
									<Text className='text-blue-600 text-sm'>
										See full recipe details
									</Text>
								</View>
								<Ionicons
									name='chevron-forward'
									size={20}
									color='#3B82F6'
								/>
							</TouchableOpacity>
							<TouchableOpacity
								className='flex-row items-center p-4 bg-orange-50 rounded-xl'
								onPress={handleAddToCollection}
							>
								<View className='w-10 h-10 bg-orange-500 rounded-full items-center justify-center mr-3'>
									<Ionicons
										name='library-outline'
										size={20}
										color='white'
									/>
								</View>
								<View className='flex-1'>
									<Text className='font-semibold text-orange-800'>
										Add to Collection
									</Text>
									<Text className='text-orange-600 text-sm'>
										Organize in your collections
									</Text>
								</View>
								<Ionicons
									name='chevron-forward'
									size={20}
									color='#F97316'
								/>
							</TouchableOpacity>
							<TouchableOpacity
								className='flex-row items-center p-4 bg-green-50 rounded-xl'
								onPress={handleEditRecipe}
							>
								<View className='w-10 h-10 bg-green-500 rounded-full items-center justify-center mr-3'>
									<Ionicons
										name='pencil-outline'
										size={20}
										color='white'
									/>
								</View>
								<View className='flex-1'>
									<Text className='font-semibold text-green-800'>
										Edit Recipe
									</Text>
									<Text className='text-green-600 text-sm'>
										Make changes to your recipe
									</Text>
								</View>
								<Ionicons
									name='chevron-forward'
									size={20}
									color='#10B981'
								/>
							</TouchableOpacity>
							<TouchableOpacity
								className='flex-row items-center p-4 bg-red-50 rounded-xl'
								onPress={handleDeleteRecipe}
							>
								<View className='w-10 h-10 bg-red-500 rounded-full items-center justify-center mr-3'>
									<Ionicons
										name='trash-outline'
										size={20}
										color='white'
									/>
								</View>
								<View className='flex-1'>
									<Text className='font-semibold text-red-800'>
										Delete Recipe
									</Text>
									<Text className='text-red-600 text-sm'>
										Remove this recipe permanently
									</Text>
								</View>
								<Ionicons
									name='chevron-forward'
									size={20}
									color='#EF4444'
								/>
							</TouchableOpacity>
						</View>

						<TouchableOpacity
							className='mt-4 p-3 items-center'
							onPress={closeActionSheet}
						>
							<Text className='text-gray-500 font-medium'>Cancel</Text>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			</Modal>

			{/* Collection Picker Modal */}
			<CollectionPickerModal
				visible={showCollectionPicker}
				recipe={selectedRecipe}
				onClose={closeCollectionPicker}
				onSuccess={() => {
					// Optionally refresh data or show success message
				}}
			/>
		</View>
	);
};

export default NotesScreen;
