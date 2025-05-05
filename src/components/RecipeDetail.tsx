
import React from 'react';
import { ArrowLeft, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

type RecipeDetailProps = {
  recipe: {
    id: string;
    name: string;
    image: string;
    description: string;
    prepTime: string;
    servings: number;
    ingredients: string[];
    instructions: string[];
    vibes: string[];
    dietaryInfo: string[];
  };
  onBack: () => void;
};

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack }) => {
  return (
    <div className="recipe-detail">
      <div className="sticky top-0 z-10 bg-white p-4 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">{recipe.name}</h2>
      </div>
      
      <div className="relative w-full h-64">
        <img 
          src={recipe.image} 
          alt={recipe.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <div className="flex gap-2">
            {recipe.vibes.map(vibe => (
              <span key={vibe} className="recipe-tag vibe-tag">{vibe}</span>
            ))}
            {recipe.dietaryInfo.map(diet => (
              <span key={diet} className="recipe-tag diet-tag">{diet}</span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cheffy-brown" />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cheffy-brown" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
        
        <div>
          <p className="text-gray-700">{recipe.description}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="h-3 w-3 mt-1.5 rounded-full bg-cheffy-brown flex-shrink-0"></div>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Instructions</h3>
          <ol className="space-y-4">
            {recipe.instructions.map((step, idx) => (
              <li key={idx} className="flex gap-4">
                <div className="bg-cheffy-brown text-cheffy-cream rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center">
                  {idx + 1}
                </div>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
