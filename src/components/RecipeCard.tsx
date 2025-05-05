
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { saveRecipeInteraction } from '@/services/supabaseService';
import { toast } from '@/components/ui/sonner';

type RecipeCardProps = {
  recipe: {
    id: string;
    name: string;
    image: string;
    description: string;
    prepTime: string;
    vibes: string[];
    dietaryInfo: string[];
  };
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onViewDetails: (id: string) => void;
};

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onLike,
  onDislike,
  onViewDetails,
}) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isProcessingInteraction, setIsProcessingInteraction] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 100) {
      // Swiped left
      handleDislike();
    } else if (touchEndX - touchStartX > 100) {
      // Swiped right
      handleLike();
    }
  };

  const handleLike = async () => {
    if (isProcessingInteraction) return;
    
    setIsProcessingInteraction(true);
    setSwipeDirection('right');
    onLike(recipe.id);
    
    try {
      await saveRecipeInteraction(recipe.id, 'like');
    } catch (error) {
      console.error("Error saving like:", error);
    } finally {
      setIsProcessingInteraction(false);
    }
  };

  const handleDislike = async () => {
    if (isProcessingInteraction) return;
    
    setIsProcessingInteraction(true);
    setSwipeDirection('left');
    onDislike(recipe.id);
    
    try {
      await saveRecipeInteraction(recipe.id, 'dislike');
    } catch (error) {
      console.error("Error saving dislike:", error);
    } finally {
      setIsProcessingInteraction(false);
    }
  };

  return (
    <div 
      className={`recipe-card ${swipeDirection === 'right' ? 'animate-card-swipe-right' : swipeDirection === 'left' ? 'animate-card-swipe-left' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-64">
        <img 
          src={recipe.image} 
          alt={recipe.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {recipe.vibes.slice(0, 1).map(vibe => (
            <span key={vibe} className="recipe-tag vibe-tag">{vibe}</span>
          ))}
          {recipe.dietaryInfo.slice(0, 1).map(diet => (
            <span key={diet} className="recipe-tag diet-tag">{diet}</span>
          ))}
        </div>
      </div>
      
      <div className="recipe-card-content">
        <h3 className="text-xl font-bold">{recipe.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="recipe-tag time-tag">{recipe.prepTime}</span>
          <Button 
            onClick={() => onViewDetails(recipe.id)}
            size="sm" 
            variant="outline"
            className="flex items-center gap-1"
          >
            View <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {!swipeDirection && (
          <div className="flex justify-between mt-4">
            <Button 
              onClick={handleDislike}
              variant="outline" 
              size="icon" 
              className="rounded-full bg-white border-gray-300 hover:bg-gray-100"
              disabled={isProcessingInteraction}
            >
              ✕
            </Button>
            <Button 
              onClick={handleLike}
              variant="outline" 
              size="icon" 
              className="rounded-full bg-white border-recipe-mint text-recipe-mint hover:bg-recipe-mint hover:text-white"
              disabled={isProcessingInteraction}
            >
              ♥
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
