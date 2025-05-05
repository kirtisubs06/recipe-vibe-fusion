
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeDetail from '@/components/RecipeDetail';
import { getRecipeById } from '@/services/supabaseService';
import { Recipe } from '@/services/supabaseService';

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      
      const fetchedRecipe = await getRecipeById(id);
      setRecipe(fetchedRecipe);
      setLoading(false);
    };
    
    fetchRecipe();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="w-16 h-16 border-4 border-t-cheffy-cream rounded-full animate-spin"></div>
        <p className="mt-4 text-cheffy-cream">Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
        <button 
          onClick={handleBack}
          className="px-4 py-2 bg-recipe-primary text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <RecipeDetail 
        recipe={{
          id: recipe.id,
          name: recipe.name,
          image: recipe.image,
          description: recipe.description,
          prepTime: recipe.prep_time,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          vibes: recipe.vibes || [],
          dietaryInfo: recipe.dietary_info || []
        }} 
        onBack={handleBack} 
      />
    </div>
  );
};

export default RecipeDetailPage;
