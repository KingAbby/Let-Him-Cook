import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	ScrollView,
	ActivityIndicator,
	Platform,
	StatusBar,
	Dimensions,
	RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import { BookmarkService, BookmarkedRecipe } from "../services/BookmarkService";
import { bookmarkEventService } from "../services/BookmarkEventService";
import { useAuth } from "../context/AuthContext";
import RecipeCard from "../components/recipe/RecipeCard";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

// Helper function to convert BookmarkedRecipe to Recipe format
const bookmarkToRecipe = (bookmark: BookmarkedRecipe) => {
	return {
		id: bookmark.recipe_id,
		title: bookmark.recipe_title,
		image: bookmark.recipe_image,
		readyInMinutes: bookmark.recipe_servings,
		servings: bookmark.recipe_ready_in_minutes,
	};
};

const BookmarksScreen = () => {
	const { user } = useAuth();
	const navigation = useNavigation();
	const [bookmarks, setBookmarks] = useState<BookmarkedRecipe[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [removeLoading, setRemoveLoading] = useState<Set<number>>(new Set());

	const headerHeight =
		Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

	useFocusEffect(
		useCallback(() => {
			loadBookmarks();
		}, [user])
	);

	const loadBookmarks = async () => {
		if (!user) {
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			const userBookmarks = await BookmarkService.getUserBookmarks(user.id);
			setBookmarks(userBookmarks);
		} catch (error) {
			console.error("Error loading bookmarks:", error);
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await loadBookmarks();
		setRefreshing(false);
	};
	const removeBookmark = async (recipe: any) => {
		if (!user) return;

		const recipeId = recipe.id;
		setRemoveLoading((prev) => new Set(prev).add(recipeId));

		try {
			const result = await BookmarkService.removeBookmark(user.id, recipeId);
			if (result.success) {
				setBookmarks((prev) =>
					prev.filter((bookmark) => bookmark.recipe_id !== recipeId)
				);

				// Emit event to notify RecipeScreen
				bookmarkEventService.emitBookmarkRemoved(recipeId);
			}
		} catch (error) {
			console.error("Error removing bookmark:", error);
		} finally {
			setRemoveLoading((prev) => {
				const newSet = new Set(prev);
				newSet.delete(recipeId);
				return newSet;
			});
		}
	};
	const renderBookmarkCard = (item: BookmarkedRecipe, index: number) => {
		const recipe = bookmarkToRecipe(item);
		const isRemoveLoading = removeLoading.has(item.recipe_id);

		return (
			<RecipeCard
				key={item.id}
				item={recipe}
				width={CARD_WIDTH}
				height={200}
				isBookmarked={true}
				isBookmarkLoading={isRemoveLoading}
				onToggleBookmark={removeBookmark}
				onPress={(recipe) => {
					// @ts-ignore - Navigation typing can be fixed later if needed
					navigation.navigate("RecipeDetail", { recipe });
				}}
			/>
		);
	};

	const renderBookmarkGrid = () => {
		const rows = [];
		for (let i = 0; i < bookmarks.length; i += 2) {
			rows.push(
				<View
					key={i}
					className='flex-row justify-between mb-4'
				>
					{renderBookmarkCard(bookmarks[i], i)}
					{bookmarks[i + 1] && renderBookmarkCard(bookmarks[i + 1], i + 1)}
				</View>
			);
		}
		return rows;
	};
	if (!user) {
		return (
			<View className='flex-1 bg-gray-50'>
				<StatusBar
					translucent
					backgroundColor='transparent'
					barStyle='dark-content'
				/>
				<Header
					title='Your Favorite Recipes'
					showBackButton={true}
				/>
				<View
					className='flex-1 justify-center items-center px-5'
					style={{ paddingTop: headerHeight }}
				>
					<Text className='text-base text-gray-500 text-center'>
						Please login to view your bookmarks
					</Text>
				</View>
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

			<Header
				title='Your Favorite Recipes'
				showBackButton={true}
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
						progressViewOffset={headerHeight}
					/>
				}
			>
				<View className='px-4 pb-6'>
					{loading ? (
						<View className='items-center justify-center py-12'>
							<ActivityIndicator
								size='large'
								color='#3b82f6'
							/>
							<Text className='text-gray-500 mt-2 text-sm'>
								Loading your bookmarks...
							</Text>
						</View>
					) : bookmarks.length === 0 ? (
						<View className='items-center justify-center py-12'>
							<Ionicons
								name='bookmark-outline'
								size={64}
								color='#d1d5db'
							/>
							<Text className='text-lg font-semibold text-gray-700 mt-4 mb-2'>
								No Bookmarks Yet
							</Text>
							<Text className='text-sm text-gray-500 text-center px-8'>
								Start bookmarking your favorite recipes to see them here
							</Text>
						</View>
					) : (
						<View className='flex-1'>{renderBookmarkGrid()}</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
};

export default BookmarksScreen;
