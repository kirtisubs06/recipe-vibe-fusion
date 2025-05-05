
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Calendar, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import NavBar from '@/components/NavBar';
import { mockRecipes } from '@/data/mockRecipes';
import { useUserPreferences } from '@/store/userPreferences';
import { generateOptimizedGroceryList, OptimizedGroceryResponse } from '@/services/claudeService';
import RecipeExpanded from '@/components/RecipeExpanded';
import { 
  initializeDatabase, 
  getRecipeById,
  saveMealPlan,
  Recipe
} from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { searchRecipes } from '@/services/spoonacularService';

// Days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

// Enhanced meal planning function that uses user preferences and current ingredients
const generateMealPlan = async (cuisines: string[], dietaryPreferences: string[], currentIngredients: any[]) => {
  try {
    // Initialize an array to track used recipe IDs to avoid duplicates
    const usedRecipeIds = new Set();
    
    // Create a map to organize meal plans by day and type
    const mealPlanMap = new Map();
    
    // Initialize the meal plan structure
    daysOfWeek.forEach(day => {
      mealPlanMap.set(day, new Map());
      mealTypes.forEach(type => {
        mealPlanMap.get(day).set(type, null);
      });
    });
    
    // First, try to search for recipes from Spoonacular API based on user preferences
    for (const day of daysOfWeek) {
      for (const type of mealTypes) {
        // Construct search parameters based on meal type and preferences
        const params = {
          type: type.toLowerCase(),
          diet: dietaryPreferences.join(','),
          cuisine: cuisines.length > 0 ? cuisines.join(',') : undefined,
          number: 5
        };
        
        // Add ingredients to include if available
        if (currentIngredients.length > 0) {
          params.includeIngredients = currentIngredients
            .slice(0, 3) // Limit to a few ingredients to increase chance of matches
            .map(item => item.item)
            .join(',');
        }
        
        try {
          const apiResult = await searchRecipes(params);
          
          // Filter out already used recipes
          const availableRecipes = apiResult.results.filter(r => !usedRecipeIds.has(r.id.toString()));
          
          if (availableRecipes.length > 0) {
            // Randomly select one from available recipes
            const selectedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            
            // Convert Spoonacular recipe format to our app's recipe format
            const recipe = {
              id: selectedRecipe.id.toString(),
              name: selectedRecipe.title,
              image: selectedRecipe.image,
              description: `A delicious ${type.toLowerCase()} recipe`,
              prepTime: `${selectedRecipe.readyInMinutes} mins`,
              servings: selectedRecipe.servings,
              dietaryInfo: selectedRecipe.diets,
              vibes: selectedRecipe.cuisines || [],
              ingredients: [],  // We'll fill this in later if needed
              instructions: []  // We'll fill this in later if needed
            };
            
            // Add recipe to the meal plan
            mealPlanMap.get(day).set(type, recipe);
            
            // Mark this recipe as used
            usedRecipeIds.add(selectedRecipe.id.toString());
          }
          else {
            // If no unique recipes from API, fall back to mock data
            fallbackToMockData(day, type, usedRecipeIds, mealPlanMap);
          }
        } catch (error) {
          console.error("Error fetching recipes from API:", error);
          // Fall back to mock data if API fails
          fallbackToMockData(day, type, usedRecipeIds, mealPlanMap);
        }
      }
    }
    
    // Fill any remaining empty meal slots with mock data
    daysOfWeek.forEach(day => {
      mealTypes.forEach(type => {
        if (!mealPlanMap.get(day).get(type)) {
          fallbackToMockData(day, type, usedRecipeIds, mealPlanMap);
        }
      });
    });
    
    // Convert the map to the array structure expected by the component
    const mealPlan = [];
    mealPlanMap.forEach((mealTypeMap, day) => {
      mealTypeMap.forEach((recipe, type) => {
        mealPlan.push({
          day,
          mealType: type,
          recipe
        });
      });
    });
    
    return mealPlan;
  } catch (error) {
    console.error("Error in generateMealPlan:", error);
    // If everything fails, return a simple mock meal plan
    return generateFallbackMealPlan();
  }
};

// Helper function to fall back to mock data when API fails
const fallbackToMockData = (day, type, usedRecipeIds, mealPlanMap) => {
  // Filter recipes by meal type (simple heuristic: breakfast has "breakfast" in name or description)
  let filteredRecipes = mockRecipes;
  
  if (type === 'Breakfast') {
    filteredRecipes = mockRecipes.filter(r => 
      r.name.toLowerCase().includes('breakfast') || 
      r.description.toLowerCase().includes('breakfast') ||
      r.name.toLowerCase().includes('morning') ||
      r.name.toLowerCase().includes('toast') ||
      r.name.toLowerCase().includes('egg')
    );
  } else if (type === 'Lunch') {
    filteredRecipes = mockRecipes.filter(r => 
      r.name.toLowerCase().includes('lunch') || 
      r.description.toLowerCase().includes('lunch') ||
      r.name.toLowerCase().includes('salad') ||
      r.name.toLowerCase().includes('sandwich')
    );
  } else { // Dinner
    filteredRecipes = mockRecipes.filter(r => 
      !r.name.toLowerCase().includes('breakfast') && 
      !r.name.toLowerCase().includes('lunch') &&
      !r.name.toLowerCase().includes('sandwich') &&
      !r.name.toLowerCase().includes('toast')
    );
  }
  
  // Filter out already used recipes
  let availableRecipes = filteredRecipes.filter(r => !usedRecipeIds.has(r.id));
  
  // If no available recipes of the right type, use any unused recipe
  if (availableRecipes.length === 0) {
    availableRecipes = mockRecipes.filter(r => !usedRecipeIds.has(r.id));
  }
  
  // If all recipes have been used, allow reuse
  if (availableRecipes.length === 0) {
    availableRecipes = mockRecipes;
  }
  
  // Randomly select a recipe
  const selectedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
  
  // Add recipe to the meal plan
  mealPlanMap.get(day).set(type, selectedRecipe);
  
  // Mark this recipe as used
  usedRecipeIds.add(selectedRecipe.id);
};

// Fallback function if everything else fails
const generateFallbackMealPlan = () => {
  const mealPlan = [];
  
  daysOfWeek.forEach(day => {
    mealTypes.forEach(type => {
      // Get a random recipe
      const recipe = mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
      
      mealPlan.push({
        day,
        mealType: type,
        recipe
      });
    });
  });
  
  return mealPlan;
};

const MealPlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mealPlan, setMealPlan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastShown, setToastShown] = useState(false);
  const [optimizedGroceryResponse, setOptimizedGroceryResponse] = useState<OptimizedGroceryResponse | null>(null);
  const [expandedRecipe, setExpandedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});
  
  // Get user preferences
  const { 
    selectedCuisines: storedCuisines, 
    dietaryPreferences,
    currentIngredients
  } = useUserPreferences();
  
  // Get selected cuisines from location state or from our store
  const locationCuisines = location.state?.selectedCuisines;
  const selectedCuisines = locationCuisines || storedCuisines;
  
  // Check for authentication
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);

  // Initialize database with mock recipes
  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
    };

    init();
  }, []);
  
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(async () => {
      try {
        // Generate meal plan based on cuisines, dietary preferences, and current ingredients
        const generatedMealPlan = await generateMealPlan(
          selectedCuisines, 
          dietaryPreferences, 
          currentIngredients
        );
        
        setMealPlan(generatedMealPlan);
        
        // Generate optimized grocery list using Claude API (via Supabase)
        const optimizedGrocery = await generateOptimizedGroceryList({
          dietaryPreferences,
          currentIngredients, 
          selectedCuisines
        });
        
        setOptimizedGroceryResponse(optimizedGrocery);
        setIsLoading(false);
        
        // Save meal plan to Supabase if user is authenticated
        if (user) {
          generatedMealPlan.forEach(async (meal) => {
            await saveMealPlan({
              user_id: user.id,
              day_of_week: meal.day,
              recipe_id: meal.recipe.id
            });
          });
        }
        
        // Show toast notification only once
        if (!toastShown) {
          toast.success("Your meal plan is ready!", {
            description: "We've optimized recipes based on your preferences and available ingredients",
          });
          setToastShown(true);
        }
      } catch (error) {
        console.error("Error generating meal plan:", error);
        toast.error("Error generating meal plan", {
          description: "Please try again later",
        });
        setIsLoading(false);
      }
    }, 2000);
    
    // Clean up timeout to prevent memory leaks
    return () => clearTimeout(timer);
  }, [selectedCuisines, dietaryPreferences, currentIngredients, toastShown, user]);

  const handleViewRecipe = async (recipeId: string) => {
    try {
      setSelectedRecipeId(recipeId);
      const recipe = await getRecipeById(recipeId);
      if (recipe) {
        setExpandedRecipe(recipe);
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      toast.error("Could not load recipe details");
    }
  };
  
  const handleViewShoppingList = () => {
    // Pass optimized grocery list to shopping list page
    navigate('/shopping-list', { 
      state: { 
        shoppingList: optimizedGroceryResponse?.groceryList || [],
        mealIdeas: optimizedGroceryResponse?.mealIdeas || [] 
      } 
    });
  };

  const getDayColor = (index: number) => {
    const colors = [
      'bg-cheffy-brown',
      'bg-cheffy-brown',
      'bg-cheffy-olive',
      'bg-cheffy-brown',
      'bg-cheffy-brown',
      'bg-cheffy-olive',
      'bg-cheffy-brown'
    ];
    return colors[index % colors.length];
  };
  
  const toggleDayCollapse = (day: string) => {
    setCollapsedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };
  
  // Group meal plan by day
  const mealPlanByDay = mealPlan.reduce((acc, meal) => {
    if (!acc[meal.day]) {
      acc[meal.day] = [];
    }
    acc[meal.day].push(meal);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/86286b24-5a62-4fe2-9370-178d77d49428.png" 
                alt="Cheffy Logo" 
                className="h-8 w-8 mr-2"
              />
              <h1 className="text-2xl font-bold text-cheffy-cream">
                Weekly Meal Plan
              </h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-cheffy-brown text-cheffy-cream"
            onClick={handleViewShoppingList}
          >
            <ShoppingCart className="h-4 w-4" />
            Shopping List
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto p-4 max-w-md">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-cheffy-brown border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Creating your optimized meal plan...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-xl font-medium mb-2">Your Weekly Meal Plan</h2>
              <p className="text-muted-foreground">
                We've created a balanced plan with your selected cuisines, dietary preferences, and available ingredients
              </p>
            </div>
            
            <div className="space-y-4">
              {daysOfWeek.map((day, dayIndex) => {
                const dayMeals = mealPlanByDay[day] || [];
                const isCollapsed = collapsedDays[day];
                
                return (
                  <div 
                    key={day} 
                    className="bg-card rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.01]"
                  >
                    <div 
                      className={`flex items-center justify-between p-3 cursor-pointer ${getDayColor(dayIndex)}`}
                      onClick={() => toggleDayCollapse(day)}
                    >
                      <span className="font-bold text-white">{day}</span>
                      <Button variant="ghost" size="icon" className="text-white p-1">
                        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </Button>
                    </div>
                    
                    {!isCollapsed && (
                      <div className="divide-y divide-gray-100">
                        {mealTypes.map((type) => {
                          const meal = dayMeals.find(m => m.mealType === type);
                          if (!meal) return null;
                          
                          return (
                            <div key={`${day}-${type}`} className="p-3">
                              <div className="text-sm font-medium text-cheffy-cream/70 mb-2">{type}</div>
                              <div 
                                className="flex cursor-pointer"
                                onClick={() => handleViewRecipe(meal.recipe.id)}
                              >
                                <div className="w-16 h-16 rounded-lg overflow-hidden mr-3">
                                  <img 
                                    src={meal.recipe.image} 
                                    alt={meal.recipe.name}
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium">{meal.recipe.name}</h3>
                                  <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{meal.recipe.prepTime || meal.recipe.prep_time}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      <span>{meal.recipe.servings} servings</span>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {meal.recipe.dietaryInfo && meal.recipe.dietaryInfo.slice(0, 2).map((info: string) => (
                                      <span 
                                        key={info} 
                                        className="px-2 py-0.5 bg-cheffy-olive text-cheffy-cream text-xs rounded-full"
                                      >
                                        {info}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleViewShoppingList}
                className="bg-cheffy-brown hover:bg-cheffy-brown/90 transition-opacity w-full flex items-center gap-2 justify-center"
              >
                <ShoppingCart className="h-5 w-5" />
                View Optimized Shopping List
              </Button>
            </div>
          </>
        )}
      </main>
      
      {/* Expanded recipe modal */}
      {expandedRecipe && (
        <RecipeExpanded 
          recipe={expandedRecipe} 
          onClose={() => setExpandedRecipe(null)} 
        />
      )}
      
      <NavBar />
    </div>
  );
};

export default MealPlanPage;
