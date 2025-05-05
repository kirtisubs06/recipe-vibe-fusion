
import { toast } from '@/components/ui/sonner';

// Define types
export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  cuisines: string[];
  diets: string[];
}

export interface SpoonacularRecipeDetail extends SpoonacularRecipe {
  summary: string;
  instructions: string;
  extendedIngredients: {
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }[];
}

export interface SearchRecipesParams {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  includeIngredients?: string; // This property is properly defined here
  excludeIngredients?: string;
  type?: string;
  maxReadyTime?: number;
  number?: number;
}

// API key handling
// Default API key is now set to the provided key
let SPOONACULAR_API_KEY = 'abebef3b422e46699ed04d721ac16a23';

export const setSpoonacularApiKey = (key: string) => {
  SPOONACULAR_API_KEY = key;
  localStorage.setItem('spoonacular_api_key', key);
};

export const getSpoonacularApiKey = (): string => {
  if (SPOONACULAR_API_KEY) return SPOONACULAR_API_KEY;
  
  const storedKey = localStorage.getItem('spoonacular_api_key');
  if (storedKey) {
    SPOONACULAR_API_KEY = storedKey;
    return storedKey;
  }
  
  // Return the default API key if no custom key is set
  return 'abebef3b422e46699ed04d721ac16a23';
};

// API endpoints
const BASE_URL = 'https://api.spoonacular.com';

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
}

// Search recipes based on various parameters
export async function searchRecipes(params: SearchRecipesParams): Promise<{ results: SpoonacularRecipe[], totalResults: number }> {
  const apiKey = getSpoonacularApiKey();
  if (!apiKey) {
    toast.error('No Spoonacular API key found. Please set it in your profile.');
    return { results: [], totalResults: 0 };
  }
  
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      apiKey,
      number: (params.number || 10).toString(),
    });
    
    // Add optional parameters if they exist
    if (params.query) queryParams.append('query', params.query);
    if (params.cuisine) queryParams.append('cuisine', params.cuisine);
    if (params.diet) queryParams.append('diet', params.diet);
    if (params.intolerances) queryParams.append('intolerances', params.intolerances);
    if (params.includeIngredients) queryParams.append('includeIngredients', params.includeIngredients);
    if (params.excludeIngredients) queryParams.append('excludeIngredients', params.excludeIngredients);
    if (params.type) queryParams.append('type', params.type);
    if (params.maxReadyTime) queryParams.append('maxReadyTime', params.maxReadyTime.toString());
    
    const response = await fetch(
      `${BASE_URL}/recipes/complexSearch?${queryParams.toString()}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    return handleApiResponse<{ results: SpoonacularRecipe[], totalResults: number }>(response);
  } catch (error) {
    console.error('Error searching recipes:', error);
    toast.error('Failed to search recipes');
    return { results: [], totalResults: 0 };
  }
}

// Get detailed recipe information by ID
export async function getRecipeById(id: number): Promise<SpoonacularRecipeDetail | null> {
  const apiKey = getSpoonacularApiKey();
  if (!apiKey) {
    toast.error('No Spoonacular API key found. Please set it in your profile.');
    return null;
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/${id}/information?apiKey=${apiKey}&includeNutrition=false`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    return handleApiResponse<SpoonacularRecipeDetail>(response);
  } catch (error) {
    console.error('Error getting recipe details:', error);
    toast.error('Failed to get recipe details');
    return null;
  }
}

// Get meal plan suggestions based on user preferences
export async function getMealPlanSuggestion(
  targetCalories: number, 
  diet?: string, 
  exclude?: string[]
): Promise<any> {
  const apiKey = getSpoonacularApiKey();
  if (!apiKey) {
    toast.error('No Spoonacular API key found. Please set it in your profile.');
    return null;
  }
  
  try {
    const queryParams = new URLSearchParams({
      apiKey,
      timeFrame: 'week',
      targetCalories: targetCalories.toString(),
    });
    
    if (diet) queryParams.append('diet', diet);
    if (exclude && exclude.length > 0) queryParams.append('exclude', exclude.join(','));
    
    const response = await fetch(
      `${BASE_URL}/mealplanner/generate?${queryParams.toString()}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error getting meal plan:', error);
    toast.error('Failed to get meal plan');
    return null;
  }
}

// Get grocery list from a collection of recipes
export async function getGroceryListByRecipes(
  ids: number[]
): Promise<any> {
  const apiKey = getSpoonacularApiKey();
  if (!apiKey) {
    toast.error('No Spoonacular API key found. Please set it in your profile.');
    return null;
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/informationBulk?ids=${ids.join(',')}&apiKey=${apiKey}&includeNutrition=false`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    const recipes = await handleApiResponse<SpoonacularRecipeDetail[]>(response);
    
    // Process ingredients to create grocery list
    const groceryItems: {[key: string]: {name: string, amount: number, unit: string}} = {};
    
    recipes.forEach(recipe => {
      recipe.extendedIngredients.forEach(ingredient => {
        const key = ingredient.name.toLowerCase();
        if (groceryItems[key]) {
          groceryItems[key].amount += ingredient.amount;
        } else {
          groceryItems[key] = {
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit
          };
        }
      });
    });
    
    return Object.values(groceryItems);
  } catch (error) {
    console.error('Error generating grocery list:', error);
    toast.error('Failed to generate grocery list');
    return [];
  }
}
