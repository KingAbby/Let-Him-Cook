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
import Header from "../components/Header";
import { LinearGradient } from "expo-linear-gradient";
import { ROUTES } from "../components/navigation/routes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Definisi tipe untuk parameter navigasi
type RootStackParamList = {
  [ROUTES.EDIT_PROFILE]: undefined;
  [ROUTES.RECIPE_DETAIL]: { recipeId: string };
  [ROUTES.NOTES]: undefined;
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

const HEADER_HEIGHT = Platform.OS === "ios" ? 150 : 70;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();
  const userName = user?.user_metadata?.name || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserRecipes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("myrecipes")
        .select(
          "id, title, description, prep_time, cook_time, servings, category, image_url, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching recipes:", error);
        Alert.alert("Error", "Failed to fetch your recipes");
        return;
      }

      setRecipes(data || []);
    } catch (error) {
      console.error("Error in fetchUserRecipes:", error);
      Alert.alert("Error", "Something went wrong while fetching your recipes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch recipes on component mount and whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserRecipes();
      return () => {
        // cleanup if needed
      };
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserRecipes();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Tidak perlu navigasi, akan dihandle oleh AuthContext
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to sign out");
    }
  };

  const handleEditProfile = () => {
    // Navigasi yang benar ke EditProfile
    navigation.navigate(ROUTES.EDIT_PROFILE);
  };

  const handleViewRecipe = (recipeId: string) => {
    // Navigasi yang benar ke RecipeDetail dengan parameter
    navigation.navigate(ROUTES.RECIPE_DETAIL, { recipeId });
  };

  const getTotalCookingTime = (
    prepTime: number | null,
    cookTime: number | null
  ) => {
    const total = (prepTime || 0) + (cookTime || 0);
    return total > 0 ? `${total} min` : "-";
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <Header title="Profile" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View className="mx-4 mt-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <LinearGradient
            colors={["#3B82F6", "#60A5FA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-5 py-4"
          >
            <Text className="text-white text-lg font-semibold">My Profile</Text>
          </LinearGradient>

          <View className="p-5 flex-row items-center">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <View className="h-16 w-16 rounded-full bg-blue-500 items-center justify-center">
                <Text className="text-white text-2xl font-bold">
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View className="ml-4 flex-1">
              <Text className="text-xl font-semibold text-gray-800">
                {userName}
              </Text>
              <Text className="text-gray-600">{user?.email}</Text>
            </View>

            <TouchableOpacity
              onPress={handleEditProfile}
              className="bg-gray-100 p-2 rounded-full"
            >
              <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* My Recipes Section */}
        <View className="mx-4 mt-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            My Recipes
          </Text>

          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : recipes.length === 0 ? (
            <View className="bg-white rounded-2xl shadow-sm p-6 items-center">
              <Ionicons name="restaurant-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2 text-center">
                You haven't created any recipes yet.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.NOTES)}
                className="mt-3 bg-blue-500 py-2 px-4 rounded-lg"
              >
                <Text className="text-white font-medium">Create Recipe</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-4">
              {recipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  onPress={() => handleViewRecipe(recipe.id)}
                >
                  <View className="flex-row">
                    {recipe.image_url ? (
                      <Image
                        source={{ uri: recipe.image_url }}
                        className="w-24 h-24"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-24 h-24 bg-gray-200 items-center justify-center">
                        <Ionicons
                          name="image-outline"
                          size={32}
                          color="#9CA3AF"
                        />
                      </View>
                    )}

                    <View className="p-3 flex-1">
                      <Text
                        className="text-base font-semibold text-gray-800 mb-1"
                        numberOfLines={1}
                      >
                        {recipe.title}
                      </Text>

                      <Text
                        className="text-gray-500 text-sm mb-2"
                        numberOfLines={1}
                      >
                        {recipe.description || "No description"}
                      </Text>

                      <View className="flex-row items-center">
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color="#9CA3AF"
                        />
                        <Text className="text-gray-500 text-xs ml-1">
                          {getTotalCookingTime(
                            recipe.prep_time,
                            recipe.cook_time
                          )}
                        </Text>

                        <View className="mx-2 w-1 h-1 rounded-full bg-gray-300" />

                        <Ionicons
                          name="restaurant-outline"
                          size={16}
                          color="#9CA3AF"
                        />
                        <Text className="text-gray-500 text-xs ml-1">
                          {recipe.servings || "-"}
                        </Text>

                        {recipe.category && (
                          <>
                            <View className="mx-2 w-1 h-1 rounded-full bg-gray-300" />
                            <View className="bg-gray-100 px-2 py-1 rounded">
                              <Text className="text-gray-600 text-xs">
                                {recipe.category}
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          className="mx-4 mt-8 bg-red-500 rounded-xl py-3 items-center"
          onPress={handleSignOut}
        >
          <Text className="text-white font-medium text-base">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
