import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	ScrollView,
	StatusBar,
	Platform,
	Dimensions,
	Alert,
	RefreshControl,
} from "react-native";

import {
	getRandomRecipe,
	Recipe,
	searchRecipes,
} from "../services/SpoonacularService";
import { BookmarkService } from "../services/BookmarkService";
import { bookmarkEventService } from "../services/BookmarkEventService";
import { Ionicons } from "@expo/vector-icons";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import { useAuth } from "../context/AuthContext";
import SearchBarTW from "../components/SearchBarTW";
import RecipeCard from "../components/RecipeCard";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const RecipeScreen = ({ navigation }) => {
	const { user } = useAuth();
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const [bookmarkedRecipes, setBookmarkedRecipes] = useState<Set<number>>(
		new Set()
	);
	const [bookmarkLoading, setBookmarkLoading] = useState<Set<number>>(
		new Set()
	);

	const headerHeight =
		Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

	useEffect(() => {
		// Load recipes only on initial mount
		fetchRandomRecipes();
	}, []);

	useEffect(() => {
		if (user && recipes.length > 0) {
			loadBookmarkStatus();
		}
	}, [user, recipes]);

	// Listen untuk bookmark changes dari screen lain
	useEffect(() => {
		const handleBookmarkChange = (
			recipeId: number,
			action: "added" | "removed"
		) => {
			setBookmarkedRecipes((prev) => {
				const newSet = new Set(prev);
				if (action === "removed") {
					newSet.delete(recipeId);
				} else {
					newSet.add(recipeId);
				}
				return newSet;
			});
		};

		bookmarkEventService.onBookmarkChanged(handleBookmarkChange);

		return () => {
			bookmarkEventService.removeBookmarkListeners();
		};
	}, []);
	const fetchRandomRecipes = async () => {
		try {
			// Use loading state for initial load, and refreshing for pull-to-refresh
			if (!refreshing) {
				setLoading(true);
			}

			const promises = Array(4)
				.fill(0)
				.map(() => getRandomRecipe());
			const randomRecipes = await Promise.all(promises);
			setRecipes(randomRecipes);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	// Function to handle pull-to-refresh
	const onRefresh = () => {
		setRefreshing(true);
		fetchRandomRecipes();
	};

	const loadBookmarkStatus = async () => {
		if (!user) return;

		try {
			const bookmarkStatuses = await Promise.all(
				recipes.map((recipe) =>
					BookmarkService.isBookmarked(user.id, recipe.id)
				)
			);

			const bookmarkedSet = new Set<number>();
			recipes.forEach((recipe, index) => {
				if (bookmarkStatuses[index]) {
					bookmarkedSet.add(recipe.id);
				}
			});

			setBookmarkedRecipes(bookmarkedSet);
		} catch (error) {
			console.error("Error loading bookmark status:", error);
		}
	};

	const toggleBookmark = async (recipe: Recipe) => {
		if (!user) {
			Alert.alert("Login Required", "Please login to bookmark recipes");
			return;
		}

		const recipeId = recipe.id;
		const isCurrentlyBookmarked = bookmarkedRecipes.has(recipeId);

		setBookmarkLoading((prev) => new Set(prev).add(recipeId));

		try {
			let result;
			if (isCurrentlyBookmarked) {
				result = await BookmarkService.removeBookmark(user.id, recipeId);
			} else {
				result = await BookmarkService.addBookmark(user.id, recipe);
			}

			if (result.success) {
				setBookmarkedRecipes((prev) => {
					const newSet = new Set(prev);
					if (isCurrentlyBookmarked) {
						newSet.delete(recipeId);
					} else {
						newSet.add(recipeId);
					}
					return newSet;
				});

				// Emit event untuk memberitahu screen lain
				if (isCurrentlyBookmarked) {
					bookmarkEventService.emitBookmarkRemoved(recipeId);
				} else {
					bookmarkEventService.emitBookmarkAdded(recipeId);
				}

				const message = isCurrentlyBookmarked
					? "Recipe removed from bookmarks"
					: "Recipe added to bookmarks";

				console.log(message);
			} else {
				Alert.alert("Error", result.error || "Failed to update bookmark");
			}
		} catch (error) {
			console.error("Error toggling bookmark:", error);
			Alert.alert("Error", "Failed to update bookmark");
		} finally {
			setBookmarkLoading((prev) => {
				const newSet = new Set(prev);
				newSet.delete(recipeId);
				return newSet;
			});
		}
	};
	const handleSearch = async () => {
		if (!searchQuery.trim()) {
			// If search is empty, reset to random recipes
			if (isSearching) {
				fetchRandomRecipes();
				setIsSearching(false);
			}
			return;
		}

		try {
			setIsSearching(true);
			setLoading(true);
			const results = await searchRecipes(searchQuery);

			if (results && results.length > 0) {
				setRecipes(results);
			} else {
				// No results found
				setRecipes([]);
				console.log("No recipes found for: " + searchQuery);
			}
		} catch (error) {
			console.error("Error searching recipes:", error);
			Alert.alert("Error", "Unable to search recipes. Please try again.");
		} finally {
			setLoading(false);
			setIsSearching(false);
		}
	};

	const handleClearSearch = () => {
		setSearchQuery("");
		if (isSearching) {
			fetchRandomRecipes();
			setIsSearching(false);
		}
	};
	const renderRecipeCard = (item: Recipe, index: number) => {
		const isBookmarked = bookmarkedRecipes.has(item.id);
		const isBookmarkLoading = bookmarkLoading.has(item.id);

		return (
			<RecipeCard
				key={item.id.toString()}
				item={item}
				width={CARD_WIDTH}
				isBookmarked={isBookmarked}
				isBookmarkLoading={isBookmarkLoading}
				onToggleBookmark={toggleBookmark}
				onPress={(recipe) => navigation.navigate("RecipeDetail", { recipe })}
			/>
		);
	};

	const renderRecipeGrid = () => {
		const rows = [];
		for (let i = 0; i < recipes.length; i += 2) {
			rows.push(
				<View
					key={i}
					className='flex-row justify-between mb-4'
				>
					{renderRecipeCard(recipes[i], i)}
					{recipes[i + 1] && renderRecipeCard(recipes[i + 1], i + 1)}
				</View>
			);
		}
		return rows;
	};

	return (
		<View className='flex-1 bg-gray-50'>
			<StatusBar
				translucent
				backgroundColor='transparent'
				barStyle='dark-content'
			/>
			<Header
				title='Recipes'
				rightIcon={
					<TouchableOpacity onPress={onRefresh}>
						<Ionicons
							name='refresh-outline'
							size={24}
							color='black'
						/>
					</TouchableOpacity>
				}
				onRightIconPress={onRefresh}
			/>
			<ScrollView
				className='flex-1'
				contentContainerStyle={{
					flexGrow: 1,
					paddingTop: headerHeight + 20,
				}}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={["#3b82f6"]}
						tintColor={"#3b82f6"}
					/>
				}
			>
				<View className='px-4 pb-6'>
					{/* Search Bar */}
					<View className='mb-4 mt-1 w-full'>
						<SearchBarTW
							placeholder='Search Recipe'
							value={searchQuery}
							onChangeText={setSearchQuery}
							onSubmit={handleSearch}
							onClear={handleClearSearch}
							containerClassName='w-full'
						/>
					</View>
					{loading ? (
						<View className='items-center justify-center py-12'>
							<ActivityIndicator
								size='large'
								color='#3b82f6'
							/>
							<Text className='text-gray-500 mt-2 text-sm'>
								{isSearching
									? "Searching recipes..."
									: "Loading delicious recipes..."}
							</Text>
						</View>
					) : recipes.length === 0 ? (
						<View className='items-center justify-center py-16'>
							<Ionicons
								name='search-outline'
								size={50}
								color='#d1d5db'
							/>
							<Text className='text-gray-500 mt-4 font-medium text-base'>
								No recipes found
							</Text>
							<Text className='text-gray-400 text-center mt-1 max-w-xs'>
								{searchQuery
									? `We couldn't find any recipes matching "${searchQuery}"`
									: "Try searching for a recipe"}
							</Text>
							{searchQuery && (
								<TouchableOpacity
									onPress={handleClearSearch}
									className='mt-5 bg-blue-500 px-5 py-2.5 rounded-full'
								>
									<Text className='text-white font-medium'>Clear Search</Text>
								</TouchableOpacity>
							)}
						</View>
					) : (
						<View className='flex-1'>{renderRecipeGrid()}</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
};

export default RecipeScreen;
