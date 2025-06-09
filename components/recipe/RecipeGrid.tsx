import React from "react";
import { View } from "react-native";
import RecipeCard from "./RecipeCard";
import { Recipe } from "../../services/SpoonacularService";

interface RecipeGridProps {
	recipes: Recipe[];
	cardWidth: number;
	bookmarkedRecipes: Set<number>;
	bookmarkLoading: Set<number>;
	toggleBookmark: (recipe: Recipe) => void;
	onPressRecipe: (recipe: Recipe) => void;
}

const RecipeGrid: React.FC<RecipeGridProps> = ({
	recipes,
	cardWidth,
	bookmarkedRecipes,
	bookmarkLoading,
	toggleBookmark,
	onPressRecipe,
}) => {
	const renderRecipeCard = (item: Recipe, index: number) => {
		const isBookmarked = bookmarkedRecipes.has(item.id);
		const isBookmarkLoading = bookmarkLoading.has(item.id);

		return (
			<RecipeCard
				key={item.id.toString()}
				item={item}
				width={cardWidth}
				isBookmarked={isBookmarked}
				isBookmarkLoading={isBookmarkLoading}
				onToggleBookmark={toggleBookmark}
				onPress={onPressRecipe}
			/>
		);
	};

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

	return <View className='flex-1'>{rows}</View>;
};

export default RecipeGrid;
