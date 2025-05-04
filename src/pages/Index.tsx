
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import RecipeCard from '@/components/RecipeCard';
import VibeSelection from '@/components/VibeSelection';
import { mockRecipes } from '@/data/mockRecipes';
import NavBar from '@/components/NavBar';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Mock query that would normally fetch from an API
  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes', selectedVibe, selectedDiet],
    queryFn: () => {
      // Simulate API filtering
      return mockRecipes.filter(recipe => {
        const matchesVibe = !selectedVibe || recipe.vibes.includes(selectedVibe);
        const matchesDiet = !selectedDiet || recipe.dietaryInfo.includes(selectedDiet);
        return matchesVibe && matchesDiet;
      });
    },
  });

  const handleLike = (id: string) => {
    console.log(`Liked recipe: ${id}`);
    // Add like functionality here
  };

  const handleDislike = (id: string) => {
    console.log(`Disliked recipe: ${id}`);
    // Add dislike functionality here
  };

  const handleViewDetails = (id: string) => {
    navigate(`/recipe/${id}`);
  };
  
  const handleVibeSelect = (vibes: string[]) => {
    // For simplicity, we'll just use the first selected vibe
    setSelectedVibe(vibes.length > 0 ? vibes[0] : null);
  };
  
  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Header with Logo */}
      <div className="pt-6 pb-4 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <img 
            src="/lovable-uploads/86286b24-5a62-4fe2-9370-178d77d49428.png" 
            alt="Cheffy Logo" 
            className="h-12 w-12"
          />
          <div>
            <h1 className="text-4xl font-script text-cheffy-cream">Cheffy</h1>
            <p className="text-cheffy-cream/90 text-sm">Shop. Plan. Save. Eat!</p>
          </div>
        </div>
      </div>
      
      {/* Vibe and Diet Selections */}
      <div className="px-4 mb-4">
        <VibeSelection 
          onVibeSelect={handleVibeSelect}
        />
      </div>
      
      {/* Recipe Cards */}
      <div className="flex-1 px-4 pb-4">
        <div className="grid grid-cols-1 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onLike={handleLike}
              onDislike={handleDislike}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>
      
      {/* Navigation */}
      <NavBar />
    </div>
  );
};

export default Index;
