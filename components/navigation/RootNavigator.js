import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ROUTES } from "./routes";
import BottomTabNavigator from "./BottomTabNavigator";
import { useAuth } from "../../context/AuthContext";
import LoginScreen from "../../pages/LoginScreen";
import RegisterScreen from "../../pages/RegisterScreen";
import OnboardingScreen from "../../pages/OnboardingScreen";
import { ActivityIndicator, View } from "react-native";
import ProfileScreen from "../../pages/ProfileScreen";
import EditProfileScreen from "../../pages/EditProfileScreen";
import AddRecipeNotes from "../../pages/AddRecipeNotes";
import RecipeDetailScreen from "../../pages/RecipeDetailScreen";
import BookmarksScreen from "../../pages/BookMarksScreen";
import { OnboardingService } from "../../services/OnboardingService";
import MyCollectionScreen from "../../pages/MyCollectionScreen";
import CreateCollectionScreen from "../../pages/CreateCollectionScreen";
import CollectionDetailScreen from "../../pages/CollectionDetailScreen";
import NotesScreen from "../../pages/NotesScreen";

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();

const AuthNavigator = () => {
	return (
		<AuthStack.Navigator
			screenOptions={{ headerShown: false }}
			initialRouteName={ROUTES.LOGIN}
		>
			<AuthStack.Screen
				name={ROUTES.LOGIN}
				component={LoginScreen}
			/>
			<AuthStack.Screen
				name={ROUTES.REGISTER}
				component={RegisterScreen}
			/>
		</AuthStack.Navigator>
	);
};

const RootNavigator = () => {
	const { user, loading } = useAuth();
	const [onboardingCompleted, setOnboardingCompleted] = useState(null);
	const [checkingOnboarding, setCheckingOnboarding] = useState(false);

	useEffect(() => {
		// Hanya cek onboarding status jika user sudah login
		if (user) {
			checkOnboardingStatus();
		} else {
			// Reset onboarding status jika user logout
			setOnboardingCompleted(null);
			setCheckingOnboarding(false);
		}
	}, [user]);

	const checkOnboardingStatus = async () => {
		setCheckingOnboarding(true);
		try {
			const completed = await OnboardingService.isOnboardingCompleted(user?.id);
			setOnboardingCompleted(completed);
		} catch (error) {
			console.error("Error checking onboarding status:", error);
			// Default to not completed on error
			setOnboardingCompleted(false);
		} finally {
			setCheckingOnboarding(false);
		}
	};

	const handleOnboardingComplete = async () => {
		try {
			await OnboardingService.completeOnboarding(user?.id);
			await OnboardingService.markNotFirstTime();
			setOnboardingCompleted(true);
		} catch (error) {
			console.error("Error completing onboarding:", error);
		}
	};

	if (loading || (user && checkingOnboarding)) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator
					size='large'
					color='#1482D1'
				/>
			</View>
		);
	}

	return (
		<RootStack.Navigator screenOptions={{ headerShown: false }}>
			{user ? (
				// User sudah login, cek apakah sudah selesai onboarding
				onboardingCompleted ? (
					<>
						{/* Main App Screen */}
						<RootStack.Screen
							name='MainApp'
							component={BottomTabNavigator}
						/>

						{/* Profile Screen */}
						<RootStack.Screen
							name={ROUTES.PROFILE}
							component={ProfileScreen}
						/>

						{/* Notes Screen */}
						<RootStack.Screen
							name={ROUTES.NOTES}
							component={NotesScreen}
						/>

						{/* Tambahkan screen lain yang perlu diakses dari stack utama */}
						<RootStack.Screen
							name={ROUTES.EDIT_PROFILE}
							component={EditProfileScreen}
						/>
						<RootStack.Screen
							name={ROUTES.MY_COLLECTION}
							component={MyCollectionScreen}
						/>
						<RootStack.Screen
							name={ROUTES.CREATE_COLLECTION}
							component={CreateCollectionScreen}
						/>
						<RootStack.Screen
							name={ROUTES.COLLECTION_DETAIL}
							component={CollectionDetailScreen}
						/>
						<RootStack.Screen
							name={ROUTES.ADD_RECIPE_NOTES}
							component={AddRecipeNotes}
						/>

						<RootStack.Screen
							name={ROUTES.RECIPE_DETAIL}
							component={RecipeDetailScreen}
						/>
						<RootStack.Screen
							name={ROUTES.BOOKMARKS}
							component={BookmarksScreen}
						/>
					</>
				) : (
					// User sudah login tapi belum selesai onboarding
					<RootStack.Screen name={ROUTES.ONBOARDING}>
						{() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
					</RootStack.Screen>
				)
			) : (
				// User belum login, tampilkan Auth screens
				<RootStack.Screen
					name='Auth'
					component={AuthNavigator}
					initialParams={{ screen: ROUTES.LOGIN }}
				/>
			)}
		</RootStack.Navigator>
	);
};

export default RootNavigator;
