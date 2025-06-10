import axios from 'axios';
import { Alert } from 'react-native';

const API_KEY = process.env.EXPO_PUBLIC_API;
const BASE_URL = 'https://api.spoonacular.com';

const handleApiError = <T>(error: any, customMessage?: string, returnEmptyArray: boolean = false, defaultValue?: T): T[] | T | null => {
    // Check for rate limit error codes (402 Payment Required is often used for API quota exceeded)
    if (error.response) {
        const status = error.response.status;

        // Rate limit errors typically return 402 or 429 status codes
        if (status === 402 || status === 429) {
            Alert.alert(
                "API Limit Reached",
                "Sorry, the daily limit for recipe requests has been reached. Please try again tomorrow.",
                [{ text: "OK" }]
            );
        } else {
            // Handle other specific API errors
            Alert.alert(
                "Error",
                customMessage || "Failed to load recipes. Please try again later.",
                [{ text: "OK" }]
            );
        }
    } else if (error.request) {
        // Network error
        Alert.alert(
            "Network Error",
            "Unable to connect to the recipe service. Please check your internet connection.",
            [{ text: "OK" }]
        );
    } else {
        // Something else
        Alert.alert(
            "Error",
            customMessage || "An unexpected error occurred. Please try again.",
            [{ text: "OK" }]
        );
    }

    // Return appropriate value based on the function type
    return returnEmptyArray ? [] : (defaultValue ?? null);
};

export interface Recipe {
    id: number;
    title: string;
    image: string;
    servings: number;
    readyInMinutes: number;
    cookingMinutes?: number;
    preparationMinutes?: number;
}

export interface Amount {
    metric: {
        unit: string;
        value: number;
    };
    us: {
        unit: string;
        value: number;
    };
}

export interface Ingredient {
    amount: Amount;
    name: string;
}

export interface Equipment {
    id: number;
    name: string;
    temperature?: {
        number: number;
        unit: string;
    };
}

export interface StepIngredient {
    id: number;
    name: string;
}

export interface Step {
    number: number;
    step: string;
    equipment: Equipment[];
    ingredients: StepIngredient[];
}

export interface Instruction {
    name: string;
    steps: Step[];
}

export const searchRecipes = async (query: string): Promise<Recipe[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
            params: {
                query,
                number: 10,
                apiKey: API_KEY,
                addRecipeInformation: true,
                fillIngredients: false,
            },
        });
        const recipes = response.data.results.map(recipe => ({
            ...recipe,
            servings: recipe.servings,
            readyInMinutes: recipe.readyInMinutes || 30,
            cookingMinutes: recipe.cookingMinutes,
            preparationMinutes: recipe.preparationMinutes,
        }));

        return recipes;
    } catch (error) {
        return handleApiError<Recipe>(error, "Failed to search for recipes. Please try again later.", true) as Recipe[];
    }
};

export const getRandomRecipe = async (): Promise<Recipe> => {
    try {
        const response = await axios.get(`${BASE_URL}/recipes/random`, {
            params: {
                apiKey: API_KEY,
                number: 1,
                addRecipeInformation: true,
            },
        });

        const recipe = response.data.recipes[0];
        recipe.servings = recipe.servings;
        recipe.readyInMinutes = recipe.readyInMinutes;

        recipe.cookingMinutes = recipe.cookingMinutes;
        recipe.preparationMinutes = recipe.preparationMinutes;

        console.log("Processed recipe:", {
            title: recipe.title,
            readyInMinutes: recipe.readyInMinutes,
            cookingMinutes: recipe.cookingMinutes,
            preparationMinutes: recipe.preparationMinutes
        });

        return recipe;
    } catch (error) {
        // Create a default empty recipe
        const defaultRecipe: Recipe = {
            id: 0,
            title: "Recipe Not Available",
            image: "",
            servings: 0,
            readyInMinutes: 0,
            cookingMinutes: 0,
            preparationMinutes: 0
        };
        return handleApiError<Recipe>(error, "Failed to load recipe. Please try again later.", false, defaultRecipe) as Recipe;
    }
}

/**
 * Gets the ingredients for a specific recipe by ID
 * @param recipeId The ID of the recipe
 * @returns Array of ingredients with amounts
 */
export const getRecipeIngredients = async (recipeId: number): Promise<Ingredient[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/recipes/${recipeId}/ingredientWidget.json`, {
            params: {
                apiKey: API_KEY,
            },
        });

        return response.data.ingredients;
    } catch (error) {
        return handleApiError<Ingredient>(error, "Failed to load recipe ingredients. Please try again later.", true) as Ingredient[];
    }
}

export const getRecipeInstructions = async (recipeId: number): Promise<Instruction[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/recipes/${recipeId}/analyzedInstructions`, {
            params: {
                apiKey: API_KEY,
            },
        });

        return response.data;
    } catch (error) {
        return handleApiError<Instruction>(error, "Failed to load recipe instructions. Please try again later.", true) as Instruction[];
    }
}

