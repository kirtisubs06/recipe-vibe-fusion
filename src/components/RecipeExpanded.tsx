
import React from 'react';
import { Clock, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Recipe } from '@/services/supabaseService';

interface RecipeExpandedProps {
  recipe: Recipe | null;
  onClose: () => void;
}

const RecipeExpanded: React.FC<RecipeExpandedProps> = ({ recipe, onClose }) => {
  if (!recipe) {
    return null;
  }

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
        
        <ScrollArea className="flex-1 p-4">
          {/* Recipe info */}
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cheffy-brown" />
              <span>{recipe.prep_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cheffy-brown" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
          
          {/* Recipe description */}
          <div className="mb-6">
            <p className="text-gray-700">{recipe.description}</p>
          </div>
          
          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-cheffy-brown">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="h-3 w-3 mt-1.5 rounded-full bg-cheffy-brown flex-shrink-0"></div>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-cheffy-brown">Instructions</h3>
            <ol className="space-y-4">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="bg-cheffy-brown text-white rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
          
          {/* Dietary info */}
          {recipe.dietary_info && recipe.dietary_info.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-cheffy-brown">Dietary Information</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.dietary_info.map((info, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 bg-cheffy-olive text-cheffy-cream text-xs rounded-full"
                  >
                    {info}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default RecipeExpanded;
