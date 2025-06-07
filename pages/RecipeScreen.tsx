import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  ImageBackground,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getRandomRecipe, Recipe } from "../services/SpoonacularService";
import { BookmarkService } from "../services/BookmarkService";
import { bookmarkEventService } from "../services/BookmarkEventService";
import { Ionicons } from "@expo/vector-icons";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const RecipeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<Set<number>>(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState<Set<number>>(new Set());

  const headerHeight = Platform.OS === 'android' ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  useEffect(() => {
    if (user && recipes.length > 0) {
      loadBookmarkStatus();
    }
  }, [user, recipes]);

  // Listen untuk bookmark changes dari screen lain
  useEffect(() => {
    const handleBookmarkChange = (recipeId: number, action: 'added' | 'removed') => {
      setBookmarkedRecipes(prev => {
        const newSet = new Set(prev);
        if (action === 'removed') {
          newSet.delete(recipeId);
        } else {
          newSet.add(recipeId);
        }
        return newSet;
      });
    };

    bookmarkEventService.onBookmarkChanged(handleBookmarkChange);

    return () => {
      bookmarkEventService.removeBookmarkListeners();
    };
  }, []);

  const fetchRandomRecipes = async () => {
    try {
      setLoading(true);
      const promises = Array(10)
        .fill(0)
        .map(() => getRandomRecipe());
      const randomRecipes = await Promise.all(promises);
      setRecipes(randomRecipes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarkStatus = async () => {
    if (!user) return;

    try {
      const bookmarkStatuses = await Promise.all(
        recipes.map(recipe => BookmarkService.isBookmarked(user.id, recipe.id))
      );

      const bookmarkedSet = new Set<number>();
      recipes.forEach((recipe, index) => {
        if (bookmarkStatuses[index]) {
          bookmarkedSet.add(recipe.id);
        }
      });

      setBookmarkedRecipes(bookmarkedSet);
    } catch (error) {
      console.error('Error loading bookmark status:', error);
    }
  };

  const toggleBookmark = async (recipe: Recipe) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to bookmark recipes');
      return;
    }

    const recipeId = recipe.id;
    const isCurrentlyBookmarked = bookmarkedRecipes.has(recipeId);

    setBookmarkLoading(prev => new Set(prev).add(recipeId));

    try {
      let result;
      if (isCurrentlyBookmarked) {
        result = await BookmarkService.removeBookmark(user.id, recipeId);
      } else {
        result = await BookmarkService.addBookmark(user.id, recipe);
      }

      if (result.success) {
        setBookmarkedRecipes(prev => {
          const newSet = new Set(prev);
          if (isCurrentlyBookmarked) {
            newSet.delete(recipeId);
          } else {
            newSet.add(recipeId);
          }
          return newSet;
        });

        // Emit event untuk memberitahu screen lain
        if (isCurrentlyBookmarked) {
          bookmarkEventService.emitBookmarkRemoved(recipeId);
        } else {
          bookmarkEventService.emitBookmarkAdded(recipeId);
        }

        const message = isCurrentlyBookmarked 
          ? 'Recipe removed from bookmarks' 
          : 'Recipe added to bookmarks';
        
        console.log(message);
      } else {
        Alert.alert('Error', result.error || 'Failed to update bookmark');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Failed to update bookmark');
    } finally {
      setBookmarkLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
    }
  };

  // ...existing code...
  const renderRecipeCard = (item: Recipe, index: number) => {
    const isBookmarked = bookmarkedRecipes.has(item.id);
    const isBookmarkLoading = bookmarkLoading.has(item.id);
    
    return (
      <TouchableOpacity
        key={item.id.toString()}
        className="relative rounded-2xl overflow-hidden bg-white mb-4"
        style={{ 
          width: CARD_WIDTH, 
          height: 200,
        }}
      >
        <ImageBackground
          source={{ uri: item.image }}
          className="flex-1 relative"
          imageStyle={{ borderRadius: 16 }}
        >
          
          {/* Bookmark button - positioned at top right */}
          <TouchableOpacity
            className="absolute top-3 right-3 w-9 h-9 rounded-full justify-center items-center z-10"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              
            }}
            onPress={() => toggleBookmark(item)}
            disabled={isBookmarkLoading}
          >
            {isBookmarkLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color="#ffffff"
              />
            )}
          </TouchableOpacity>

          <LinearGradient
          colors={['transparent', 'rgba(0,0,0,1)']}
          locations={[0, 1]}
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            bottom: 0,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        />

          {/* Recipe info - positioned at bottom */}
          <View 
            className="absolute bottom-0 left-0 right-0 rounded-b-2xl"
            
          >
            <View className="p-4 pt-5">
              <Text 
                className="text-white text-sm font-bold mb-1.5 leading-tight text-center"
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <View className="flex-row items-center justify-center">
                <Ionicons name="person-outline" size={12} color="#e5e7eb" />
                <Text 
                  className="text-gray-300 text-xs font-bold ml-1 text-center"

                >
                  {item.sourceName || "Spoonacular"}
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderRecipeGrid = () => {
    const rows = [];
    for (let i = 0; i < recipes.length; i += 2) {
      rows.push(
        <View key={i} className="flex-row justify-between mb-4">
          {renderRecipeCard(recipes[i], i)}
          {recipes[i + 1] && renderRecipeCard(recipes[i + 1], i + 1)}
        </View>
      );
    }
    return rows;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <Header
        title="Recipes"
        rightIcon={
          <TouchableOpacity onPress={fetchRandomRecipes}>
            <Ionicons name="refresh-outline" size={24} color="black" />
          </TouchableOpacity>
        }
        onRightIconPress={fetchRandomRecipes}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingTop: headerHeight + 20 
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pb-6">
          {loading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-500 mt-2 text-sm">Loading delicious recipes...</Text>
            </View>
          ) : (
            <View className="flex-1">
              {renderRecipeGrid()}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default RecipeScreen;