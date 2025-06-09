import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "./routes";

// Import semua screen
import HomeScreen from "../../pages/HomeScreen";
import RecipeScreen from "../../pages/RecipeScreen";
import NotesScreen from "../../pages/NotesScreen";
import ProfileScreen from "../../pages/ProfileScreen";
import EditProfileScreen from "../../pages/EditProfileScreen";
import RecipeDetailScreen from "../../pages/RecipeDetailScreen";
import BookmarksScreen from "../../pages/BookMarksScreen";
import MyCollectionScreen from "../../pages/MyCollectionScreen";
import CreateCollectionScreen from "../../pages/CreateCollectionScreen";
import CollectionDetailScreen from "../../pages/CollectionDetailScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
	return (
		<Stack.Navigator
			initialRouteName={ROUTES.HOME}
			screenOptions={{
				headerShown: false,
				animation: "slide_from_right",
				gestureEnabled: true,
				gestureDirection: "horizontal",
			}}
		>
			{/* Home */}
			<Stack.Screen
				name={ROUTES.HOME}
				component={HomeScreen}
			/>

			{/* Recipe */}
			<Stack.Screen
				name={ROUTES.RECIPE}
				component={RecipeScreen}
			/>

			{/* Notes */}
			<Stack.Screen
				name={ROUTES.NOTES}
				component={NotesScreen}
			/>

			{/* Profile */}
			<Stack.Screen
				name={ROUTES.PROFILE}
				component={ProfileScreen}
			/>

			{/* Edit Profile */}
			<Stack.Screen
				name={ROUTES.EDIT_PROFILE}
				component={EditProfileScreen}
			/>

			{/* Recipe Detail */}
			<Stack.Screen
				name={ROUTES.RECIPE_DETAIL}
				component={RecipeDetailScreen}
			/>

			{/* Bookmarks */}
			<Stack.Screen
				name={ROUTES.BOOKMARKS}
				component={BookmarksScreen}
			/>			{/* My Collection */}
			<Stack.Screen
				name={ROUTES.MY_COLLECTION}
				component={MyCollectionScreen}
			/>

			{/* Create Collection */}
			<Stack.Screen
				name={ROUTES.CREATE_COLLECTION}
				component={CreateCollectionScreen}
			/>

			{/* Collection Detail */}
			<Stack.Screen
				name={ROUTES.COLLECTION_DETAIL}
				component={CollectionDetailScreen}
			/>
		</Stack.Navigator>
	);
};

export default StackNavigator;
