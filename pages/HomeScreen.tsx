import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StatusBar,
	TouchableOpacity,
	ScrollView,
	Platform,
	Image,
} from "react-native";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../components/navigation/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HEADER_HEIGHT =
	Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

const HomeScreen = ({ navigation }) => {
	const { user, signOut } = useAuth();
	const userName = user?.user_metadata?.name || "User";
	const avatarUrl = user?.user_metadata?.avatar_url;
	const [isReturningUser, setIsReturningUser] = useState(false);

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
				console.error("Error checking returning user status:", error);
				// Default to welcome in case of error
				setIsReturningUser(false);
			}
		};

		checkIfReturningUser();
	}, [user]);

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
			>
				<View className='px-5 py-6 flex-col gap-6'>
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

					{/* Quick Access Section */}
					<View>
						<Text className='text-xl font-bold text-gray-800 mb-3'>
							Quick Access
						</Text>
						<View className='bg-white rounded-2xl shadow-md p-5'>
							<View className='flex flex-row justify-around'>
								<TouchableOpacity
									className='items-center'
									onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)}
								>
									<View className='w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2'>
										<Ionicons
											name='pencil-outline'
											size={28}
											color='#3b82f6'
										/>
									</View>
									<Text className='text-gray-700'>Edit Profile</Text>
								</TouchableOpacity>

								<TouchableOpacity
									className='flex-col gap-2 items-center'
									onPress={() => navigation.navigate(ROUTES.MY_RECIPES)}
								>
									<View className='w-16 h-16 bg-green-100 rounded-full items-center justify-center'>
										<Ionicons
											name='book-outline'
											size={28}
											color='#10b981'
										/>
									</View>
									<Text className='text-gray-700'>My Recipes</Text>
								</TouchableOpacity>

								<TouchableOpacity
									className='items-center'
									onPress={() => console.log("Favorites")}
								>
									<View className='w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-2'>
										<Ionicons
											name='heart-outline'
											size={28}
											color='#f59e0b'
										/>
									</View>
									<Text className='text-gray-700'>Favorites</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>

					{/* Recipe Inspiration Card */}
					<View>
						<Text className='text-xl font-bold text-gray-800 mb-3'>
							Recipe Inspiration
						</Text>
						<View className='bg-white rounded-2xl shadow-md overflow-hidden'>
							<View className='h-40 bg-gray-300'>
								{/* Image placeholder - you can replace with actual image later */}
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
									Discover New Recipes
								</Text>
								<Text className='text-gray-600'>
									Explore our collection of delicious recipes for every occasion
								</Text>
								<TouchableOpacity
									className='bg-blue-500 rounded-lg py-2 px-4 mt-3 self-start'
									onPress={() => navigation.navigate(ROUTES.RECIPE)}
								>
									<Text className='text-white font-medium'>Explore Now</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

export default HomeScreen;
