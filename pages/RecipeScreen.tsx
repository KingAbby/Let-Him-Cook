import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { getRandomRecipe, Recipe } from "../services/SpoonacularService";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";

const HEADER_HEIGHT = Platform.OS === "ios" ? 150 : 120;

const RecipeScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  const fetchRandomRecipes = async () => {
    try {
      setLoading(true);
      // Create an array of promises to fetch multiple random recipes
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
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 py-6">
          {loading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <View className="space-y-4">
              {recipes.map((item) => (
                <TouchableOpacity
                  key={item.id.toString()}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <View className="flex-row">
                    <Image source={{ uri: item.image }} className="w-24 h-24" />
                    <View className="flex-1 p-3 justify-center">
                      <Text className="text-gray-800 text-lg font-medium mb-1">
                        {item.title}
                      </Text>
                      <View className="flex-row items-center">
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color="#6b7280"
                        />
                        <Text className="text-gray-500 ml-1 text-sm">
                          30 min
                        </Text>
                        <View className="bg-blue-100 rounded-full px-2 py-1 ml-2">
                          <Text className="text-blue-600 text-xs font-medium">
                            Easy
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default RecipeScreen;
