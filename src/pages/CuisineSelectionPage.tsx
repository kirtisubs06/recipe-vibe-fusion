import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import NavBar from '@/components/NavBar';
import { useUserPreferences } from '@/store/userPreferences';

// Define cuisine types with images and flavors
const availableCuisines = [
  { 
    id: 'italian', 
    name: 'Italian', 
    image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?q=80&w=2070&auto=format&fit=crop',
    flavors: 'Rich tomato sauces, aromatic herbs, olive oil, aged cheeses'
  },
  { 
    id: 'chinese', 
    name: 'Chinese', 
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=1992&auto=format&fit=crop',
    flavors: 'Umami-rich soy sauce, ginger, garlic, balanced sweet and savory'
  },
  { 
    id: 'mexican', 
    name: 'Mexican', 
    image: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?q=80&w=2070&auto=format&fit=crop',
    flavors: 'Vibrant chilies, zesty lime, fresh cilantro, earthy cumin'
  },
  { 
    id: 'indian', 
    name: 'Indian', 
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=2036&auto=format&fit=crop',
    flavors: 'Complex spices, aromatic curry, warming garam masala, cooling yogurt'
  },
  { 
    id: 'japanese', 
    name: 'Japanese', 
    image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?q=80&w=1964&auto=format&fit=crop',
    flavors: 'Delicate dashi, umami-rich miso, fresh seafood, subtle wasabi'
  },
  { 
    id: 'thai', 
    name: 'Thai', 
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=2070&auto=format&fit=crop',
    flavors: 'Balanced sweet, sour, salty, and spicy; lemongrass, fish sauce, lime'
  },
  { 
    id: 'mediterranean', 
    name: 'Mediterranean', 
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=2071&auto=format&fit=crop',
    flavors: 'Fresh herbs, olive oil, lemon, garlic, yogurt, simple preparations'
  },
  { 
    id: 'american', 
    name: 'American', 
    image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?q=80&w=2069&auto=format&fit=crop',
    flavors: 'Smoky barbecue, melted cheese, comfort food, diverse influences'
  },
];

const CuisineSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  
  // Get user preferences store functions
  const { setCuisines, selectedCuisines: storedCuisines } = useUserPreferences();
  
  // Load stored cuisines on component mount
  useEffect(() => {
    if (storedCuisines.length > 0) {
      setSelectedCuisines(storedCuisines);
    }
  }, [storedCuisines]);
  
  const toggleCuisine = (cuisineId: string) => {
    if (selectedCuisines.includes(cuisineId)) {
      setSelectedCuisines(selectedCuisines.filter(id => id !== cuisineId));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisineId]);
    }
  };
  
  const handlePlanMeals = () => {
    if (selectedCuisines.length === 0) {
      toast("Please select at least one cuisine", {
        description: "You need to choose cuisines for your meal plan",
      });
      return;
    }
    
    // Store selected cuisines in our global store
    setCuisines(selectedCuisines);
    
    // Navigate to meal plan page with selected cuisines
    navigate('/meal-plan', { state: { selectedCuisines } });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4">
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
            <h1 className="text-2xl font-bold text-cheffy-cream">
              Choose Cuisines
            </h1>
          </div>
          <div className="text-sm font-medium px-3 py-1 bg-cheffy-brown/20 text-cheffy-cream rounded-full">
            {selectedCuisines.length} selected
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-medium mb-2">What cuisines do you want this week?</h2>
          <p className="text-muted-foreground">
            Select multiple cuisines to create a diverse weekly meal plan
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {availableCuisines.map((cuisine) => (
            <div
              key={cuisine.id}
              onClick={() => toggleCuisine(cuisine.id)}
              className={`relative overflow-hidden rounded-xl shadow-md cursor-pointer transition-all ${
                selectedCuisines.includes(cuisine.id)
                  ? 'ring-2 ring-cheffy-brown ring-offset-1 scale-95'
                  : 'hover:scale-105'
              }`}
            >
              <div className="aspect-square">
                <img
                  src={cuisine.image}
                  alt={cuisine.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="text-white font-medium">{cuisine.name}</div>
                  <div className="text-white/80 text-xs mt-1">{cuisine.flavors}</div>
                </div>
                {selectedCuisines.includes(cuisine.id) && (
                  <div className="absolute inset-0 bg-cheffy-brown/20 flex items-center justify-center">
                    <div className="bg-cheffy-brown text-white rounded-full w-8 h-8 flex items-center justify-center">
                      <Check className="h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handlePlanMeals}
            className="bg-cheffy-brown hover:bg-cheffy-brown/90 transition-opacity w-full"
            disabled={selectedCuisines.length === 0}
          >
            Create Meal Plan
          </Button>
        </div>
      </main>
      
      <NavBar />
    </div>
  );
};

export default CuisineSelectionPage;
