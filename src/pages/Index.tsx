
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeCard from '@/components/RecipeCard';
import VibeSelection from '@/components/VibeSelection';
import NavBar from '@/components/NavBar';
import { mockRecipes } from '@/data/mockRecipes';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'vibes' | 'recipes'>('vibes');
  const [filteredRecipes, setFilteredRecipes] = useState(mockRecipes);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [likedRecipes, setLikedRecipes] = useState<string[]>([]);

  const handleVibeSelect = (selectedVibes: string[]) => {
    if (selectedVibes.length === 0) {
      setFilteredRecipes(mockRecipes);
    } else {
      const filtered = mockRecipes.filter(recipe => 
        recipe.vibes.some(vibe => selectedVibes.includes(vibe))
      );
      setFilteredRecipes(filtered.length > 0 ? filtered : mockRecipes);
    }
    setCurrentRecipeIndex(0);
    setCurrentView('recipes');
    toast("Recipes matched to your vibe!", {
      description: "Swipe right to save, left to skip",
    });
  };

  const handleLike = (id: string) => {
    if (!likedRecipes.includes(id)) {
      setLikedRecipes([...likedRecipes, id]);
      toast("Recipe saved to favorites!", {
        description: "You can find it in your favorites tab",
      });
    }
    handleNextRecipe();
  };

  const handleDislike = () => {
    handleNextRecipe();
  };

  const handleNextRecipe = () => {
    if (currentRecipeIndex < filteredRecipes.length - 1) {
      setTimeout(() => {
        setCurrentRecipeIndex(currentRecipeIndex + 1);
      }, 300);
    } else {
      // End of recipes
      setTimeout(() => {
        setCurrentView('vibes');
        toast("You've seen all recipes!", {
          description: "Try selecting different vibes",
        });
      }, 300);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-recipe-primary">Recipe Vibe</h1>
          <div className="text-sm text-gray-600">
            {currentView === 'recipes' && 
              `${currentRecipeIndex + 1}/${filteredRecipes.length}`}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {currentView === 'vibes' ? (
          <VibeSelection onVibeSelect={handleVibeSelect} />
        ) : (
          <div className="flex justify-center mt-4">
            <div className="w-full max-w-md">
              {filteredRecipes.length > 0 && currentRecipeIndex < filteredRecipes.length && (
                <RecipeCard 
                  recipe={filteredRecipes[currentRecipeIndex]} 
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onViewDetails={handleViewDetails}
                />
              )}
            </div>
          </div>
        )}
      </main>
      
      <NavBar />
    </div>
  );
};

export default Index;
