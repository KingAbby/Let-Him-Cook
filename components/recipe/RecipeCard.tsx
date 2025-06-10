import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ImageBackground,
	ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Recipe } from "../../services/SpoonacularService";

interface RecipeCardProps {
	item: Recipe;
	width: number;
	height?: number;
	isBookmarked: boolean;
	isBookmarkLoading: boolean;
	onToggleBookmark: (recipe: Recipe) => void;
	onPress?: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
	item,
	width,
	height = 200,
	isBookmarked,
	isBookmarkLoading,
	onToggleBookmark,
	onPress,
}) => {
	const [imageLoading, setImageLoading] = useState(true);
	const [imageError, setImageError] = useState(false);

	// Default placeholder image if recipe image is missing or fails to load
	const defaultImage = "https://Via.placeholder.com/600x400?text=Recipe+Image";

	return (
		<TouchableOpacity
			key={item.id.toString()}
			className='relative rounded-2xl overflow-hidden bg-white mb-4'
			style={{
				width: width,
				height: height,
				padding: 0,
			}}
			onPress={() => onPress && onPress(item)}
			activeOpacity={0.8}
		>
			<ImageBackground
				source={{ uri: item.image || defaultImage }}
				className='flex-1 relative'
				imageStyle={{ borderRadius: 16 }}
				style={{ width: "100%", height: "100%" }}
				resizeMode='cover'
				onLoadStart={() => setImageLoading(true)}
				onLoadEnd={() => setImageLoading(false)}
				onError={() => {
					setImageError(true);
					setImageLoading(false);
				}}
			>
				{imageLoading && (
					<View className='absolute inset-0 items-center justify-center bg-gray-200 rounded-2xl'>
						<ActivityIndicator
							size='large'
							color='#3b82f6'
						/>
					</View>
				)}
				{imageError && !imageLoading && (
					<View className='absolute inset-0 items-center justify-center bg-gray-200 rounded-2xl'>
						<Ionicons
							name='image-outline'
							size={30}
							color='#9ca3af'
						/>
						<Text className='text-gray-500 mt-2'>Image not available</Text>
					</View>
				)}
				{/* Bookmark button - positioned at top right */}
				<TouchableOpacity
					className='absolute top-3 right-3 w-9 h-9 rounded-full justify-center items-center z-10'
					style={{
						backgroundColor: "rgba(0, 0, 0, 0.6)",
					}}
					onPress={() => onToggleBookmark(item)}
					disabled={isBookmarkLoading}
				>
					{isBookmarkLoading ? (
						<ActivityIndicator
							size='small'
							color='#ffffff'
						/>
					) : (
						<Ionicons
							name={isBookmarked ? "heart" : "heart-outline"}
							size={20}
							color='#ffffff'
						/>
					)}
				</TouchableOpacity>
				<LinearGradient
					colors={["transparent", "rgba(0,0,0,0.75)", "rgba(0,0,0,0.9)"]}
					locations={[0.3, 0.7, 1]}
					style={{
						position: "absolute",
						top: "35%",
						left: 0,
						right: 0,
						bottom: 0,
						borderBottomLeftRadius: 16,
						borderBottomRightRadius: 16,
					}}
				/>
				{/* Recipe info - positioned at bottom */}
				<View className='absolute bottom-0 left-0 right-0 rounded-b-2xl'>
					<View className='p-4 pt-5'>
						<Text
							className='text-white text-sm font-bold mb-1.5 leading-tight text-center'
							numberOfLines={2}
						>
							{item.title}
						</Text>
						<View className='flex-row items-center justify-center gap-4 space-x-2'>
							{/* Total time */}
							<View className='flex-row items-center'>
								<Ionicons
									name='time-outline'
									size={12}
									color='#e5e7eb'
								/>
								<Text className='text-gray-300 text-xs font-bold ml-1'>
									{item.readyInMinutes} min
								</Text>
							</View>

							{/* Servings */}
							<View className='flex-row items-center'>
								<Ionicons
									name='people-outline'
									size={12}
									color='#e5e7eb'
								/>
								<Text className='text-gray-300 text-xs font-bold ml-1'>
									{item.servings} servings
								</Text>
							</View>
						</View>
					</View>
				</View>
			</ImageBackground>
		</TouchableOpacity>
	);
};

export default RecipeCard;
