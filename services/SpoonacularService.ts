import axios from 'axios';

const API_KEY = process.env.EXPO_PUBLIC_API;
const BASE_URL = 'https://api.spoonacular.com';

export interface Recipe {
    id: number;
    title: string;
    image: string;
    sourceName: string;
}

export const searchRecipes = async (query: string): Promise<Recipe[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
            params: {
                query,
                number: 10,
                apiKey: API_KEY,
            },
        });
        return response.data.results;
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
            },
        });
        return response.data.recipes[0];
    } catch (error) {
        console.error('Error fetching random recipe:', error);
        throw error;
    }
}