import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import RecipeCard from "../components/MyRecipeCard";
import SearchBarTW from "../components/SearchBarTW";
import { ROUTES } from "../components/navigation/routes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Type for navigation parameters
type RootStackParamList = {
  [ROUTES.RECIPE_DETAIL]: { recipeId: string };
  [ROUTES.ADD_RECIPE_NOTES]: undefined;
  MainApp: { screen: string };
};

// Type for navigation
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

const NotesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  const fetchRecipes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("myrecipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRecipes(data || []);
      setFilteredRecipes(data || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      Alert.alert("Error", "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecipes();
    setRefreshing(false);
  }, [user]);

  // Filter recipes based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(query.toLowerCase()) ||
        (recipe.description?.toLowerCase().includes(query.toLowerCase())) ||
        (recipe.category?.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredRecipes(filtered);
    }
  };

  // Navigate to recipe detail
  const handleRecipePress = (recipeId: string) => {
    navigation.navigate(ROUTES.RECIPE_DETAIL, { recipeId });
  };

  // Navigate to add recipe screen
  const handleAddRecipe = () => {
    navigation.navigate(ROUTES.ADD_RECIPE_NOTES);
  };

  // Load recipes when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [user])
  );

  // Render recipe item
  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <RecipeCard
      recipe={item}
      onPress={() => handleRecipePress(item.id)}
    />
  );

  // Empty state component
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6 py-12">
      <Ionicons name="restaurant-outline" size={80} color="#9CA3AF" />
      <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
        No recipes yet
      </Text>
      <Text className="text-gray-400 text-sm mt-2 text-center">
        Start creating your personal recipe collection
      </Text>
      <TouchableOpacity
        onPress={handleAddRecipe}
        className="bg-blue-500 px-6 py-3 rounded-full mt-6"
      >
        <Text className="text-white font-semibold">Create Your First Recipe</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Header */}
      <Header
        title="My Recipes"
        showBackButton={false}
      />

      <View
        className="flex-1"
        style={{ marginTop: HEADER_HEIGHT }}
      >
        {/* Search Bar */}
        <View className="px-4 py-3">
          <SearchBarTW
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search recipes..."
            containerClassName="mb-2"
          />
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500">Loading notes...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 100, // Space for FAB
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#3B82F6"]}
                tintColor="#3B82F6"
              />
            }
            ListEmptyComponent={renderEmptyState}
          />)}

        {/* Floating Action Button - Only show when there are recipes */}
        {!loading && filteredRecipes.length > 0 && (
          <TouchableOpacity
            onPress={handleAddRecipe}
            className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default NotesScreen;