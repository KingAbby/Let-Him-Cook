import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
	StatusBar,
	Platform,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { useNavigation, useRoute } from "@react-navigation/native";

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

interface RouteParams {
	recipeId: string;
}

const HEADER_HEIGHT =
	Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

const EditRecipeNotes = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const { recipeId } = route.params as RouteParams;
	const { user } = useAuth();

	// State for form
	const [imageUri, setImageUri] = useState<string>("");
	const [imageUrl, setImageUrl] = useState<string>("");
	const [recipeName, setRecipeName] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [prepTime, setPrepTime] = useState<string>("");
	const [cookTime, setCookTime] = useState<string>("");
	const [servings, setServings] = useState<string>("");
	const [category, setCategory] = useState<string>("");
	const [saving, setSaving] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [errors, setErrors] = useState<ValidationErrors>({});

	// State for ingredients with default
	const [ingredients, setIngredients] = useState<Ingredient[]>([
		{ id: "1", amount: "", unit: "", name: "" },
	]);

	// State for cooking steps with default
	const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([
		{ id: "1", step: 1, description: "" },
	]);

	// Fetch recipe data
	useEffect(() => {
		fetchRecipeDetails();
	}, [recipeId]);

	const fetchRecipeDetails = async () => {
		if (!recipeId) {
			Alert.alert("Error", "Recipe ID not provided");
			navigation.goBack();
			return;
		}

		try {
			setLoading(true);

			// Fetch recipe data from supabase
			const { data, error } = await supabase
				.from("myrecipes")
				.select("*")
				.eq("id", recipeId)
				.single();

			if (error) {
				throw error;
			}

			if (!data) {
				Alert.alert("Error", "Recipe not found");
				navigation.goBack();
				return;
			}

			// Populate form with recipe data
			setRecipeName(data.title || "");
			setDescription(data.description || "");
			setPrepTime(data.prep_time ? data.prep_time.toString() : "");
			setCookTime(data.cook_time ? data.cook_time.toString() : "");
			setServings(data.servings || "");
			setCategory(data.category || "");
			setImageUrl(data.image_url || "");

			// Populate ingredients
			if (data.ingredients && data.ingredients.length > 0) {
				setIngredients(data.ingredients);
			}

			// Populate cooking steps
			if (data.cooking_steps && data.cooking_steps.length > 0) {
				setCookingSteps(data.cooking_steps);
			}
		} catch (error) {
			console.error("Error fetching recipe:", error);
			Alert.alert("Error", "Failed to load recipe details");
			navigation.goBack();
		} finally {
			setLoading(false);
		}
	};

	// Validation function
	const validateForm = (): boolean => {
		const newErrors: ValidationErrors = {};

		if (!recipeName.trim()) newErrors.recipeName = "Recipe name is required";
		if (!description.trim()) newErrors.description = "Description is required";
		if (!prepTime.trim()) newErrors.prepTime = "Preparation time is required";
		if (!cookTime.trim()) newErrors.cookTime = "Cooking time is required";
		if (!servings.trim()) newErrors.servings = "Portion is required";
		if (!category.trim()) newErrors.category = "Category is required";

		// Only require image if no existing image URL and no new image selected
		if (!imageUrl && !imageUri.trim()) {
			newErrors.image = "Image is required";
		}

		// Validate ingredients - at least one complete ingredient
		const hasValidIngredient = ingredients.some(
			(ing) => ing.amount.trim() && ing.unit.trim() && ing.name.trim()
		);
		if (!hasValidIngredient) {
			newErrors.ingredients =
				"Please add at least one complete ingredient (amount, unit, and name)";
		}

		// Validate cooking steps - at least one step with description
		const hasValidStep = cookingSteps.some((step) => step.description.trim());
		if (!hasValidStep) {
			newErrors.cookingSteps = "Please add at least one cooking step";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const clearError = (field: keyof ValidationErrors) => {
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[field];
			return newErrors;
		});
	};

	// Ingredient functions
	const addIngredient = () => {
		const newId = Date.now().toString();
		setIngredients([
			...ingredients,
			{ id: newId, amount: "", unit: "", name: "" },
		]);
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

	const removeIngredient = (id: string) => {
		if (ingredients.length > 1) {
			setIngredients(ingredients.filter((ing) => ing.id !== id));
		}
	};

	// Cooking step functions
	const addCookingStep = () => {
		const newId = Date.now().toString();
		const newStep = cookingSteps.length + 1;
		setCookingSteps([
			...cookingSteps,
			{ id: newId, step: newStep, description: "" },
		]);
	};

	const updateCookingStep = (id: string, description: string) => {
		setCookingSteps(
			cookingSteps.map((step) =>
				step.id === id ? { ...step, description } : step
			)
		);
	};

	const removeCookingStep = (id: string) => {
		if (cookingSteps.length > 1) {
			const filteredSteps = cookingSteps.filter((step) => step.id !== id);
			// Update step numbers after removal
			const updatedSteps = filteredSteps.map((step, index) => ({
				...step,
				step: index + 1,
			}));
			setCookingSteps(updatedSteps);
		}
	};

	const uploadImageToSupabase = async (uri: string): Promise<string> => {
		try {
			console.log("Starting image upload process...");
			console.log("Image URI:", uri);

			// Read file as base64
			const base64 = await FileSystem.readAsStringAsync(uri, {
				encoding: FileSystem.EncodingType.Base64,
			});

			console.log("Base64 read successfully, length:", base64.length);

			// Convert base64 to ArrayBuffer
			const byteCharacters = atob(base64);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);

			// Generate a unique file name
			const fileName = `recipe-image-${Date.now()}.jpg`;
			const filePath = `recipe-images/${user?.id}/${fileName}`;

			// Upload to Supabase Storage
			const { error: uploadError } = await supabase.storage
				.from("recipe-images")
				.upload(filePath, byteArray, {
					contentType: "image/jpeg",
				});

			if (uploadError) {
				console.error("Image upload error:", uploadError);
				throw new Error(`Upload failed: ${uploadError.message}`);
			}

			// Get the public URL
			const { data: urlData } = supabase.storage
				.from("recipe-images")
				.getPublicUrl(filePath);

			console.log("Image uploaded. Public URL:", urlData.publicUrl);
			return urlData.publicUrl;
		} catch (error) {
			console.error("Error in uploadImageToSupabase:", error);
			throw error;
		}
	};

	const updateRecipe = async () => {
		if (!validateForm()) {
			Alert.alert("Error", "Please fill in all required fields correctly.");
			return;
		}

		if (!user) {
			Alert.alert("Error", "You must be logged in to update a recipe.");
			return;
		}

		setSaving(true);

		try {
			console.log("Starting update recipe process...");

			// If new image was selected, upload it
			let finalImageUrl = imageUrl; // Default to existing image
			if (imageUri && imageUri !== imageUrl) {
				const fileInfo = await FileSystem.getInfoAsync(imageUri);
				if (fileInfo.exists) {
					finalImageUrl = await uploadImageToSupabase(imageUri);
					console.log("New image uploaded successfully:", finalImageUrl);
				}
			}

			// Filter out empty ingredients and steps
			const validIngredients = ingredients.filter(
				(ing) => ing.amount.trim() && ing.unit.trim() && ing.name.trim()
			);

			const validSteps = cookingSteps.filter((step) => step.description.trim());

			// Prepare recipe data
			const recipeData = {
				title: recipeName.trim(),
				description: description.trim(),
				prep_time: parseInt(prepTime) || 0,
				cook_time: parseInt(cookTime) || 0,
				servings: servings.trim(),
				category: category.trim(),
				image_url: finalImageUrl,
				ingredients: validIngredients,
				cooking_steps: validSteps,
				updated_at: new Date().toISOString(),
			};

			console.log("Updating recipe data:", recipeData);

			// Update in Supabase
			const { data, error } = await supabase
				.from("myrecipes")
				.update(recipeData)
				.eq("id", recipeId)
				.select();

			if (error) {
				console.error("Supabase error details:", error);
				throw new Error(`Database error: ${error.message || "Unknown error"}`);
			}

			console.log("Recipe updated successfully:", data);

			// Show success alert and navigate back
			Alert.alert("Success", "Your recipe has been updated successfully!", [
				{
					text: "OK",
					onPress: () => navigation.goBack(),
				},
			]);
		} catch (error: any) {
			console.error("Error updating recipe:", error);

			let errorMessage = "Failed to update recipe. Please try again.";

			if (error.message && error.message.includes("image")) {
				errorMessage =
					"Failed to upload image. Please check your internet connection and try again.";
			} else if (error.message && error.message.includes("Database")) {
				errorMessage = "Failed to save recipe to database. Please try again.";
			}

			Alert.alert("Error", errorMessage);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<View className='flex-1 bg-gray-50 justify-center items-center'>
				<StatusBar
					translucent
					backgroundColor='transparent'
					barStyle='dark-content'
				/>
				<Header
					title='Edit Recipe'
					showBackButton={true}
					showBookmark={false}
				/>
				<ActivityIndicator
					size='large'
					color='#3B82F6'
				/>
				<Text className='text-gray-600 mt-4'>Loading recipe...</Text>
			</View>
		);
	}

	return (
		<View className='flex-1 bg-gray-50'>
			<StatusBar
				translucent
				backgroundColor='transparent'
				barStyle='dark-content'
			/>
			<Header
				title='Edit Recipe'
				showBackButton={true}
				showBookmark={false}
			/>
			<ScrollView
				className='flex-1'
				contentContainerStyle={{
					paddingTop: HEADER_HEIGHT,
					paddingBottom: 32,
				}}
				showsVerticalScrollIndicator={false}
			>
				<View className='flex-col gap-5 mx-4'>
					{/* Image Upload */}
					<View className='flex-col gap-1'>
						<ImageUploader
							imageUri={imageUri || imageUrl}
							onImageSelected={(uri) => {
								setImageUri(uri);
								if (uri) clearError("image");
							}}
						/>
						{errors.image && (
							<Text className='text-sm text-red-600'>
								Please select an image for your recipe
							</Text>
						)}
					</View>

					{/* Recipe Name */}
					<View className='flex-col gap-1'>
						<FormField
							label='Recipe Name'
							value={recipeName}
							onChangeText={(text) => {
								setRecipeName(text);
								if (text.trim()) clearError("recipeName");
							}}
							placeholder='Example: Fried Rice'
						/>
						{errors.recipeName && (
							<Text className='text-sm text-red-600'>
								Recipe name is required
							</Text>
						)}
					</View>

					{/* Description */}
					<View className='flex-col gap-1'>
						<FormField
							label='Description'
							value={description}
							onChangeText={(text) => {
								setDescription(text);
								if (text.trim()) clearError("description");
							}}
							placeholder='Tell us about your recipes'
							multiline
							numberOfLines={3}
							textAlignVertical='top'
						/>
						{errors.description && (
							<Text className='text-sm text-red-600'>
								Description is required
							</Text>
						)}
					</View>

					{/* Time inputs */}
					<View>
						{/* Prep & Cooking Time */}
						<View className='flex-row gap-4'>
							{/* Prep Time */}
							<View className='flex-1'>
								<TimeInput
									label='Prep Time'
									value={prepTime}
									onChangeText={(text) => {
										setPrepTime(text);
										if (text.trim()) clearError("prepTime");
									}}
									placeholder='15'
								/>
								{errors.prepTime && (
									<Text className='text-sm text-red-600 mt-1'>
										Preparation time is required
									</Text>
								)}
							</View>
							{/* Cooking Time */}
							<View className='flex-1'>
								<TimeInput
									label='Cooking Time'
									value={cookTime}
									onChangeText={(text) => {
										setCookTime(text);
										if (text.trim()) clearError("cookTime");
									}}
									placeholder='30'
								/>
								{errors.cookTime && (
									<Text className='text-sm text-red-600 mt-1'>
										Cooking time is required
									</Text>
								)}
							</View>
						</View>
					</View>

					{/* Servings */}
					<View className='flex-col gap-1'>
						<FormField
							label='Portion'
							value={servings}
							onChangeText={(text) => {
								setServings(text);
								if (text.trim()) clearError("servings");
							}}
							placeholder='2-4 portion'
						/>
						{errors.servings && (
							<Text className='text-sm text-red-600'>Portion is required</Text>
						)}
					</View>

					{/* Ingredients Section & How to Cook Section */}
					<View className='flex-col gap-5'>
						{/* Ingredients */}
						<View className='flex-col gap-5'>
							<SectionHeader
								title='Ingredients'
								buttonText='Add Ingredient'
								onButtonPress={addIngredient}
							/>

							{/* Ingredients container */}
							<View className='flex-col gap-4 bg-white rounded-2xl p-4 shadow-lg border border-blue-100'>
								<View className='flex-row gap-2 items-center'>
									<FontAwesome6
										name='book'
										size={20}
										color='#3b82f6'
									/>
									<Text className='font-semibold text-sm text-blue-800'>
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
											const updatedIngredients = ingredients.map((ing) =>
												ing.id === id ? { ...ing, [field]: value } : ing
											);
											const hasValidIngredient = updatedIngredients.some(
												(ing) =>
													ing.amount.trim() &&
													ing.unit.trim() &&
													ing.name.trim()
											);
											if (hasValidIngredient) clearError("ingredients");
										}}
										onRemove={removeIngredient}
										showRemoveButton={ingredients.length > 1}
									/>
								))}

								{errors.ingredients && (
									<View className='bg-red-50 border border-red-200 rounded-lg p-3'>
										<Text className='text-sm font-medium text-red-600'>
											Please add at least one complete ingredient (amount, unit,
											and name)
										</Text>
									</View>
								)}
							</View>
						</View>

						{/* Cooking Steps */}
						<View className='flex-col gap-5'>
							<SectionHeader
								title='How to Cook'
								buttonText='Add Step'
								onButtonPress={addCookingStep}
							/>
							{/* Cooking steps container */}
							<View className='flex-col gap-4 bg-white rounded-2xl p-4 shadow-lg border border-blue-100'>
								<View className='flex-row gap-2 items-center'>
									<Entypo
										name='add-to-list'
										size={20}
										color='#3b82f6'
									/>
									<Text className='font-semibold text-sm text-blue-800'>
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
											const updatedSteps = cookingSteps.map((s) =>
												s.id === id ? { ...s, description } : s
											);
											const hasValidStep = updatedSteps.some((s) =>
												s.description.trim()
											);
											if (hasValidStep) clearError("cookingSteps");
										}}
										onRemove={removeCookingStep}
										showRemoveButton={cookingSteps.length > 1}
									/>
								))}
								{errors.cookingSteps && (
									<View className='bg-red-50 border border-red-200 rounded-lg p-3'>
										<Text className='text-sm font-medium text-red-600'>
											Please add at least one cooking step
										</Text>
									</View>
								)}
							</View>
						</View>
					</View>

					{/* Additional Information */}
					<View className='flex-col gap-5'>
						{/* Section title */}
						<View className='flex-row gap-2 items-center'>
							<Ionicons
								name='information-circle'
								size={20}
								color='#3b82f6'
							/>
							<Text className='text-lg font-bold text-blue-800'>
								Additional Information
							</Text>
							<View className='h-0.5 flex-1 ml-3 bg-blue-200' />
						</View>

						{/* Category */}
						<View className='bg-white rounded-2xl p-4 shadow-lg border border-blue-100'>
							<View className='flex-col gap-1'>
								<CategoryInput
									label='Category'
									value={category}
									onChangeText={(text) => {
										setCategory(text);
										if (text.trim()) clearError("category");
									}}
								/>
								{errors.category && (
									<View className='bg-red-50 border border-red-200 rounded-lg p-2'>
										<Text className='text-sm font-medium text-red-600'>
											Category is required
										</Text>
									</View>
								)}
							</View>
						</View>

						{/* Update button */}
						<View className='bg-white rounded-2xl p-4 shadow-lg border border-blue-100'>
							<TouchableOpacity
								onPress={updateRecipe}
								disabled={saving}
								className={`rounded-xl py-4 items-center shadow-lg ${
									saving ? "bg-gray-400" : "bg-green-500"
								}`}
							>
								{saving ? (
									<View className='flex-row items-center gap-2'>
										<ActivityIndicator
											size='small'
											color='white'
										/>
										<Text className='font-bold text-lg text-white'>
											Updating Recipe...
										</Text>
									</View>
								) : (
									<View className='flex-row items-center gap-2'>
										<Feather
											name='check-circle'
											size={20}
											color='white'
										/>
										<Text className='font-bold text-lg text-white'>
											Update Recipe
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

export default EditRecipeNotes;
