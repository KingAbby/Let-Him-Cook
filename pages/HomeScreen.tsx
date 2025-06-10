import React, { useEffect, useState, useRef } from "react";
import {
	View,
	Text,
	StatusBar,
	TouchableOpacity,
	ScrollView,
	Platform,
	Image,
	FlatList,
	Dimensions,
	RefreshControl,
	Alert,
} from "react-native";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../components/navigation/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HEADER_HEIGHT =
	Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;
const { width: screenWidth } = Dimensions.get("window");

// Function to fetch random recipe from API
const getRandomRecipe = async () => {
	try {
		const response = await fetch(
			"https://www.themealdb.com/api/json/v1/1/random.php"
		);
		const data = await response.json();
		return data.meals[0];
	} catch (error) {
		return null;
	}
};

const HomeScreen = ({ navigation }) => {
	const { user, signOut } = useAuth();
	const userName = user?.user_metadata?.name || "User";
	const avatarUrl = user?.user_metadata?.avatar_url;
	const [isReturningUser, setIsReturningUser] = useState(false);
	const [inspirationRecipes, setInspirationRecipes] = useState([]);
	const [currentSlide, setCurrentSlide] = useState(0);
	const [refreshing, setRefreshing] = useState(false);
	const flatListRef = useRef(null);

	useEffect(() => {
		// Check if the user has logged in before
		const checkIfReturningUser = async () => {
			try {
				if (user) {
					const userId = user.id;
					const returningUserKey = `@returning_user_${userId}`;
					const hasLoggedInBefore = await AsyncStorage.getItem(
						returningUserKey
					);

					if (!hasLoggedInBefore) {
						// First time login, set the flag for next time
						await AsyncStorage.setItem(returningUserKey, "true");
						setIsReturningUser(false);
					} else {
						setIsReturningUser(true);
					}
				}
			} catch (error) {
				// Default to welcome in case of error
				setIsReturningUser(false);
			}
		};

		checkIfReturningUser();
		fetchInspirationRecipes();
	}, [user]);

	// Fetch 4 random recipes for inspiration
	const fetchInspirationRecipes = async () => {
		try {
			const recipes = [];
			for (let i = 0; i < 4; i++) {
				const recipe = await getRandomRecipe();
				if (recipe) {
					recipes.push({
						id: recipe.idMeal,
						title: recipe.strMeal,
						image: recipe.strMealThumb,
						category: recipe.strCategory,
						area: recipe.strArea,
					});
				}
			}
			setInspirationRecipes(recipes);
		} catch (error) {}
	};

	// Function to fetch detailed recipe from TheMealDB API
	const getDetailedRecipe = async (id) => {
		try {
			const response = await fetch(
				`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
			);
			const data = await response.json();
			return data.meals[0];
		} catch (error) {
			return null;
		}
	};

	// Helper function to extract ingredients from TheMealDB format
	const extractIngredients = (recipe) => {
		if (!recipe) return [];

		const ingredients = [];
		for (let i = 1; i <= 20; i++) {
			const ingredient = recipe[`strIngredient${i}`];
			const measure = recipe[`strMeasure${i}`];

			if (ingredient && ingredient.trim()) {
				ingredients.push({
					name: ingredient.trim(),
					measure: measure?.trim() || "",
				});
			}
		}
		return ingredients;
	};

	// Convert TheMealDB recipe to format compatible with RecipeDetailScreen
	const convertToSpoonacularFormat = async (mealDbRecipe) => {
		const detailedRecipe = await getDetailedRecipe(mealDbRecipe.id);

		return {
			id: parseInt(mealDbRecipe.id),
			title: mealDbRecipe.title,
			image: mealDbRecipe.image,
			servings: 4, // Default servings for TheMealDB recipes
			readyInMinutes: 30, // Default time
			cookingMinutes: 20,
			preparationMinutes: 10,
			instructions: detailedRecipe?.strInstructions || "",
			ingredients: extractIngredients(detailedRecipe),
			youtubeUrl: detailedRecipe?.strYoutube || "",
			sourceUrl: detailedRecipe?.strSource || "",
			category: mealDbRecipe.category,
			area: mealDbRecipe.area,
		};
	};

	// Handle try recipe button press
	const handleTryRecipe = async (recipeItem) => {
		try {
			// Convert TheMealDB recipe to Spoonacular-compatible format
			const convertedRecipe = await convertToSpoonacularFormat(recipeItem);

			// Navigate to recipe detail with the converted recipe data
			navigation.navigate("RecipeDetail", {
				recipe: convertedRecipe,
			});
		} catch (error) {
			Alert.alert("Error", "Failed to load recipe details. Please try again.");
		}
	};

	// Auto scroll effect
	useEffect(() => {
		if (inspirationRecipes.length > 0) {
			const interval = setInterval(() => {
				setCurrentSlide((prevSlide) => {
					const nextSlide = (prevSlide + 1) % inspirationRecipes.length;
					flatListRef.current?.scrollToIndex({
						index: nextSlide,
						animated: true,
					});
					return nextSlide;
				});
			}, 5000);

			return () => clearInterval(interval);
		}
	}, [inspirationRecipes]);

	// Handle scroll event
	const onScrollEnd = (event) => {
		const contentOffset = event.nativeEvent.contentOffset;
		const index = Math.round(contentOffset.x / screenWidth);
		setCurrentSlide(index);
	};

	// Handle refresh
	const onRefresh = async () => {
		setRefreshing(true);
		await fetchInspirationRecipes();
		setRefreshing(false);
	};

	// Render carousel item
	const renderCarouselItem = ({ item }) => (
		<View
			style={{ width: screenWidth - 40 }}
			className='bg-white rounded-2xl shadow-md overflow-hidden mx-5 my-3'
		>
			<View className='h-40'>
				<Image
					source={{ uri: item.image }}
					className='w-full h-full'
					resizeMode='cover'
				/>
			</View>
			<View className='p-4'>
				<Text
					className='text-lg font-bold text-gray-800 mb-1'
					numberOfLines={2}
				>
					{item.title}
				</Text>
				<Text className='text-gray-500 text-sm mb-2'>
					{item.category} • {item.area}
				</Text>
				<Text className='text-gray-600'>
					Discover this delicious recipe and add it to your collection
				</Text>
				<TouchableOpacity
					className='bg-blue-500 rounded-lg py-2 px-4 mt-3 self-start'
					onPress={() => handleTryRecipe(item)}
				>
					<Text className='text-white font-medium'>Try Recipe</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	// Render dot indicators
	const renderDotIndicators = () => (
		<View className='flex-row justify-center mt-3'>
			{inspirationRecipes.map((_, index) => (
				<View
					key={index}
					className={`w-2 h-2 rounded-full mx-1 ${
						currentSlide === index ? "bg-blue-500" : "bg-gray-300"
					}`}
				/>
			))}
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
			<Header title="Let's Cook" />

			{/* Main Content with padding top to accommodate the fixed header */}
			<ScrollView
				className='flex-1'
				contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						progressViewOffset={HEADER_HEIGHT}
					/>
				}
			>
				<View className='py-6 flex-col gap-6'>
					<View className='px-5'>
						<View className='bg-white rounded-3xl shadow-lg border-hairline border-blue-500'>
							<View className='bg-gradient-to-r from-blue-500 to-blue-400 px-6 py-6'>
								<View className='flex flex-row justify-between items-center'>
									<View>
										<Text className='text-black text-xl font-semibold mb-1'>
											{isReturningUser ? "Welcome Back," : "Welcome,"}
										</Text>
										<Text className='text-blue-600 text-3xl font-bold'>
											{userName}
										</Text>
									</View>
									<TouchableOpacity
										onPress={() => navigation.navigate(ROUTES.PROFILE)}
										className='w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md'
									>
										{avatarUrl ? (
											<Image
												source={{ uri: avatarUrl }}
												className='w-full h-full'
												resizeMode='cover'
											/>
										) : (
											<View className='w-full h-full bg-blue-500 items-center justify-center'>
												<Text className='text-white text-xl font-bold'>
													{userName.charAt(0).toUpperCase()}
												</Text>
											</View>
										)}
									</TouchableOpacity>
								</View>
							</View>

							<View className='px-6 py-4'>
								<Text className='text-gray-600 text-base'>
									What would you like to cook today?
								</Text>
							</View>
						</View>
					</View>

					{/* Quick Access Section */}
					<View className='px-5'>
						<Text className='text-xl font-bold text-gray-800 mb-3'>
							Quick Access
						</Text>
						<View className='bg-white rounded-2xl shadow-md p-5 border-hairline border-blue-500'>
							<View className='flex flex-row justify-around'>
								<TouchableOpacity
									className='items-center'
									onPress={() => navigation.navigate(ROUTES.ADD_RECIPE_NOTES)}
								>
									<View className='w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2'>
										<SimpleLineIcons
											name='notebook'
											size={28}
											color='#3b82f6'
										/>
									</View>
									<Text className='text-gray-700'>Add Recipe</Text>
								</TouchableOpacity>

								<TouchableOpacity
									className='flex-col gap-2 items-center'
									onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)}
								>
									<View className='w-16 h-16 bg-green-100 rounded-full items-center justify-center'>
										<Ionicons
											name='pencil-outline'
											size={28}
											color='#10b981'
										/>
									</View>
									<Text className='text-gray-700'>Edit Profile</Text>
								</TouchableOpacity>

								<TouchableOpacity
									className='items-center'
									onPress={() => navigation.navigate(ROUTES.MY_COLLECTION)}
								>
									<View className='w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-2'>
										<Ionicons
											name='library-outline'
											size={28}
											color='#f59e0b'
										/>
									</View>
									<Text className='text-gray-700'>Collections</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>

					{/* Recipe Inspiration Carousel */}
					<View>
						<Text className='text-xl font-bold text-gray-800 px-5'>
							Recipe Inspiration
						</Text>
						{inspirationRecipes.length > 0 ? (
							<View>
								<FlatList
									ref={flatListRef}
									data={inspirationRecipes}
									renderItem={renderCarouselItem}
									horizontal
									pagingEnabled
									showsHorizontalScrollIndicator={false}
									onMomentumScrollEnd={onScrollEnd}
									keyExtractor={(item) => item.id}
									contentContainerStyle={{ paddingHorizontal: 0 }}
								/>
								{renderDotIndicators()}
							</View>
						) : (
							<View className='bg-white rounded-2xl shadow-md overflow-hidden mx-5 border-hairline border-blue-500 '>
								<View className='h-40 bg-gray-300'>
									<View className='w-full h-full items-center justify-center'>
										<Ionicons
											name='image'
											size={40}
											color='#9ca3af'
										/>
									</View>
								</View>
								<View className='p-4'>
									<Text className='text-lg font-bold text-gray-800 mb-1'>
										Loading Inspiration...
									</Text>
									<Text className='text-gray-600'>
										Fetching delicious recipes for you
									</Text>
								</View>
							</View>
						)}
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

export default HomeScreen;
