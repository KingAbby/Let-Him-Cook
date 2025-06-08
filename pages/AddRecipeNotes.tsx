import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar, Platform } from "react-native";

import Header, { HEADER_HEIGHTS } from "../components/Header";
import { ImageUploader } from "../components/notesScreen/ImageUploader";
import { SimplifiedIngredientItem } from "../components/notesScreen/SimplifiedIngredientItem";
import { CookingStepItem } from "../components/notesScreen/CookingStepItem";
import { TimeInput } from "../components/notesScreen/TimeInput";
import { FormField } from "../components/notesScreen/FormField";
import { SectionHeader } from "../components/notesScreen/SectionHeader";
import { CategoryInput } from "../components/notesScreen/CategoryInput";

import { supabase } from "../utils/supabase";
import { useAuth } from "../context/AuthContext";
import { Entypo, Feather, FontAwesome6, Ionicons } from "@expo/vector-icons";

interface Ingredient {
  id: string;
  amount: string;
  unit: string;
  name: string;
}

interface CookingStep {
  id: string;
  step: number;
  description: string;
}

interface ValidationErrors {
  image?: string;
  recipeName?: string;
  description?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  ingredients?: string;
  cookingSteps?: string;
  category?: string;
}

const HEADER_HEIGHT = Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

const AddRecipeNotes = () => {
  const { user } = useAuth();

  // State untuk form
  const [imageUri, setImageUri] = useState<string>('');
  const [recipeName, setRecipeName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [prepTime, setPrepTime] = useState<string>('');
  const [cookTime, setCookTime] = useState<string>('');
  const [servings, setServings] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // State untuk ingredients dengan default
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', amount: '', unit: '', name: '' }
  ]);

  // State untuk cooking steps dengan default
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([
    { id: '1', step: 1, description: '' }
  ]);

  // Fungsi validasi
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!imageUri.trim()) newErrors.image = 'Image is required';
    if (!recipeName.trim()) newErrors.recipeName = 'Recipe name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!prepTime.trim()) newErrors.prepTime = 'Preparation time is required';
    if (!cookTime.trim()) newErrors.cookTime = 'Cooking time is required';
    if (!servings.trim()) newErrors.servings = 'Portion is required';
    if (!category.trim()) newErrors.category = 'Category is required';

    // Validasi ingredients - at least one complete ingredient
    const hasValidIngredient = ingredients.some(
      ing => ing.amount.trim() && ing.unit.trim() && ing.name.trim()
    );
    if (!hasValidIngredient) {
      newErrors.ingredients = 'Please add at least one complete ingredient (amount, unit, and name)';
    }

    // Validasi cooking steps - at least one step with description
    const hasValidStep = cookingSteps.some(step => step.description.trim());
    if (!hasValidStep) {
      newErrors.cookingSteps = 'Please add at least one cooking step';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: keyof ValidationErrors) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };
  // Functions untuk ingredients
  const addIngredient = () => {
    // Generate unique ID using timestamp to avoid duplicate keys
    const newId = Date.now().toString();
    setIngredients([...ingredients, { id: newId, amount: '', unit: '', name: '' }]);
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setIngredients(ingredients.map(ing =>
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
    }
  };
  // Functions untuk cooking steps
  const addCookingStep = () => {
    // Generate unique ID using timestamp to avoid duplicate keys
    const newId = Date.now().toString();
    const newStep = cookingSteps.length + 1;
    setCookingSteps([...cookingSteps, { id: newId, step: newStep, description: '' }]);
  };

  const updateCookingStep = (id: string, description: string) => {
    setCookingSteps(cookingSteps.map(step =>
      step.id === id ? { ...step, description } : step
    ));
  };

  const removeCookingStep = (id: string) => {
    if (cookingSteps.length > 1) {
      const filteredSteps = cookingSteps.filter(step => step.id !== id);
      // Update step numbers after removal
      const updatedSteps = filteredSteps.map((step, index) => ({
        ...step,
        step: index + 1
      }));
      setCookingSteps(updatedSteps);
    }
  };

  const uploadImageToSupabase = async (uri: string): Promise<string> => {
    try {
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate unique filename
      const fileName = `recipe_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadImageToSupabase:', error);
      throw error;
    }
  };

  const saveRecipe = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields correctly.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to save a recipe.');
      return;
    }

    setSaving(true);

    try {
      // Upload image first
      const imageUrl = await uploadImageToSupabase(imageUri);

      // Filter out empty ingredients and steps
      const validIngredients = ingredients.filter(
        ing => ing.amount.trim() && ing.unit.trim() && ing.name.trim()
      );

      const validSteps = cookingSteps.filter(step => step.description.trim());
      // Prepare recipe data
      const recipeData = {
        user_id: user.id,
        title: recipeName.trim(),
        description: description.trim(),
        prep_time: parseInt(prepTime) || 0,
        cook_time: parseInt(cookTime) || 0,
        servings: servings.trim(),
        category: category.trim(),
        image_url: imageUrl,
        ingredients: validIngredients,
        cooking_steps: validSteps,
        created_at: new Date().toISOString()
      };

      console.log('Saving recipe data:', recipeData);
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('myrecipes')
        .insert([recipeData])
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw new Error(`Database error: ${error.message || 'Unknown error'}`);
      }

      console.log('Recipe saved successfully:', data);

      // Reset form
      setImageUri('');
      setRecipeName('');
      setDescription('');
      setPrepTime('');
      setCookTime('');
      setServings('');
      setCategory('');
      setIngredients([{ id: '1', amount: '', unit: '', name: '' }]);
      setCookingSteps([{ id: '1', step: 1, description: '' }]);
      setErrors({});

      Alert.alert('Success', 'Your recipe has been saved successfully!');
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', error.message || 'Failed to save recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      {/* Header menggunakan komponen */}
      <Header title="Add Your Own Recipe Notes" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: 32
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-col gap-5 mx-4">
          {/* Image Upload menggunakan komponen */}
          <View className="flex-col gap-1">
            <ImageUploader imageUri={imageUri} onImageSelected={(uri) => {
              setImageUri(uri);
              if (uri) clearError('image');
            }} />
            {errors.image && (
              <Text className="text-sm text-red-600">
                Please select an image for your recipe
              </Text>
            )}
          </View>

          {/* Recipe Name */}
          <View className="flex-col gap-1">
            <FormField
              label="Recipe Name"
              value={recipeName}
              onChangeText={(text) => {
                setRecipeName(text);
                if (text.trim()) clearError('recipeName');
              }}
              placeholder="Example: Fried Rice"
            />
            {errors.recipeName && (
              <Text className="text-sm text-red-600">
                Recipe name is required
              </Text>
            )}
          </View>

          {/* Description */}
          <View className="flex-col gap-1">
            <FormField
              label="Description"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (text.trim()) clearError('description');
              }}
              placeholder="Tell us about your recipes"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {errors.description && (
              <Text className="text-sm text-red-600">
                Description is required
              </Text>
            )}
          </View>

          {/* Time inputs */}
          <View>
            {/* Prep & Cooking Time */}
            <View className="flex-row gap-4">
              {/* Prep Time */}
              <View className="flex-1">
                <TimeInput
                  label="Prep Time"
                  value={prepTime}
                  onChangeText={(text) => {
                    setPrepTime(text);
                    if (text.trim()) clearError('prepTime');
                  }}
                  placeholder="15"
                />
                {errors.prepTime && (
                  <Text className="text-sm text-red-600 mt-1">
                    Preparation time is required
                  </Text>
                )}
              </View>
              {/* Cooking Time */}
              <View className="flex-1">
                <TimeInput
                  label="Cooking Time"
                  value={cookTime}
                  onChangeText={(text) => {
                    setCookTime(text);
                    if (text.trim()) clearError('cookTime');
                  }}
                  placeholder="30"
                />
                {errors.cookTime && (
                  <Text className="text-sm text-red-600 mt-1">
                    Cooking time is required
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Servings */}
          <View className="flex-col gap-1">
            <FormField
              label="Portion"
              value={servings}
              onChangeText={(text) => {
                setServings(text);
                if (text.trim()) clearError('servings');
              }}
              placeholder="2-4 portion"
            />
            {errors.servings && (
              <Text className="text-sm text-red-600">
                Portion is required
              </Text>
            )}
          </View>

          {/* Ingredients Section & How to Cook Section */}
          <View className="flex-col gap-5">

            {/* Ingredients with simplified single input approach */}
            <View className="flex-col gap-5">
              <SectionHeader
                title="Ingredients"
                buttonText="Add Ingredient"
                onButtonPress={addIngredient}
              />

              {/* Beautiful ingredients container */}
              <View className="flex-col gap-4 bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
                <View className="flex-row gap-2 items-center">
                  <FontAwesome6 name="book" size={20} color="#3b82f6" />
                  <Text className="font-semibold text-sm text-blue-800">
                    Input your ingredients with amount, unit, and name
                  </Text>
                </View>

                {ingredients.map((ingredient, index) => (
                  <SimplifiedIngredientItem
                    key={ingredient.id}
                    ingredient={ingredient}
                    index={index}
                    onUpdate={(id, field, value) => {
                      updateIngredient(id, field, value);
                      // Clear ingredient error if at least one complete ingredient exists
                      const updatedIngredients = ingredients.map(ing =>
                        ing.id === id ? { ...ing, [field]: value } : ing
                      );
                      const hasValidIngredient = updatedIngredients.some(
                        ing => ing.amount.trim() && ing.unit.trim() && ing.name.trim()
                      );
                      if (hasValidIngredient) clearError('ingredients');
                    }}
                    onRemove={removeIngredient}
                    showRemoveButton={ingredients.length > 1}
                  />
                ))}

                {errors.ingredients && (
                  <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <Text className="text-sm font-medium text-red-600">
                      Please add at least one complete ingredient (amount, unit, and name)
                    </Text>
                  </View>
                )}

              </View>
            </View>

            {/* Cooking Steps with enhanced blue design */}
            <View className="flex-col gap-5">
              <SectionHeader
                title="How to Cook"
                buttonText="Add Step"
                onButtonPress={addCookingStep}
              />
              {/* Beautiful cooking steps container */}
              <View className="flex-col gap-4 bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
                <View className="flex-row gap-2 items-center">
                  <Entypo name="add-to-list" size={20} color="#3b82f6" />
                  <Text className="font-semibold text-sm text-blue-800">
                    Detailed step-by-step cooking instructions
                  </Text>
                </View>

                {cookingSteps.map((step) => (
                  <CookingStepItem
                    key={step.id}
                    step={step}
                    onUpdate={(id, description) => {
                      updateCookingStep(id, description);
                      // Clear cooking steps error if at least one step has description
                      const updatedSteps = cookingSteps.map(s =>
                        s.id === id ? { ...s, description } : s
                      );
                      const hasValidStep = updatedSteps.some(s => s.description.trim());
                      if (hasValidStep) clearError('cookingSteps');
                    }}
                    onRemove={removeCookingStep}
                    showRemoveButton={cookingSteps.length > 1}
                  />
                ))}
                {errors.cookingSteps && (
                  <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <Text className="text-sm font-medium text-red-600">
                      Please add at least one cooking step
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Additional Information with enhanced styling */}
          <View className="flex-col gap-5">
            {/* Enhanced section title */}
            <View className="flex-row gap-2 items-center ">
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text className="text-lg font-bold text-blue-800">
                Additional Information
              </Text>
              <View className="h-0.5 flex-1 ml-3 bg-blue-200" />
            </View>

            {/* Category with enhanced styling */}
            <View className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
              <View className="flex-col gap-1">
                <CategoryInput
                  label="Category"
                  value={category}
                  onChangeText={(text) => {
                    setCategory(text);
                    if (text.trim()) clearError('category');
                  }}
                />
                {errors.category && (
                  <View className="bg-red-50 border border-red-200 rounded-lg p-2">
                    <Text className="text-sm font-medium text-red-600">
                      Category is required
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Enhanced save button */}
            <View className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
              <TouchableOpacity
                onPress={saveRecipe}
                disabled={saving}
                className={`rounded-xl py-4 items-center shadow-lg ${saving ? 'bg-gray-400' : 'bg-blue-500'}`}
              >
                {saving ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="font-bold text-lg text-white">
                      Saving Your Recipe...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Feather name="check-circle" size={20} color="white" />
                    <Text className="font-bold text-lg text-white">
                      Save Recipe
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddRecipeNotes;