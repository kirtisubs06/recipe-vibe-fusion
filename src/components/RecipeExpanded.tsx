
import React from 'react';
import { Clock, Users, X, Check, ShoppingCart, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Recipe } from '@/services/supabaseService';

interface RecipeExpandedProps {
  recipe: Recipe | null;
  onClose: () => void;
  userIngredients?: string[];
}

const RecipeExpanded: React.FC<RecipeExpandedProps> = ({ recipe, onClose, userIngredients = [] }) => {
  if (!recipe) {
    return null;
  }

  // Helper function to check if the user has an ingredient
  const isUserIngredient = (ingredient: string): boolean => {
    return userIngredients.some(item => 
      ingredient.toLowerCase().includes(item) || 
      item.includes(ingredient.toLowerCase())
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden relative">
        {/* Close button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-10" 
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
        
        {/* Recipe header image */}
        <div className="relative w-full h-48">
          <img 
            src={recipe.image} 
            alt={recipe.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h2 className="text-2xl font-bold text-white">{recipe.name}</h2>
          </div>
        </div>
        
        {/* Improved ScrollArea to ensure content is scrollable */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Recipe info */}
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-800">
                <Clock className="h-4 w-4 text-cheffy-brown" />
                <span className="font-medium">{recipe.prep_time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800">
                <Users className="h-4 w-4 text-cheffy-brown" />
                <span className="font-medium">{recipe.servings} servings</span>
              </div>
            </div>
            
            {/* Recipe description - better contrast */}
            <div className="mb-6">
              <p className="text-gray-900 text-base leading-relaxed font-medium">{recipe.description}</p>
            </div>
            
            {/* Ingredients with improved formatting */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-black border-b border-cheffy-brown pb-2 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-cheffy-brown" />
                Ingredients
              </h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, idx) => {
                  const hasIngredient = isUserIngredient(ingredient);
                  return (
                    <li key={idx} className="flex items-start gap-3 bg-gray-50 p-2 rounded-md border-l-4 border-l-solid border-l-cheffy-cream">
                      {hasIngredient ? (
                        <div className="mt-1 p-0.5 rounded-full bg-green-500">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="mt-1 p-0.5 rounded-full bg-orange-500">
                          <ShoppingCart className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <span className={`text-base font-medium ${hasIngredient ? "text-black" : "text-gray-800"}`}>
                        {ingredient}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {/* Instructions with better styling */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-black border-b border-cheffy-brown pb-2 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-cheffy-brown" />
                Instructions
              </h3>
              <ol className="space-y-6">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="bg-cheffy-brown text-white rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center mt-0.5 font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-base text-gray-800 leading-relaxed font-medium">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
            
            {/* Dietary info */}
            {recipe.dietary_info && recipe.dietary_info.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3 text-black border-b border-cheffy-brown pb-2">
                  Dietary Information
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.dietary_info.map((info, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1.5 bg-cheffy-olive text-white text-sm rounded-full font-medium"
                    >
                      {info}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preparation tips */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border-l-4 border-cheffy-brown">
              <h3 className="text-lg font-bold mb-2 text-black">
                Chef's Tips
              </h3>
              <p className="text-gray-800 italic">
                For best results, prepare all ingredients before starting. 
                {recipe.prep_time && recipe.prep_time.includes('min') 
                  ? " This recipe comes together quickly, so having everything measured and ready will make the process much smoother."
                  : " Allow adequate time for preparation to ensure the best flavor development."}
              </p>
            </div>

            {/* Ingredient availability summary */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 text-black">
                Shopping Summary
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-900 font-medium">
                    {recipe.ingredients.filter(i => isUserIngredient(i)).length} ingredients you have
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-orange-500" />
                  <span className="text-gray-900 font-medium">
                    {recipe.ingredients.filter(i => !isUserIngredient(i)).length} ingredients to buy
                  </span>
                </div>
              </div>
            </div>
            
            {/* Extra padding at bottom to ensure all content is scrollable */}
            <div className="h-8"></div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default RecipeExpanded;
