
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

// Days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Enhanced meal planning function that uses user preferences
const generateMealPlan = (cuisines: string[], dietaryPreferences: string[]) => {
  // In a real implementation, this would call an AI API
  // For now, we'll filter recipes based on cuisine and dietary preferences
  
  const mealPlan = daysOfWeek.map(day => {
    // Filter recipes by selected cuisines and dietary preferences
    const filteredRecipes = mockRecipes.filter(recipe => {
      // Check if recipe matches selected cuisines
      const matchesCuisine = cuisines.length === 0 || 
        cuisines.some(cuisine => recipe.vibes.includes(cuisine));
      
      // Check if recipe satisfies dietary preferences
      const satisfiesDiet = dietaryPreferences.length === 0 ||
        dietaryPreferences.every(pref => recipe.dietary_info.includes(pref));
      
      return matchesCuisine && satisfiesDiet;
    });
    
    // If no direct matches, use any recipe
    const availableRecipes = filteredRecipes.length > 0 ? filteredRecipes : mockRecipes;
    
    // Randomly select a recipe for the day
    const selectedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
    
    return {
      day,
      recipe: selectedRecipe,
    };
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
        // Generate meal plan based on cuisines and dietary preferences
        const generatedMealPlan = generateMealPlan(selectedCuisines, dietaryPreferences);
        setMealPlan(generatedMealPlan);
        
        // Generate optimized grocery list
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
          toast("Your meal plan is ready!", {
            description: "We've optimized recipes based on your preferences",
          });
          setToastShown(true);
        }
      } catch (error) {
        console.error("Error generating meal plan:", error);
        toast("Error generating meal plan", {
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
                We've created a balanced plan with your selected cuisines and dietary preferences
              </p>
            </div>
            
            <div className="space-y-4">
              {mealPlan.map((dayPlan, index) => (
                <div 
                  key={dayPlan.day} 
                  className="bg-card rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]"
                >
                  <div className="flex">
                    <div className={`w-1/4 sm:w-1/5 ${getDayColor(index)} text-white p-4 flex flex-col items-center justify-center`}>
                      <span className="font-bold">{dayPlan.day}</span>
                    </div>
                    <div 
                      className="w-3/4 sm:w-4/5 flex p-3 cursor-pointer"
                      onClick={() => handleViewRecipe(dayPlan.recipe.id)}
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden mr-3">
                        <img 
                          src={dayPlan.recipe.image} 
                          alt={dayPlan.recipe.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{dayPlan.recipe.name}</h3>
                        <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{dayPlan.recipe.prepTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{dayPlan.recipe.servings} servings</span>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {dayPlan.recipe.dietaryInfo.slice(0, 2).map((info: string) => (
                            <span 
                              key={info} 
                              className="px-2 py-0.5 bg-cheffy-olive text-white text-xs rounded-full"
                            >
                              {info}
                            </span>
                          ))}
                          {dayPlan.recipe.dietaryInfo.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{dayPlan.recipe.dietaryInfo.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
