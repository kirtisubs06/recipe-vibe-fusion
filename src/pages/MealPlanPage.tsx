
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import NavBar from '@/components/NavBar';
import { mockRecipes } from '@/data/mockRecipes';

// Days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Mock function to simulate AI meal planning
const generateMealPlan = (cuisines: string[]) => {
  // In a real implementation, this would call an AI API
  // For now, we'll just randomly select recipes that match the cuisines
  
  const mealPlan = daysOfWeek.map(day => {
    // Filter recipes by selected cuisines (using vibes as proxy for cuisines)
    const matchingRecipes = mockRecipes.filter(recipe => 
      cuisines.some(cuisine => recipe.vibes.includes(cuisine))
    );
    
    // If no direct matches, use any recipe
    const availableRecipes = matchingRecipes.length > 0 ? matchingRecipes : mockRecipes;
    
    // Randomly select a recipe for the day
    const selectedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
    
    return {
      day,
      recipe: selectedRecipe,
    };
  });
  
  return mealPlan;
};

// Mock function to generate shopping list
const generateShoppingList = (mealPlan: { day: string; recipe: any }[]) => {
  // In a real implementation, this would:
  // 1. Extract all ingredients from the meal plan
  // 2. Compare with user's inventory from receipt scanning
  // 3. Remove what the user already has
  // 4. Group and optimize the remaining ingredients
  
  // For now, we'll just collect unique ingredients from all recipes
  const allIngredients = mealPlan.flatMap(day => day.recipe.ingredients);
  
  // Remove duplicates (simplified)
  const uniqueIngredients = [...new Set(allIngredients)];
  
  return uniqueIngredients;
};

const MealPlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mealPlan, setMealPlan] = useState<any[]>([]);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get selected cuisines from location state
  const selectedCuisines = location.state?.selectedCuisines || [];
  
  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      // Generate meal plan based on selected cuisines
      const generatedMealPlan = generateMealPlan(selectedCuisines);
      setMealPlan(generatedMealPlan);
      
      // Generate shopping list
      const generatedShoppingList = generateShoppingList(generatedMealPlan);
      setShoppingList(generatedShoppingList);
      
      setIsLoading(false);
      
      toast("Your meal plan is ready!", {
        description: "We've optimized recipes based on your preferences",
      });
    }, 2000);
  }, [selectedCuisines]);

  const handleViewRecipe = (recipeId: string) => {
    navigate(`/recipe/${recipeId}`);
  };
  
  const handleViewShoppingList = () => {
    navigate('/shopping-list', { state: { shoppingList } });
  };

  const getDayColor = (index: number) => {
    const colors = [
      'bg-recipe-terracota',
      'bg-recipe-rojo',
      'bg-recipe-olive',
      'bg-blue-500',
      'bg-purple-500',
      'bg-recipe-terracota',
      'bg-recipe-sunset'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card bg-opacity-50 backdrop-blur-sm shadow-sm p-4">
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-recipe-terracota to-recipe-rojo bg-clip-text text-transparent">
              Weekly Meal Plan
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-recipe-terracota text-recipe-terracota"
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
            <div className="w-16 h-16 border-4 border-recipe-terracota border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Creating your optimized meal plan...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-xl font-medium mb-2">Your Weekly Meal Plan</h2>
              <p className="text-muted-foreground">
                We've created a balanced plan with your selected cuisines
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
                              className="px-2 py-0.5 bg-recipe-olive/10 text-recipe-olive text-xs rounded-full"
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
                className="bg-gradient-to-r from-recipe-terracota to-recipe-rojo hover:opacity-90 transition-opacity w-full flex items-center gap-2 justify-center"
              >
                <ShoppingCart className="h-5 w-5" />
                View Shopping List
              </Button>
            </div>
          </>
        )}
      </main>
      
      <NavBar />
    </div>
  );
};

export default MealPlanPage;
