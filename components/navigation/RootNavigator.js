import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ROUTES } from "./routes";
import BottomTabNavigator from "./BottomTabNavigator";
import { useAuth } from "../../context/AuthContext";
import LoginScreen from "../../pages/LoginScreen";
import RegisterScreen from "../../pages/RegisterScreen";
import { ActivityIndicator, View } from "react-native";
import ProfileScreen from "../../pages/ProfileScreen";
import EditProfileScreen from "../../pages/EditProfileScreen";
import MyRecipeDetailScreen from "../../pages/MyRecipeDetailScreen";
import RecipeDetailScreen from "../../pages/RecipeDetailScreen";
import BookmarksScreen from "../../pages/BookMarksScreen";
import MyRecipesScreen from "../../pages/MyRecipesScreen";

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();

const AuthNavigator = () => {
	return (
		<AuthStack.Navigator screenOptions={{ headerShown: false }}>
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

	if (loading) {
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

					{/* Tambahkan screen lain yang perlu diakses dari stack utama */}
					<RootStack.Screen
						name={ROUTES.EDIT_PROFILE}
						component={EditProfileScreen}
					/>
					<RootStack.Screen
						name={ROUTES.MY_RECIPE_DETAIL}
						component={MyRecipeDetailScreen}
					/>
					<RootStack.Screen
						name={ROUTES.MY_RECIPES}
						component={MyRecipesScreen}
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
				<RootStack.Screen
					name='Auth'
					component={AuthNavigator}
				/>
			)}
		</RootStack.Navigator>
	);
};

export default RootNavigator;
