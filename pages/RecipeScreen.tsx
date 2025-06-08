import React, { useEffect, useState } from "react";
import {
	View,
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
import RecipeGrid from "../components/recipe/RecipeGrid";
import SearchBarTW from "../components/SearchBarTW";
import LoadingState from "../components/recipe/LoadingState";
import EmptyState from "../components/recipe/EmptyState";

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

			const promises = Array(1)
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
					? "Recipe removed from favorites"
					: "Recipe added to favorites";

				console.log(message);
			} else {
				Alert.alert("Error", result.error || "Failed to update favorites");
			}
		} catch (error) {
			console.error("Error toggling favorite:", error);
			Alert.alert("Error", "Failed to update favorite");
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

	// Recipe rendering is now handled by the RecipeGrid component	return (
	<View className='flex-1 bg-gray-50'>
		{/* Set status bar to translucent for content to appear underneath */}
		<StatusBar
			translucent
			backgroundColor='transparent'
			barStyle='dark-content'
		/>
		{/* Header positioned absolutely so it stays fixed at the top */}
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
		{/* Fixed Search Bar */}
		<View
			style={{
				position: "absolute",
				top: headerHeight,
				left: 0,
				right: 0,
				zIndex: 10,
				backgroundColor: "#f9fafb",
			}}
		>
			<View className='px-5 py-4'>
				<SearchBarTW
					placeholder='Search recipes...'
					value={searchQuery}
					onChangeText={setSearchQuery}
					onSubmit={handleSearch}
					onClear={handleClearSearch}
					containerClassName='w-full border border-blue-500'
				/>
			</View>
			<View className='h-2 bg-gradient-to-b from-gray-100 to-transparent' />
		</View>{" "}
		{/* Main Content with padding top to accommodate the fixed header and search bar */}
		{loading ? (
			<View
				className='flex-1 items-center justify-center'
				style={{ paddingTop: headerHeight + 80 }}
			>
				<LoadingState isSearching={isSearching} />
			</View>
		) : recipes.length === 0 ? (
			<View
				className='flex-1 items-center justify-center'
				style={{ paddingTop: headerHeight + 80 }}
			>
				<EmptyState
					searchQuery={searchQuery}
					onClearSearch={handleClearSearch}
				/>
			</View>
		) : (
			<ScrollView
				className='flex-1'
				contentContainerStyle={{ paddingTop: headerHeight + 84 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={["#3b82f6"]}
						tintColor={"#3b82f6"}
						progressViewOffset={headerHeight + 60}
					/>
				}
			>
				<View className='px-5 py-6 flex-col gap-6'>
					<RecipeGrid
						recipes={recipes}
						cardWidth={CARD_WIDTH}
						bookmarkedRecipes={bookmarkedRecipes}
						bookmarkLoading={bookmarkLoading}
						toggleBookmark={toggleBookmark}
						onPressRecipe={(recipe) =>
							navigation.navigate("RecipeDetail", { recipe })
						}
					/>
				</View>
			</ScrollView>
		)}
	</View>;
};

export default RecipeScreen;
