
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/sonner';
import { mockRecipes } from '@/data/mockRecipes';

// Types for our database tables
export interface MealPlan {
  id: string;
  user_id: string;
  day_of_week: string;
  recipe_id: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  description: string;
  prep_time: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  cuisine_type: string;
  dietary_info: string[];
  created_at: string;
}

export interface RecipeInteraction {
  id: string;
  user_id: string;
  recipe_id: string;
  interaction_type: 'like' | 'dislike';
  created_at: string;
}

// Save a recipe to Supabase
export async function saveRecipe(recipe: Recipe): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .upsert([recipe])
      .select();
    
    if (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception saving recipe:", error);
    toast.error("Failed to save recipe");
    return false;
  }
}

// Save a user's meal plan
export async function saveMealPlan(mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .upsert([mealPlan])
      .select();
    
    if (error) {
      console.error("Error saving meal plan:", error);
      toast.error("Failed to save meal plan");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception saving meal plan:", error);
    toast.error("Failed to save meal plan");
    return false;
  }
}

// Save a user interaction with a recipe
export async function saveRecipeInteraction(
  recipe_id: string, 
  interaction_type: 'like' | 'dislike'
): Promise<boolean> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("User not authenticated:", userError);
      toast.error("Please sign in to interact with recipes");
      return false;
    }
    
    const user_id = userData.user.id;
    
    const { data, error } = await supabase
      .from('recipe_interactions')
      .upsert([
        { user_id, recipe_id, interaction_type }
      ])
      .select();
    
    if (error) {
      console.error("Error saving recipe interaction:", error);
      toast.error("Failed to save your preference");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception saving recipe interaction:", error);
    toast.error("Failed to save your preference");
    return false;
  }
}

// Get a user's meal plans
export async function getUserMealPlans(): Promise<MealPlan[]> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("User not authenticated:", userError);
      return [];
    }
    
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userData.user.id);
    
    if (error) {
      console.error("Error fetching meal plans:", error);
      toast.error("Failed to load your meal plans");
      return [];
    }
    
    return data as MealPlan[];
  } catch (error) {
    console.error("Exception fetching meal plans:", error);
    toast.error("Failed to load your meal plans");
    return [];
  }
}

// Get recipe details by ID
export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();
    
    if (error) {
      console.error("Error fetching recipe:", error);
      
      // Fallback to mock recipes if we can't find it in the database
      const mockRecipe = mockRecipes.find(r => r.id === recipeId);
      if (mockRecipe) {
        // Save the mock recipe to our database for future use
        await saveRecipe(mockRecipe);
        return mockRecipe;
      }
      
      toast.error("Failed to load recipe details");
      return null;
    }
    
    return data as Recipe;
  } catch (error) {
    console.error("Exception fetching recipe:", error);
    toast.error("Failed to load recipe details");
    return null;
  }
}

// Sync mock recipes to Supabase
export async function syncMockRecipesToSupabase(): Promise<void> {
  try {
    const { data: existingRecipes, error: fetchError } = await supabase
      .from('recipes')
      .select('id');
    
    if (fetchError) {
      console.error("Error checking existing recipes:", fetchError);
      return;
    }
    
    const existingIds = new Set(existingRecipes.map(r => r.id));
    const recipesToAdd = mockRecipes.filter(recipe => !existingIds.has(recipe.id));
    
    if (recipesToAdd.length === 0) {
      console.log("All mock recipes are already in the database");
      return;
    }
    
    console.log(`Adding ${recipesToAdd.length} mock recipes to the database`);
    
    const { error: insertError } = await supabase
      .from('recipes')
      .insert(recipesToAdd);
    
    if (insertError) {
      console.error("Error inserting mock recipes:", insertError);
      return;
    }
    
    console.log("Successfully synced mock recipes to Supabase");
  } catch (error) {
    console.error("Exception syncing mock recipes:", error);
  }
}

// Initialize database with mock data (if needed)
export async function initializeDatabase(): Promise<void> {
  await syncMockRecipesToSupabase();
}
