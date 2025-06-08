import axios from 'axios';

const API_KEY = process.env.EXPO_PUBLIC_API;
const BASE_URL = 'https://api.spoonacular.com';

export interface Recipe {
    id: number;
    title: string;
    image: string;
    servings: number;
    readyInMinutes: number;
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

        // Ensure all recipes have servings and readyInMinutes
        const recipes = response.data.results.map(recipe => ({
            ...recipe,
            servings: recipe.servings || 4,
            readyInMinutes: recipe.readyInMinutes || 30
        }));

        return recipes;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        throw error;
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

        // Make sure recipe has servings and readyInMinutes information
        const recipe = response.data.recipes[0];
        recipe.servings = recipe.servings || 4;
        recipe.readyInMinutes = recipe.readyInMinutes || 30;

        return recipe;
    } catch (error) {
        console.error('Error fetching random recipe:', error);
        throw error;
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
        console.error(`Error fetching ingredients for recipe ${recipeId}:`, error);
        throw error;
    }
}

/**
 * Gets the step-by-step instructions for a specific recipe
 * @param recipeId The ID of the recipe
 * @returns Array of instruction objects with steps
 */
export const getRecipeInstructions = async (recipeId: number): Promise<Instruction[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/recipes/${recipeId}/analyzedInstructions`, {
            params: {
                apiKey: API_KEY,
            },
        });

        return response.data;
    } catch (error) {
        console.error(`Error fetching instructions for recipe ${recipeId}:`, error);
        throw error;
    }
}

