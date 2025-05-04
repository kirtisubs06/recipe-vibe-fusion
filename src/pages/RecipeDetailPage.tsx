
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeDetail from '@/components/RecipeDetail';
import { mockRecipes } from '@/data/mockRecipes';

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const recipe = mockRecipes.find(recipe => recipe.id === id);

  const handleBack = () => {
    navigate(-1);
  };

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
      <RecipeDetail recipe={recipe} onBack={handleBack} />
    </div>
  );
};

export default RecipeDetailPage;
