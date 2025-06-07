import { supabase } from '../utils/supabase';

export interface BookmarkedRecipe {
  id: string;
  user_id: string;
  recipe_id: number;
  recipe_title: string;
  recipe_image: string;
  recipe_source: string;
  created_at: string;
}

export const BookmarkService = {
  // Menambah bookmark
  async addBookmark(userId: string, recipe: {
    id: number;
    title: string;
    image: string;
    sourceName?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert([{
          user_id: userId,
          recipe_id: recipe.id,
          recipe_title: recipe.title,
          recipe_image: recipe.image,
          recipe_source: recipe.sourceName || 'Spoonacular'
        }]);

      if (error) {
        console.error('Error adding bookmark:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in addBookmark:', error);
      return { success: false, error: error.message };
    }
  },

  // Menghapus bookmark
  async removeBookmark(userId: string, recipeId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .match({ user_id: userId, recipe_id: recipeId });

      if (error) {
        console.error('Error removing bookmark:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in removeBookmark:', error);
      return { success: false, error: error.message };
    }
  },

  // Mengecek apakah resep sudah di-bookmark
  async isBookmarked(userId: string, recipeId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .match({ user_id: userId, recipe_id: recipeId })
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking bookmark:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isBookmarked:', error);
      return false;
    }
  },

  // Mengambil semua bookmark user
  async getUserBookmarks(userId: string): Promise<BookmarkedRecipe[]> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookmarks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserBookmarks:', error);
      return [];
    }
  }
};