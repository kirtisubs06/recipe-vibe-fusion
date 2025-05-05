
import { ParsedReceiptItem } from "@/store/userPreferences";
import { searchRecipes, SpoonacularRecipe } from "./spoonacularService";
import { supabase } from "@/integrations/supabase/client";
import { getClaudeApiKey } from "./apiKeyService";

interface GroceryListRequest {
  dietaryPreferences: string[];
  currentIngredients: ParsedReceiptItem[];
  selectedCuisines: string[];
}

export interface OptimizedGroceryItem {
  item: string;
  quantity: string;
  estimatedCost: number;
  category: string;
  versatility: number; // How many different meals this item can be used in
}

export interface OptimizedGroceryResponse {
  groceryList: OptimizedGroceryItem[];
  totalCost: number;
  mealIdeas: {
    name: string;
    ingredients: string[];
    cuisineType: string;
    mealType: string; // breakfast, lunch, dinner
  }[];
}

// Get user's liked recipes
async function getUserLikedRecipes(): Promise<string[]> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('recipe_interactions')
      .select('recipe_id')
      .eq('user_id', userData.user.id)
      .eq('interaction_type', 'like');
    
    if (error || !data) {
      console.error("Error fetching liked recipes:", error);
      return [];
    }
    
    return data.map(item => item.recipe_id);
  } catch (error) {
    console.error("Exception fetching liked recipes:", error);
    return [];
  }
}

// Claude API call for grocery list optimization
export async function generateOptimizedGroceryList(
  request: GroceryListRequest
): Promise<OptimizedGroceryResponse> {
  try {
    console.log("Generating optimized grocery list with Claude API...");
    console.log("Input data:", request);

    // Get Claude API key from Supabase
    const claudeApiKey = await getClaudeApiKey();
    
    if (!claudeApiKey) {
      console.error("Claude API key not found in database");
      // Fall back to the mock implementation if API key is not available
      return generateMockGroceryList(request);
    }
    
    // Get user's liked recipes to enhance personalization
    const likedRecipeIds = await getUserLikedRecipes();
    
    // For a real implementation, we would call Claude's API here using the API key
    // For example:
    /*
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Generate an optimized grocery list based on these parameters:
              - Dietary preferences: ${request.dietaryPreferences.join(', ')}
              - Current ingredients: ${JSON.stringify(request.currentIngredients)}
              - Selected cuisines: ${request.selectedCuisines.join(', ')}
              - Liked recipes: ${likedRecipeIds.join(', ')}
              
              The response should be a JSON object with:
              - groceryList: array of items with name, quantity, category, estimatedCost and versatility
              - totalCost: sum of all items
              - mealIdeas: array of meal suggestions using these ingredients
            `
          }
        ]
      }),
    });
    
    const claudeData = await claudeResponse.json();
    return JSON.parse(claudeData.content[0].text);
    */
    
    // For now, continue with the mock implementation, but note that in a real
    // implementation we'd use the Claude API key for the actual API call
    console.log("Using Claude API key:", claudeApiKey.substring(0, 10) + "...");
    
    // Simulate API call delay to mimic the actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to fetch some recipe data from Spoonacular to enhance Claude's recommendations
    let spoonacularData: SpoonacularRecipe[] = [];
    
    try {
      // For each cuisine, try to get some recipes to inform our grocery list
      for (const cuisine of request.selectedCuisines) {
        const dietParams = request.dietaryPreferences.join(',');
        
        const searchResults = await searchRecipes({
          cuisine: cuisine,
          diet: dietParams,
          number: 3
        });
        
        if (searchResults.results.length > 0) {
          spoonacularData = [...spoonacularData, ...searchResults.results];
        }
      }
      
      console.log("Retrieved Spoonacular data:", spoonacularData);
    } catch (error) {
      console.error("Error fetching Spoonacular data:", error);
      // Continue with Claude even if Spoonacular fails
    }
    
    // In a real implementation with Supabase, this would be a secure edge function call
    // For now, we'll simulate the response
    
    // Simulate API response delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate a response based on the input data
    const categories = [
      "Produce", 
      "Meat & Seafood", 
      "Dairy", 
      "Grains & Pasta", 
      "Spices & Herbs", 
      "Canned Goods"
    ];
    
    // Generate sample grocery list based on selected cuisines
    const groceryItems: OptimizedGroceryItem[] = [];
    
    // Base ingredients needed for most cuisines
    const baseItems = [
      { item: "Onions", category: "Produce", estimatedCost: 1.99, versatility: 9 },
      { item: "Garlic", category: "Produce", estimatedCost: 0.99, versatility: 9 },
      { item: "Salt", category: "Spices & Herbs", estimatedCost: 1.49, versatility: 10 },
      { item: "Pepper", category: "Spices & Herbs", estimatedCost: 2.99, versatility: 10 },
      { item: "Olive Oil", category: "Pantry", estimatedCost: 5.99, versatility: 8 },
    ];
    
    // Add base items if not already in current ingredients
    baseItems.forEach(item => {
      if (!request.currentIngredients.some(i => 
          i.item.toLowerCase() === item.item.toLowerCase())) {
        groceryItems.push({
          ...item,
          quantity: "1"
        });
      }
    });
    
    // Add cuisine-specific items
    request.selectedCuisines.forEach(cuisine => {
      let cuisineItems: Partial<OptimizedGroceryItem>[] = [];
      
      switch(cuisine.toLowerCase()) {
        case 'italian':
          cuisineItems = [
            { item: "Pasta", category: "Grains & Pasta", estimatedCost: 1.99, versatility: 7 },
            { item: "Tomatoes", category: "Produce", estimatedCost: 2.99, versatility: 7 },
            { item: "Basil", category: "Produce", estimatedCost: 1.99, versatility: 5 },
            { item: "Parmesan Cheese", category: "Dairy", estimatedCost: 3.99, versatility: 6 }
          ];
          break;
        case 'mexican':
          cuisineItems = [
            { item: "Tortillas", category: "Grains & Pasta", estimatedCost: 2.49, versatility: 7 },
            { item: "Beans", category: "Canned Goods", estimatedCost: 0.99, versatility: 6 },
            { item: "Avocado", category: "Produce", estimatedCost: 1.49, versatility: 5 },
            { item: "Cilantro", category: "Produce", estimatedCost: 1.29, versatility: 6 }
          ];
          break;
        case 'chinese':
          cuisineItems = [
            { item: "Rice", category: "Grains & Pasta", estimatedCost: 3.99, versatility: 8 },
            { item: "Soy Sauce", category: "Pantry", estimatedCost: 2.99, versatility: 7 },
            { item: "Ginger", category: "Produce", estimatedCost: 1.99, versatility: 6 },
            { item: "Green Onions", category: "Produce", estimatedCost: 0.99, versatility: 7 }
          ];
          break;
        case 'indian':
          cuisineItems = [
            { item: "Rice", category: "Grains & Pasta", estimatedCost: 3.99, versatility: 8 },
            { item: "Curry Powder", category: "Spices & Herbs", estimatedCost: 3.49, versatility: 6 },
            { item: "Lentils", category: "Pantry", estimatedCost: 1.99, versatility: 5 },
            { item: "Yogurt", category: "Dairy", estimatedCost: 2.49, versatility: 5 }
          ];
          break;
        case 'japanese':
          cuisineItems = [
            { item: "Rice", category: "Grains & Pasta", estimatedCost: 3.99, versatility: 8 },
            { item: "Soy Sauce", category: "Pantry", estimatedCost: 2.99, versatility: 7 },
            { item: "Miso Paste", category: "Pantry", estimatedCost: 4.99, versatility: 5 },
            { item: "Nori", category: "Pantry", estimatedCost: 3.49, versatility: 4 }
          ];
          break;
        case 'thai':
          cuisineItems = [
            { item: "Rice", category: "Grains & Pasta", estimatedCost: 3.99, versatility: 8 },
            { item: "Coconut Milk", category: "Pantry", estimatedCost: 1.99, versatility: 6 },
            { item: "Lemongrass", category: "Produce", estimatedCost: 2.49, versatility: 5 },
            { item: "Thai Curry Paste", category: "Pantry", estimatedCost: 3.49, versatility: 5 }
          ];
          break;
        default:
          cuisineItems = [];
      }
      
      // Add cuisine items if not already in current ingredients or grocery list
      cuisineItems.forEach(item => {
        if (!request.currentIngredients.some(i => 
            i.item.toLowerCase() === item.item!.toLowerCase()) &&
            !groceryItems.some(g => 
            g.item.toLowerCase() === item.item!.toLowerCase())) {
          groceryItems.push({
            ...item,
            quantity: "1"
          } as OptimizedGroceryItem);
        }
      });
    });
    
    // Add ingredients from Spoonacular recipes if we have any
    if (spoonacularData.length > 0) {
      // Extract unique ingredients from recipe titles and cuisines
      // In a real implementation, we would use the full ingredient lists
      // Here we're just simulating with title words as "ingredients"
      const recipeWords: Set<string> = new Set();
      
      spoonacularData.forEach(recipe => {
        // Extract potential ingredients from title
        const words = recipe.title
          .split(' ')
          .filter(word => word.length > 4) // Only consider longer words as potential ingredients
          .map(word => word.toLowerCase());
        
        words.forEach(word => recipeWords.add(word));
      });
      
      // Add some of these as suggested ingredients
      const potentialIngredients = Array.from(recipeWords);
      const selectedIngredients = potentialIngredients
        .slice(0, Math.min(5, potentialIngredients.length));
      
      selectedIngredients.forEach(ingredient => {
        if (!groceryItems.some(item => 
            item.item.toLowerCase().includes(ingredient)) && 
            !request.currentIngredients.some(item => 
            item.item.toLowerCase().includes(ingredient))) {
          
          groceryItems.push({
            item: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
            quantity: "1",
            category: "Spoonacular Suggestion",
            estimatedCost: 2.99,
            versatility: 6
          });
        }
      });
    }
    
    // Adjust quantities based on dietary preferences
    if (request.dietaryPreferences.includes('Vegetarian')) {
      // Add more vegetables and plant proteins
      if (!request.currentIngredients.some(i => i.item.toLowerCase() === "tofu")) {
        groceryItems.push({
          item: "Tofu",
          category: "Produce",
          estimatedCost: 2.49,
          quantity: "1",
          versatility: 7
        });
      }
    }
    
    // Calculate total cost
    const totalCost = groceryItems.reduce((sum, item) => sum + item.estimatedCost, 0);
    
    // Generate meal ideas based on ingredients and cuisines
    const mealIdeas = generateMealIdeas(request.selectedCuisines, groceryItems, request.dietaryPreferences, spoonacularData);
    
    return {
      groceryList: groceryItems,
      totalCost,
      mealIdeas
    };
  } catch (error) {
    console.error("Error calling Claude API:", error);
    throw new Error("Failed to generate optimized grocery list");
  }
}

// Helper function to generate mock grocery list if the API key is not available
function generateMockGroceryList(request: GroceryListRequest): OptimizedGroceryResponse {
  // Base implementation is already in the original function, we're just providing a clear fallback
  
  // Create a new groceryItems array for this function scope
  const groceryItems: OptimizedGroceryItem[] = [];
  
  // Base ingredients needed for most cuisines
  const baseItems = [
    { item: "Onions", category: "Produce", estimatedCost: 1.99, versatility: 9 },
    { item: "Garlic", category: "Produce", estimatedCost: 0.99, versatility: 9 },
    { item: "Salt", category: "Spices & Herbs", estimatedCost: 1.49, versatility: 10 },
    { item: "Pepper", category: "Spices & Herbs", estimatedCost: 2.99, versatility: 10 },
    { item: "Olive Oil", category: "Pantry", estimatedCost: 5.99, versatility: 8 },
  ];
  
  // Add base items if not already in current ingredients
  baseItems.forEach(item => {
    if (!request.currentIngredients.some(i => 
        i.item.toLowerCase() === item.item.toLowerCase())) {
      groceryItems.push({
        ...item,
        quantity: "1"
      });
    }
  });
  
  // Add cuisine-specific items
  request.selectedCuisines.forEach(cuisine => {
    let cuisineItems: Partial<OptimizedGroceryItem>[] = [];
    
    switch(cuisine.toLowerCase()) {
      case 'italian':
        cuisineItems = [
          { item: "Pasta", category: "Grains & Pasta", estimatedCost: 1.99, versatility: 7 },
          { item: "Tomatoes", category: "Produce", estimatedCost: 2.99, versatility: 7 },
          { item: "Basil", category: "Produce", estimatedCost: 1.99, versatility: 5 },
          { item: "Parmesan Cheese", category: "Dairy", estimatedCost: 3.99, versatility: 6 }
        ];
        break;
      case 'mexican':
        cuisineItems = [
          { item: "Tortillas", category: "Grains & Pasta", estimatedCost: 2.49, versatility: 7 },
          { item: "Beans", category: "Canned Goods", estimatedCost: 0.99, versatility: 6 },
          { item: "Avocado", category: "Produce", estimatedCost: 1.49, versatility: 5 },
          { item: "Cilantro", category: "Produce", estimatedCost: 1.29, versatility: 6 }
        ];
        break;
      case 'chinese':
        cuisineItems = [
          { item: "Rice", category: "Grains & Pasta", estimatedCost: 3.99, versatility: 8 },
          { item: "Soy Sauce", category: "Pantry", estimatedCost: 2.99, versatility: 7 },
          { item: "Ginger", category: "Produce", estimatedCost: 1.99, versatility: 6 },
          { item: "Green Onions", category: "Produce", estimatedCost: 0.99, versatility: 7 }
        ];
        break;
      case 'indian':
        cuisineItems = [
          { item: "Rice", category: "Grains & Pasta", estimatedCost: 3.99, versatility: 8 },
          { item: "Curry Powder", category: "Spices & Herbs", estimatedCost: 3.49, versatility: 6 },
          { item: "Lentils", category: "Pantry", estimatedCost: 1.99, versatility: 5 },
          { item: "Yogurt", category: "Dairy", estimatedCost: 2.49, versatility: 5 }
        ];
        break;
      case 'japanese':
        cuisineItems = [
          { item: "Rice", category: "Grains & Pasta", estimatedCost: 3.99, versatility: 8 },
          { item: "Soy Sauce", category: "Pantry", estimatedCost: 2.99, versatility: 7 },
          { item: "Miso Paste", category: "Pantry", estimatedCost: 4.99, versatility: 5 },
          { item: "Nori", category: "Pantry", estimatedCost: 3.49, versatility: 4 }
        ];
        break;
      case 'thai':
        cuisineItems = [
          { item: "Rice", category: "Grains & Pasta", estimatedCost: 3.99, versatility: 8 },
          { item: "Coconut Milk", category: "Pantry", estimatedCost: 1.99, versatility: 6 },
          { item: "Lemongrass", category: "Produce", estimatedCost: 2.49, versatility: 5 },
          { item: "Thai Curry Paste", category: "Pantry", estimatedCost: 3.49, versatility: 5 }
        ];
        break;
      default:
        cuisineItems = [];
    }
    
    // Add cuisine items if not already in current ingredients or grocery list
    cuisineItems.forEach(item => {
      if (!request.currentIngredients.some(i => 
          i.item.toLowerCase() === item.item!.toLowerCase()) &&
          !groceryItems.some(g => 
          g.item.toLowerCase() === item.item!.toLowerCase())) {
        groceryItems.push({
          ...item,
          quantity: "1"
        } as OptimizedGroceryItem);
      }
    });
  });
  
  // Calculate total cost
  const totalCost = groceryItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  
  // Generate meal ideas based on ingredients and cuisines
  const mealIdeas = generateMealIdeas(request.selectedCuisines, groceryItems, request.dietaryPreferences, []);
  
  return {
    groceryList: groceryItems,
    totalCost,
    mealIdeas
  };
}

// Helper function to generate meal ideas
function generateMealIdeas(
  cuisines: string[],
  groceryItems: OptimizedGroceryItem[],
  dietaryPreferences: string[],
  spoonacularData: SpoonacularRecipe[] = []
) {
  const isVegetarian = dietaryPreferences.includes('Vegetarian');
  const isDairyFree = dietaryPreferences.includes('Dairy Free');
  const isLowCarb = dietaryPreferences.includes('Low Carb');
  
  // Generate meal ideas based on cuisines and ingredients
  let meals = [];
  
  // First, try to use Spoonacular data if available
  if (spoonacularData.length > 0) {
    meals = spoonacularData.map(recipe => {
      return {
        name: recipe.title,
        ingredients: recipe.diets || [], // In real implementation, we'd have ingredient lists
        cuisineType: recipe.cuisines?.length > 0 ? recipe.cuisines[0] : "Various",
        mealType: recipe.readyInMinutes < 20 ? "lunch" : "dinner"
      };
    });
  }
  
  // If we don't have enough from Spoonacular, add our own suggestions
  if (meals.length < 3) {
    // Italian meals
    if (cuisines.includes('italian')) {
      if (!isVegetarian) {
        meals.push({
          name: "Spaghetti Bolognese",
          ingredients: ["Pasta", "Ground Beef", "Tomatoes", "Onions", "Garlic", "Olive Oil"],
          cuisineType: "Italian",
          mealType: "dinner"
        });
      }
      
      meals.push({
        name: "Tomato Basil Pasta",
        ingredients: ["Pasta", "Tomatoes", "Basil", "Garlic", "Olive Oil"],
        cuisineType: "Italian",
        mealType: "lunch"
      });
    }
    
    // Mexican meals
    if (cuisines.includes('mexican')) {
      if (!isVegetarian) {
        meals.push({
          name: "Beef Tacos",
          ingredients: ["Tortillas", "Ground Beef", "Onions", "Tomatoes", "Avocado", "Cilantro"],
          cuisineType: "Mexican",
          mealType: "dinner"
        });
      }
      
      meals.push({
        name: "Bean Burritos",
        ingredients: ["Tortillas", "Beans", "Rice", "Avocado", "Cilantro"],
        cuisineType: "Mexican",
        mealType: "lunch"
      });
    }
    
    // Chinese meals
    if (cuisines.includes('chinese')) {
      if (!isVegetarian) {
        meals.push({
          name: "Chicken Fried Rice",
          ingredients: ["Rice", "Chicken", "Eggs", "Green Onions", "Soy Sauce", "Garlic"],
          cuisineType: "Chinese",
          mealType: "dinner"
        });
      }
      
      meals.push({
        name: "Vegetable Stir Fry",
        ingredients: ["Rice", "Bell Peppers", "Broccoli", "Carrots", "Ginger", "Garlic", "Soy Sauce"],
        cuisineType: "Chinese",
        mealType: "lunch"
      });
    }
    
    // Filter meals based on dietary preferences
    let filteredMeals = [...meals];
    
    if (isVegetarian) {
      filteredMeals = filteredMeals.filter(meal => 
        !meal.ingredients.some(ingredient => 
          ["Beef", "Chicken", "Pork", "Fish", "Shrimp", "Ground Beef"].includes(ingredient)
        )
      );
    }
    
    if (isDairyFree) {
      filteredMeals = filteredMeals.filter(meal => 
        !meal.ingredients.some(ingredient => 
          ["Milk", "Cheese", "Butter", "Cream", "Yogurt", "Parmesan Cheese"].includes(ingredient)
        )
      );
    }
    
    if (isLowCarb) {
      filteredMeals = filteredMeals.filter(meal => 
        !meal.ingredients.some(ingredient => 
          ["Pasta", "Rice", "Bread", "Tortillas"].includes(ingredient)
        )
      );
    }
    
    // If we filtered too much, add some generic meals
    if (filteredMeals.length < 3) {
      if (isVegetarian && !isLowCarb) {
        filteredMeals.push({
          name: "Vegetable Stir Fry",
          ingredients: ["Bell Peppers", "Broccoli", "Carrots", "Ginger", "Garlic", "Soy Sauce"],
          cuisineType: "Fusion",
          mealType: "dinner"
        });
      }
      
      if (!isDairyFree && !isLowCarb) {
        filteredMeals.push({
          name: "Veggie Omelette",
          ingredients: ["Eggs", "Bell Peppers", "Onions", "Cheese", "Spinach"],
          cuisineType: "Breakfast",
          mealType: "breakfast"
        });
      }
      
      if (isLowCarb) {
        filteredMeals.push({
          name: "Cauliflower Rice Bowl",
          ingredients: ["Cauliflower", "Bell Peppers", "Avocado", "Cilantro", "Lime"],
          cuisineType: "Fusion",
          mealType: "lunch"
        });
      }
    }
    
    // Return the filtered meals
    return filteredMeals;
  }
  
  // If we didn't enter the if block above, just return the meals array
  return meals;
}
