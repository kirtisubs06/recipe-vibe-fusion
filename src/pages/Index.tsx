
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeCard from '@/components/RecipeCard';
import VibeSelection from '@/components/VibeSelection';
import NavBar from '@/components/NavBar';
import { mockRecipes } from '@/data/mockRecipes';
import { toast } from '@/components/ui/sonner';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Index = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'vibes' | 'recipes'>('vibes');
  const [filteredRecipes, setFilteredRecipes] = useState(mockRecipes);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [likedRecipes, setLikedRecipes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // In a real app, you would filter recipes based on search query
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4">
        <div className="flex flex-col max-w-md mx-auto gap-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-recipe-terracota">
              Recipe Vibe
            </h1>
            {currentView === 'recipes' && 
              <div className="text-sm font-medium px-3 py-1 bg-recipe-sunset/20 text-recipe-rojo rounded-full">
                {currentRecipeIndex + 1}/{filteredRecipes.length}
              </div>
            }
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search recipes..." 
              className="pl-10 bg-card shadow-sm"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        {currentView === 'vibes' ? (
          <VibeSelection onVibeSelect={handleVibeSelect} />
        ) : (
          <div className="flex justify-center mt-6">
            <div className="w-full">
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
