import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	SafeAreaView,
	Alert,
	RefreshControl,
	Image,
	StatusBar,
	Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ROUTES } from "../components/navigation/routes";
import { supabase } from "../utils/supabase";
import Header, { HEADER_HEIGHTS } from "../components/Header";

const HEADER_HEIGHT =
	Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

const CollectionDetailScreen = ({ route, navigation }) => {
	const { collection } = route.params;
	const [recipes, setRecipes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const fetchCollectionRecipes = async () => {
		try {
			setLoading(true);

			// Fetch recipes associated with this collection
			const { data: collectionRecipes, error } = await supabase
				.from("collection_recipes")
				.select(
					`
					id,
					collection_id,
					recipe_id,
					created_at,
					updated_at,
					myrecipes (
						id,
						title,
						description,
						prep_time,
						cook_time,
						servings,
						category,
						image_url,
						created_at
					)
				`
				)
				.eq("collection_id", collection.id);

			if (error) {
				throw error;
			}

			setRecipes(collectionRecipes || []);
		} catch (error) {
			console.error("Error fetching collection recipes:", error);
			Alert.alert("Error", "Failed to load collection recipes");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCollectionRecipes();
	}, [collection.id]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchCollectionRecipes();
		setRefreshing(false);
	};

	const handleRemoveRecipe = async (recipeId) => {
		Alert.alert(
			"Remove Recipe",
			"Are you sure you want to remove this recipe from the collection?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Remove",
					style: "destructive",
					onPress: async () => {
						try {
							const { error } = await supabase
								.from("collection_recipes")
								.delete()
								.eq("collection_id", collection.id)
								.eq("recipe_id", recipeId);

							if (error) throw error;

							// Refresh the list
							await fetchCollectionRecipes();
						} catch (error) {
							console.error("Error removing recipe:", error);
							Alert.alert("Error", "Failed to remove recipe from collection");
						}
					},
				},
			]
		);
	};

	const handleRecipePress = (recipe) => {
		// Navigate to recipe detail screen
		navigation.navigate(ROUTES.RECIPE_DETAIL, {
			recipeId: recipe.myrecipes.id,
		});
	};

	const renderEmptyState = () => (
		<View className='flex-1 justify-center items-center px-6'>
			<View className='w-24 h-24 bg-gray-100 rounded-full justify-center items-center mb-4'>
				<Ionicons
					name='restaurant-outline'
					size={32}
					color='#3b82f6'
				/>
			</View>
			<Text className='text-xl font-bold text-gray-900 mb-2'>
				No Recipes Yet
			</Text>
			<Text className='text-gray-500 text-center mb-6'>
				This collection is empty. Add some recipes from your recipe collection!
			</Text>
			<TouchableOpacity
				className='bg-blue-500 px-6 py-3 rounded-xl'
				onPress={() =>
					navigation.navigate(ROUTES.NOTES, { fromCollection: true })
				}
			>
				<Text className='text-white font-semibold'>Browse Recipes</Text>
			</TouchableOpacity>
		</View>
	);

	const renderRecipeItem = (item) => (
		<TouchableOpacity
			key={item.id}
			className='bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100'
			onPress={() => handleRecipePress(item)}
		>
			<View className='flex-row justify-between items-start mb-2'>
				<View className='flex-1 mr-3'>
					<Text className='text-lg font-bold text-gray-900 mb-1'>
						{item.myrecipes?.title || "Untitled Recipe"}
					</Text>
					{item.myrecipes?.description && (
						<Text
							className='text-gray-600 text-sm'
							numberOfLines={2}
						>
							{item.myrecipes.description}
						</Text>
					)}
				</View>
				{item.myrecipes?.image_url && (
					<Image
						source={{ uri: item.myrecipes.image_url }}
						className='w-16 h-16 rounded-lg mr-2'
						resizeMode='cover'
					/>
				)}
				<TouchableOpacity
					onPress={() => handleRemoveRecipe(item.recipe_id)}
					className='p-2'
				>
					<Ionicons
						name='trash-outline'
						size={20}
						color='#EF4444'
					/>
				</TouchableOpacity>
			</View>

			{/* Recipe metadata */}
			<View className='flex-row flex-wrap items-center mt-3 gap-3'>
				{item.myrecipes?.prep_time && (
					<View className='flex-row items-center'>
						<Ionicons
							name='time-outline'
							size={16}
							color='#6B7280'
						/>
						<Text className='text-sm text-gray-500 ml-1'>
							{item.myrecipes.prep_time} min prep
						</Text>
					</View>
				)}
				{item.myrecipes?.cook_time && (
					<View className='flex-row items-center'>
						<Ionicons
							name='flame-outline'
							size={16}
							color='#6B7280'
						/>
						<Text className='text-sm text-gray-500 ml-1'>
							{item.myrecipes.cook_time} min cook
						</Text>
					</View>
				)}
				{item.myrecipes?.servings && (
					<View className='flex-row items-center'>
						<Ionicons
							name='restaurant-outline'
							size={16}
							color='#6B7280'
						/>
						<Text className='text-sm text-gray-500 ml-1'>
							{item.myrecipes.servings} servings
						</Text>
					</View>
				)}
			</View>

			{item.myrecipes?.category && (
				<View className='mt-3'>
					<View className='bg-blue-100 px-3 py-1 rounded-full self-start'>
						<Text className='text-blue-600 text-xs font-medium'>
							{item.myrecipes.category}
						</Text>
					</View>
				</View>
			)}

			<View className='flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100'>
				<Text className='text-xs text-gray-400'>
					Added{" "}
					{new Date(item.created_at).toLocaleDateString("en-US", {
						day: "numeric",
						month: "long",
						year: "numeric",
					})}
				</Text>
				<View className='flex-row items-center'>
					<Ionicons
						name='chevron-forward'
						size={16}
						color='#9CA3AF'
					/>
				</View>
			</View>
		</TouchableOpacity>
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
				title={collection.name}
				showBackButton={true}
				showBookmark={false}
				rightIcon={
					<Ionicons
						name='add'
						size={24}
						color='#3b82f6'
					/>
				}
				onRightIconPress={() =>
					navigation.navigate(ROUTES.NOTES, { fromCollection: true })
				}
			/>

			{/* Collection Stats */}
			<View
				className='bg-white mx-4 rounded-xl p-4 shadow-sm'
				style={{ marginTop: HEADER_HEIGHT + 16 }}
			>
				<View className='flex-row items-center justify-between'>
					<View className='flex-col gap-4'>
						<View className='flex-row items-center'>
							<View className='w-10 h-10 bg-blue-100 rounded-full justify-center items-center mr-3'>
								<Ionicons
									name='library'
									size={20}
									color='#3b82f6'
								/>
							</View>
							<View className='flex-col'>
								<Text className='text-lg font-bold text-gray-900'>
									{recipes.length} Recipe{recipes.length !== 1 ? "s" : ""}
								</Text>
								<Text className='text-sm text-gray-500'>
									Created
									{new Date(collection.created_at).toLocaleDateString("en-US", {
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</Text>
							</View>
						</View>
						<View className='flex-col gap-2'>
							<Text className='text-lg font-bold'>Description:</Text>
							<Text className='text-sm text-gray-500'>
								{collection.description || "No description provided."}
							</Text>
						</View>
					</View>
				</View>
			</View>

			{/* Recipes List */}
			<ScrollView
				className='flex-1 px-4 mt-4'
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
					/>
				}
				showsVerticalScrollIndicator={false}
			>
				{loading ? (
					<View className='flex-1 justify-center items-center py-20'>
						<Text className='text-gray-500'>Loading recipes...</Text>
					</View>
				) : recipes.length === 0 ? (
					renderEmptyState()
				) : (
					<View className='pb-6'>{recipes.map(renderRecipeItem)}</View>
				)}
			</ScrollView>
		</View>
	);
};

export default CollectionDetailScreen;
