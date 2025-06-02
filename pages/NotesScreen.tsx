import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Header from "../components/Header";
import { ImageUploader } from "../components/notesScreen/ImageUploader";
import { IngredientItem } from "../components/notesScreen/IngredientItem";
import { CookingStepItem } from "../components/notesScreen/CookingStepItem";
import { TimeInput } from "../components/notesScreen/TimeInput";
import { FormField } from "../components/notesScreen/FormField";
import { SectionHeader } from "../components/notesScreen/SectionHeader";
import { CategoryInput } from "../components/notesScreen/CategoryInput";
import { supabase } from "../utils/supabase";
import { useAuth } from "../context/AuthContext";

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
  recipeName: boolean;
  description: boolean;
  prepTime: boolean;
  cookTime: boolean;
  servings: boolean;
  category: boolean;
  image: boolean;
  ingredients: boolean;
  cookingSteps: boolean;
}

const HEADER_HEIGHT = Platform.OS === "ios" ? 150 : 120;

const NotesScreen: React.FC = () => {
  const { user } = useAuth();
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [category, setCategory] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // State untuk error validation
  const [errors, setErrors] = useState<ValidationErrors>({
    recipeName: false,
    description: false,
    prepTime: false,
    cookTime: false,
    servings: false,
    category: false,
    image: false,
    ingredients: false,
    cookingSteps: false,
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: "1", amount: "", unit: "", name: "" },
    { id: "2", amount: "", unit: "", name: "" },
    { id: "3", amount: "", unit: "", name: "" },
  ]);
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([
    { id: "1", step: 1, description: "" },
    { id: "2", step: 2, description: "" },
    { id: "3", step: 3, description: "" },
  ]);

  const addIngredient = () => {
    const newId = (ingredients.length + 1).toString();
    setIngredients([
      ...ingredients,
      { id: newId, amount: "", unit: "", name: "" },
    ]);
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((ing) => ing.id !== id));
    }
  };

  const updateIngredient = (
    id: string,
    field: keyof Ingredient,
    value: string
  ) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    );
  };

  const addCookingStep = () => {
    const newId = (cookingSteps.length + 1).toString();
    setCookingSteps([
      ...cookingSteps,
      { id: newId, step: cookingSteps.length + 1, description: "" },
    ]);
  };

  const removeCookingStep = (id: string) => {
    if (cookingSteps.length > 1) {
      const filteredSteps = cookingSteps.filter((step) => step.id !== id);
      // Reorder step numbers
      const reorderedSteps = filteredSteps.map((step, index) => ({
        ...step,
        step: index + 1,
      }));
      setCookingSteps(reorderedSteps);
    }
  };

  const updateCookingStep = (id: string, description: string) => {
    setCookingSteps(
      cookingSteps.map((step) =>
        step.id === id ? { ...step, description } : step
      )
    );
  };

  const uploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      // Create FormData for React Native
      const formData = new FormData();

      // Get file extension
      const fileExtension = imageUri.split(".").pop() || "jpg";
      const fileName = `recipe_${Date.now()}.${fileExtension}`;

      // Append file to FormData
      formData.append("file", {
        uri: imageUri,
        type: `image/${fileExtension}`,
        name: fileName,
      } as any);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("recipe-images")
        .upload(fileName, formData, {
          contentType: `image/${fileExtension}`,
        });

      if (error) {
        console.error("Supabase storage error:", error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl ?? null;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      recipeName: !recipeName.trim(),
      description: !description.trim(),
      prepTime: !prepTime.trim(),
      cookTime: !cookTime.trim(),
      servings: !servings.trim(),
      category: !category.trim(),
      image: !imageUri,
      ingredients: false,
      cookingSteps: false,
    };

    // Check if at least one ingredient has all fields filled
    const validIngredients = ingredients.filter(
      (ing) => ing.amount.trim() && ing.unit.trim() && ing.name.trim()
    );
    newErrors.ingredients = validIngredients.length === 0;

    // Check if at least one cooking step is filled
    const validSteps = cookingSteps.filter((step) => step.description.trim());
    newErrors.cookingSteps = validSteps.length === 0;

    setErrors(newErrors);

    // Check if any error exists
    const hasErrors = Object.values(newErrors).some(error => error);
    
    if (hasErrors) {
      Alert.alert("Error", "Please fill in all required fields");
      return false;
    }

    return true;
  };

  // Helper function untuk clear error saat user mulai mengetik
  const clearError = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const saveRecipe = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to save a recipe");
      return;
    }

    setSaving(true);

    try {
      // Upload image if exists
      let imageUrl: string | null = null;
      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
      }

      // Filter out empty ingredients and steps
      const validIngredients = ingredients.filter(
        (ing) => ing.amount.trim() && ing.unit.trim() && ing.name.trim()
      );

      const validSteps = cookingSteps.filter((step) => step.description.trim());

      // Prepare data for database
      const recipeData = {
        title: recipeName.trim(),
        description: description.trim() || null,
        prep_time: prepTime ? parseInt(prepTime) : null,
        cook_time: cookTime ? parseInt(cookTime) : null,
        servings: servings.trim() || null,
        category: category.trim() || null,
        image_url: imageUrl,
        ingredients: validIngredients,
        cooking_steps: validSteps,
        user_id: user.id,
      };

      // Insert recipe into database
      const { data, error } = await supabase
        .from("myrecipes")
        .insert([recipeData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Recipe saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setRecipeName("");
            setDescription("");
            setPrepTime("");
            setCookTime("");
            setServings("");
            setCategory("");
            setImageUri(null);
            setIngredients([
              { id: "1", amount: "", unit: "", name: "" },
              { id: "2", amount: "", unit: "", name: "" },
              { id: "3", amount: "", unit: "", name: "" },
            ]);
            setCookingSteps([
              { id: "1", step: 1, description: "" },
              { id: "2", step: 2, description: "" },
              { id: "3", step: 3, description: "" },
            ]);
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Failed to save recipe. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      {/* Header menggunakan komponen */}
      <Header title="Add Your Own Recipe" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Upload menggunakan komponen */}
        <ImageUploader imageUri={imageUri} onImageSelected={(uri) => {
            setImageUri(uri);
            if (uri) clearError('image');
          }} />
          {errors.image && (
          <Text className="text-red-500 text-sm mx-4 mt-1">
            Please select an image for your recipe
          </Text>
        )}

        {/* Form Fields menggunakan komponen */}
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
          <Text className="text-red-500 text-sm mx-4 mt-1">
            Recipe name is required
          </Text>
        )}

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
          <Text className="text-red-500 text-sm mx-4 mt-1">
            Description is required
          </Text>
        )}

        {/* Time Inputs menggunakan komponen */}
        <View className="mx-4 mt-4 flex-row">
          <View className="flex-1">
            <TimeInput
              label="Preparation Time"
              value={prepTime}
              onChangeText={(text) => {
                setPrepTime(text);
                if (text.trim()) clearError('prepTime');
              }}
              placeholder="15"
            />
            {errors.prepTime && (
              <Text className="text-red-500 text-sm mt-1">
                Preparation time is required
              </Text>
            )}
          </View>
          <View className="w-4" />
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
              <Text className="text-red-500 text-sm mt-1">
                Cooking time is required
              </Text>
            )}
          </View>
        </View>

        {/* Servings */}
        <View className="mx-4 mt-4">
          <Text className="text-gray-700 font-medium">Portion</Text>
          <FormField
            label=""
            value={servings}
            onChangeText={(text) => {
              setServings(text);
              if (text.trim()) clearError('servings');
            }}
            placeholder="2-4 portion"
            containerStyle="mt-0"
          />
          {errors.servings && (
            <Text className="text-red-500 text-sm mt-1">
              Portion is required
            </Text>
          )}
        </View>

        {/* Ingredients menggunakan komponen */}
        <View className="mx-4 mt-6">
          <SectionHeader
            title="Ingredients"
            buttonText="Add More Ingredients"
            onButtonPress={addIngredient}
          />

          {ingredients.map((ingredient) => (
            <IngredientItem
              key={ingredient.id}
              ingredient={ingredient}
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
            <Text className="text-red-500 text-sm mt-2">
              Please add at least one complete ingredient (amount, unit, and name)
            </Text>
          )}
        </View>

        {/* Cooking Steps menggunakan komponen */}
        <View className="mx-4 mt-6">
          <SectionHeader
            title="How to Cook"
            buttonText="Add More Steps"
            onButtonPress={addCookingStep}
          />

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
            <Text className="text-red-500 text-sm mt-2">
              Please add at least one cooking step
            </Text>
          )}
        </View>

        {/* Additional Information */}
        <View className="mx-4 mt-6 mb-8">
          <Text className="text-lg font-semibold mb-4">
            Additional Information
          </Text>

          {/* Category */}
          <View className="mb-4">
            <CategoryInput
              label="Category"
              value={category}
              onChangeText={(text) => {
                setCategory(text);
                if (text.trim()) clearError('category');
              }}
              
            />
            {errors.category && (
              <Text className="text-red-500 text-sm mt-1">
                Category is required
              </Text>
            )}
          </View>

          {/* Save button moved to bottom */}
          <View className="mx-4 mt-6 mb-8">
            <TouchableOpacity
              onPress={saveRecipe}
              disabled={saving}
              className={`${saving ? "bg-gray-400" : "bg-green-600"
                } rounded-lg py-4 items-center`}
            >
              {saving ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-white font-medium text-lg ml-2">
                    Saving...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-medium text-lg">
                  Save Your Recipe
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotesScreen;
