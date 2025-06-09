import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import { ROUTES } from "../components/navigation/routes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Definisi tipe untuk parameter navigasi
type RootStackParamList = {
  [ROUTES.EDIT_PROFILE]: undefined;
  [ROUTES.RECIPE_DETAIL]: { recipeId: string };
  [ROUTES.NOTES]: undefined;
  [ROUTES.MY_COLLECTION]: undefined;
  MainApp: { screen: string };
};

// Tipe untuk navigasi
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: string | null;
  category: string | null;
  image_url: string | null;
  created_at: string | null;
}

const HEADER_HEIGHT = Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();

  // Ensure userName is always a string
  const userName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "No email";

  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Just refresh the user avatar in case it was updated
      if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh user profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      return () => {
        // cleanup if needed
      };
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      console.log("Sign out completed");
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || "Failed to sign out");
    }
  };

  const handleEditProfile = () => {
    navigation.navigate(ROUTES.EDIT_PROFILE);
  };

  // Add loading state to prevent rendering with incomplete data
  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-2 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <Header title="Profile" showBackButton={true} showBookmark={false} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Centered Profile Section */}
        <View className="flex-col gap-4 items-center p-8">
          {/* Profile Photo */}
          {avatarUrl ? (
            <Image
              source={{
                uri: avatarUrl.startsWith("http")
                  ? avatarUrl
                  : `${supabase.storage.from("avatars").getPublicUrl(avatarUrl)
                    .data.publicUrl
                  }`,
              }}
              className="w-28 h-28 rounded-full border-4 border-white shadow-md"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            />
          ) : (
            <View
              className="h-28 w-28 rounded-full bg-blue-500 items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text className="text-white text-4xl font-bold">
                {String(userName).charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* User Information */}
          <View className="flex-col gap-2">
            <Text className="text-2xl font-bold text-gray-800 text-center">
              {String(userName)}
            </Text>
            <Text className="text-gray-500 text-center">
              {String(userEmail)}
            </Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            onPress={handleEditProfile}
            className="bg-blue-500 px-5 py-2.5 rounded-full flex-row gap-2 items-center"
          >
            <Ionicons name="pencil-outline" size={16} color="white" />
            <Text className="text-white font-medium">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="h-2 bg-gray-100 w-full my-2" />

        <View className="flex-col gap-8">
          {/* Collection Section */}
          <View className="px-4 pt-4">
            <View className="mb-4">
              <Text className="text-xl font-bold text-gray-800 mb-2">
                Collection
              </Text>
              <Text className="text-gray-500">
                View and manage all your saved recipes
              </Text>
            </View>

            {/* Simplified buttons for recipe actions */}
            <View>
              <TouchableOpacity
                onPress={() => {
                  try {
                    navigation.navigate(ROUTES.MY_COLLECTION);
                  } catch (error) {
                    console.error("Navigation error:", error);
                    // Fallback method if direct navigation fails
                    const navigationRef = require("../components/navigation/navigationRef").default;
                    if (navigationRef.isReady()) {
                      const {
                        CommonActions,
                      } = require("@react-navigation/native");
                      navigationRef.dispatch(
                        CommonActions.navigate({
                          name: ROUTES.MY_COLLECTION,
                        })
                      );
                    }
                  }
                }}
                className="bg-white rounded-xl shadow-sm p-4 flex-row justify-between items-center mb-2"
              >
                <View className="flex-row gap-3 items-center">
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                    <Ionicons name="library-outline" size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-gray-800 font-medium">
                    View Collection
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            className="mx-4 bg-red-500 rounded-xl py-3.5 items-center"
            onPress={handleSignOut}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium text-base">Sign Out</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;