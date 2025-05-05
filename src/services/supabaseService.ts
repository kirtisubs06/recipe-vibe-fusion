
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
export async function saveRecipe(recipe: any): Promise<boolean> {
  try {
    // Convert from mock recipe format to supabase format if needed
    const supabaseRecipe: Recipe = {
      id: recipe.id,
      name: recipe.name,
      image: recipe.image,
      description: recipe.description || `A delicious ${recipe.name} recipe crafted for your meal plan.`,
      prep_time: recipe.prep_time || recipe.prepTime || '30 mins',
      servings: recipe.servings || 4,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      cuisine_type: recipe.cuisine_type || recipe.cuisine || '',
      dietary_info: recipe.dietary_info || recipe.dietaryInfo || [],
      created_at: recipe.created_at || new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('recipes')
      .upsert([supabaseRecipe])
      .select();
    
    if (error) {
      console.error("Error saving recipe:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception saving recipe:", error);
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
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception saving meal plan:", error);
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
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception saving recipe interaction:", error);
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
      return [];
    }
    
    return data as MealPlan[];
  } catch (error) {
    console.error("Exception fetching meal plans:", error);
    return [];
  }
}

// Enhanced function to get recipe details by ID with more complete data
export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  try {
    // First attempt to get from Supabase
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
        // Create a more detailed description if not present
        if (!mockRecipe.description || mockRecipe.description.length < 50) {
          mockRecipe.description = generateDetailedDescription(mockRecipe.name, mockRecipe.cuisine_type);
        }
        
        // Ensure we have ingredients
        if (!mockRecipe.ingredients || mockRecipe.ingredients.length === 0) {
          mockRecipe.ingredients = generatePlaceholderIngredients(mockRecipe.name);
        }
        
        // Ensure we have instructions
        if (!mockRecipe.instructions || mockRecipe.instructions.length === 0) {
          mockRecipe.instructions = generatePlaceholderInstructions();
        }
        
        // Convert from mock recipe format to supabase format
        const supabaseRecipe: Recipe = {
          id: mockRecipe.id,
          name: mockRecipe.name,
          image: mockRecipe.image,
          description: mockRecipe.description,
          prep_time: mockRecipe.prep_time || '30 mins',
          servings: mockRecipe.servings || 4,
          ingredients: mockRecipe.ingredients,
          instructions: mockRecipe.instructions,
          cuisine_type: mockRecipe.cuisine_type || '',
          dietary_info: mockRecipe.dietary_info || [],
          created_at: mockRecipe.created_at || new Date().toISOString()
        };
        
        // Save the enhanced recipe to Supabase for future use
        saveRecipe(supabaseRecipe);
        
        return supabaseRecipe;
      }
      
      return null;
    }
    
    // We got the recipe from Supabase, but let's make sure it has all the data we need
    const recipe = data as Recipe;
    
    // If any key data is missing, let's enhance it
    let needsUpdate = false;
    
    if (!recipe.description || recipe.description.length < 50) {
      recipe.description = generateDetailedDescription(recipe.name, recipe.cuisine_type);
      needsUpdate = true;
    }
    
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      recipe.ingredients = generatePlaceholderIngredients(recipe.name);
      needsUpdate = true;
    }
    
    if (!recipe.instructions || recipe.instructions.length === 0) {
      recipe.instructions = generatePlaceholderInstructions();
      needsUpdate = true;
    }
    
    // If we enhanced the recipe, save it back to Supabase
    if (needsUpdate) {
      saveRecipe(recipe);
    }
    
    return recipe;
  } catch (error) {
    console.error("Exception fetching recipe:", error);
    return null;
  }
}

// Helper function to generate a detailed description
function generateDetailedDescription(recipeName: string, cuisineType: string = ''): string {
  const cuisineDescriptions: Record<string, string> = {
    'italian': 'authentic Italian',
    'mexican': 'vibrant Mexican',
    'asian': 'aromatic Asian',
    'mediterranean': 'fresh Mediterranean',
    'indian': 'richly spiced Indian',
    'french': 'elegant French',
    'american': 'classic American',
    'greek': 'flavorful Greek',
    'thai': 'tantalizing Thai',
    'japanese': 'meticulously prepared Japanese',
    'chinese': 'traditional Chinese',
    'spanish': 'colorful Spanish',
    'middle eastern': 'fragrant Middle Eastern'
  };
  
  const cuisineStr = cuisineType && cuisineDescriptions[cuisineType.toLowerCase()] 
    ? cuisineDescriptions[cuisineType.toLowerCase()] 
    : 'deliciously crafted';
  
  return `This ${cuisineStr} ${recipeName} combines fresh ingredients with expert techniques to create a memorable dining experience. Each bite offers a perfect balance of flavors that will satisfy your cravings while providing excellent nutritional value. This dish is carefully designed to fit within your dietary preferences and make use of ingredients you already have.`;
}

// Helper function to generate placeholder ingredients
function generatePlaceholderIngredients(recipeName: string): string[] {
  // Base ingredients that most dishes might have
  const baseIngredients = [
    "2 tablespoons olive oil",
    "1/2 teaspoon salt",
    "1/4 teaspoon black pepper",
    "1 medium onion, diced",
    "2 cloves garlic, minced"
  ];
  
  // Add some recipe-specific ingredients based on the name
  let specificIngredients: string[] = [];
  
  if (recipeName.toLowerCase().includes('chicken')) {
    specificIngredients = [
      "1.5 lbs chicken breast, cut into cubes",
      "1 cup chicken broth",
      "1 tablespoon fresh thyme",
      "1/2 lemon, juiced"
    ];
  } else if (recipeName.toLowerCase().includes('pasta') || recipeName.toLowerCase().includes('spaghetti')) {
    specificIngredients = [
      "8 oz pasta of choice",
      "1/2 cup grated parmesan cheese",
      "2 tablespoons fresh basil, chopped",
      "1 can (14 oz) diced tomatoes"
    ];
  } else if (recipeName.toLowerCase().includes('salad')) {
    specificIngredients = [
      "6 cups mixed greens",
      "1 cucumber, sliced",
      "1 bell pepper, diced",
      "1/4 cup olive oil",
      "2 tablespoons balsamic vinegar"
    ];
  } else if (recipeName.toLowerCase().includes('soup')) {
    specificIngredients = [
      "6 cups vegetable or chicken broth",
      "2 carrots, diced",
      "2 celery stalks, chopped",
      "1 cup diced vegetables of choice",
      "1 bay leaf"
    ];
  } else if (recipeName.toLowerCase().includes('fish') || recipeName.toLowerCase().includes('salmon')) {
    specificIngredients = [
      "1.5 lbs fish fillet",
      "1 lemon, sliced",
      "2 tablespoons butter",
      "1 tablespoon fresh dill, chopped"
    ];
  } else if (recipeName.toLowerCase().includes('rice')) {
    specificIngredients = [
      "1.5 cups rice",
      "3 cups water or broth",
      "1/2 cup diced vegetables",
      "1/4 cup fresh herbs"
    ];
  } else if (recipeName.toLowerCase().includes('breakfast')) {
    specificIngredients = [
      "4 large eggs",
      "1/2 cup milk",
      "2 tablespoons butter",
      "2 slices bread, toasted",
      "1/4 cup maple syrup"
    ];
  } else {
    specificIngredients = [
      "1.5 lbs protein of choice",
      "1 cup mixed vegetables",
      "1/2 cup broth or water",
      "1 tablespoon fresh herbs",
      "1/4 cup sauce of choice"
    ];
  }
  
  return [...baseIngredients, ...specificIngredients];
}

// Helper function to generate placeholder instructions
function generatePlaceholderInstructions(): string[] {
  return [
    "Prepare all ingredients: measure, chop, and organize everything before starting to cook.",
    
    "Heat olive oil in a large pan over medium heat. Add onions and sauté until translucent, about 3-4 minutes.",
    
    "Add garlic and cook for another 30 seconds until fragrant, being careful not to burn it.",
    
    "Add the main protein ingredient and cook until properly done. For meat, ensure it reaches the appropriate internal temperature.",
    
    "Incorporate any vegetables and cook until they reach your desired level of tenderness.",
    
    "Add any liquids (broth, wine, etc.) and bring to a simmer. Reduce heat and cook according to recipe specifications.",
    
    "Season with salt, pepper, and any additional herbs or spices to taste.",
    
    "Finish the dish by adding any final ingredients, adjusting seasonings if needed, and garnishing appropriately.",
    
    "Let the dish rest for a few minutes before serving to allow flavors to meld together."
  ];
}

// Sync mock recipes to Supabase
export async function syncMockRecipesToSupabase(): Promise<void> {
  try {
    // First check if we have permission to insert recipes
    const { error: testError } = await supabase
      .from('recipes')
      .select('id')
      .limit(1);
    
    if (testError && testError.code === '42501') {
      console.warn("No permission to access recipes table due to RLS policies. Using mock recipes only.");
      return;
    }
    
    const { data: existingRecipes, error: fetchError } = await supabase
      .from('recipes')
      .select('id');
    
    if (fetchError) {
      console.error("Error checking existing recipes:", fetchError);
      return;
    }
    
    const existingIds = new Set(existingRecipes?.map(r => r.id) || []);
    const recipesToAdd = mockRecipes.filter(recipe => !existingIds.has(recipe.id));
    
    if (recipesToAdd.length === 0) {
      console.log("All mock recipes are already in the database");
      return;
    }
    
    console.log(`Adding ${recipesToAdd.length} mock recipes to the database`);
    
    // Convert mock recipes to Supabase format and enhance them
    const supabaseRecipes = recipesToAdd.map(recipe => {
      // Create a more detailed description if not present
      if (!recipe.description || recipe.description.length < 50) {
        recipe.description = generateDetailedDescription(recipe.name, recipe.cuisine_type);
      }
      
      // Ensure we have ingredients
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        recipe.ingredients = generatePlaceholderIngredients(recipe.name);
      }
      
      // Ensure we have instructions
      if (!recipe.instructions || recipe.instructions.length === 0) {
        recipe.instructions = generatePlaceholderInstructions();
      }
      
      return {
        id: recipe.id,
        name: recipe.name,
        image: recipe.image,
        description: recipe.description,
        prep_time: recipe.prep_time || '30 mins',
        servings: recipe.servings || 4,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cuisine_type: recipe.cuisine_type || '',
        dietary_info: recipe.dietary_info || [],
        created_at: recipe.created_at || new Date().toISOString()
      };
    });
    
    // Insert recipes in smaller batches to avoid timeout issues
    const batchSize = 10;
    for (let i = 0; i < supabaseRecipes.length; i += batchSize) {
      const batch = supabaseRecipes.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('recipes')
        .upsert(batch);
      
      if (insertError) {
        console.error(`Error inserting batch ${i/batchSize + 1}:`, insertError);
      } else {
        console.log(`Successfully added batch ${i/batchSize + 1} of recipes`);
      }
    }
    
    console.log("Successfully synced mock recipes to Supabase");
  } catch (error) {
    console.error("Exception syncing mock recipes:", error);
    // Continue execution - we'll use mock recipes as fallback
  }
}

// Initialize database with mock data (if needed)
export async function initializeDatabase(): Promise<void> {
  await syncMockRecipesToSupabase();
}
