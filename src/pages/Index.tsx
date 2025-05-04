
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import RecipeCard from '@/components/RecipeCard';
import { mockRecipes } from '@/data/mockRecipes';
import NavBar from '@/components/NavBar';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Index = () => {
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const cuisines = [
    { 
      id: 'italian', 
      name: 'Italian', 
      image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?q=80&w=2070&auto=format&fit=crop',
      description: 'Rich tomato sauces, fresh herbs, olive oil, and aged cheeses create savory and aromatic experiences.' 
    },
    { 
      id: 'chinese', 
      name: 'Chinese', 
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=1992&auto=format&fit=crop',
      description: 'Bold umami flavors with garlic, ginger, and soy sauce balanced by subtle sweetness.' 
    },
    { 
      id: 'mexican', 
      name: 'Mexican', 
      image: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?q=80&w=2070&auto=format&fit=crop',
      description: 'Vibrant and zesty with chili peppers, lime, cilantro, and rich spices.' 
    },
    { 
      id: 'indian', 
      name: 'Indian', 
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=2036&auto=format&fit=crop',
      description: 'Complex and aromatic with layers of spices like cumin, cardamom, turmeric, and garam masala.' 
    },
    { 
      id: 'japanese', 
      name: 'Japanese', 
      image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?q=80&w=1964&auto=format&fit=crop',
      description: 'Delicate and refined with clean umami flavors from dashi, miso, and fresh seafood.' 
    },
    { 
      id: 'thai', 
      name: 'Thai', 
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=2070&auto=format&fit=crop',
      description: 'Perfect balance of sweet, sour, salty, and spicy with lemongrass, chili, lime, and fish sauce.' 
    },
  ];
  
  // Mock query that would normally fetch from an API
  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes', selectedCuisine, selectedDiet],
    queryFn: () => {
      // Simulate API filtering
      return mockRecipes.filter(recipe => {
        const matchesCuisine = !selectedCuisine || recipe.cuisine === selectedCuisine;
        const matchesDiet = !selectedDiet || recipe.dietaryInfo.includes(selectedDiet);
        return matchesCuisine && matchesDiet;
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
  
  const handleCuisineSelect = (cuisine: string) => {
    setSelectedCuisine(cuisine);
  };
  
  const [currentCuisineIndex, setCurrentCuisineIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const minSwipeDistance = 100;
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
    setSwipeDirection(null);
    setDragDistance(0);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const distance = currentX - touchStartX;
    setDragDistance(distance);
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${distance}px) rotate(${distance * 0.05}deg)`;
      
      if (distance > 0) {
        cardRef.current.style.boxShadow = '0 10px 20px rgba(0, 200, 0, 0.2)';
      } else if (distance < 0) {
        cardRef.current.style.boxShadow = '0 10px 20px rgba(255, 0, 0, 0.2)';
      } else {
        cardRef.current.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
      }
    }
  };
  
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(dragDistance) >= minSwipeDistance) {
      if (dragDistance > 0) {
        // Swiped right - like this cuisine
        setSwipeDirection('right');
        handleSwipeRight();
      } else {
        // Swiped left - skip this cuisine
        setSwipeDirection('left');
        handleSwipeLeft();
      }
    } else {
      // Reset if not swiped far enough
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
        cardRef.current.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
      }
    }
    
    setTouchStartX(0);
    setDragDistance(0);
  };
  
  // Mouse event handlers for desktop support
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStartX(e.clientX);
    setIsDragging(true);
    setSwipeDirection(null);
    setDragDistance(0);
    
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const distance = currentX - touchStartX;
    setDragDistance(distance);
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${distance}px) rotate(${distance * 0.05}deg)`;
      
      if (distance > 0) {
        cardRef.current.style.boxShadow = '0 10px 20px rgba(0, 200, 0, 0.2)';
      } else if (distance < 0) {
        cardRef.current.style.boxShadow = '0 10px 20px rgba(255, 0, 0, 0.2)';
      } else {
        cardRef.current.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
      }
    }
  };
  
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(dragDistance) >= minSwipeDistance) {
      if (dragDistance > 0) {
        // Swiped right - like this cuisine
        setSwipeDirection('right');
        handleSwipeRight();
      } else {
        // Swiped left - skip this cuisine
        setSwipeDirection('left');
        handleSwipeLeft();
      }
    } else {
      // Reset if not swiped far enough
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
        cardRef.current.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
      }
    }
    
    setTouchStartX(0);
    setDragDistance(0);
  };
  
  // Cleanup mouse events when component unmounts or when dragging stops
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMouseMove(e as unknown as React.MouseEvent);
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging]);
  
  const handleSwipeRight = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      cardRef.current.style.transform = 'translateX(150%) rotate(30deg)';
      cardRef.current.style.opacity = '0';
    }
    
    handleCuisineSelect(cuisines[currentCuisineIndex].id);
    
    setTimeout(() => {
      if (currentCuisineIndex < cuisines.length - 1) {
        setCurrentCuisineIndex(currentCuisineIndex + 1);
      }
      resetCardStyle();
    }, 300);
  };
  
  const handleSwipeLeft = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      cardRef.current.style.transform = 'translateX(-150%) rotate(-30deg)';
      cardRef.current.style.opacity = '0';
    }
    
    setTimeout(() => {
      if (currentCuisineIndex < cuisines.length - 1) {
        setCurrentCuisineIndex(currentCuisineIndex + 1);
      }
      resetCardStyle();
    }, 300);
  };
  
  const resetCardStyle = () => {
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.style.transition = 'none';
        cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
        cardRef.current.style.opacity = '1';
        cardRef.current.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
        
        // Force reflow
        void cardRef.current.offsetWidth;
        
        // Re-enable the transition
        cardRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease';
      }
    }, 300);
  };
  
  return (
    <div className="flex flex-col min-h-screen pb-16 bg-cheffy-olive">
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
      
      {/* Cuisine Swipe Cards */}
      <div className="px-4 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-cheffy-cream">
          What cuisine are you craving?
        </h2>
        <div className="relative h-[400px]">
          {currentCuisineIndex < cuisines.length && (
            <div 
              ref={cardRef}
              className="absolute inset-0 transition-transform"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              style={{
                transition: 'transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease',
                cursor: 'grab'
              }}
            >
              <div className="w-full h-full relative bg-card rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={cuisines[currentCuisineIndex].image} 
                  alt={cuisines[currentCuisineIndex].name} 
                  className="w-full h-full object-cover"
                  draggable="false"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="w-full p-6">
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {cuisines[currentCuisineIndex].name}
                    </h3>
                    <p className="text-white/90 text-sm mb-4">
                      {cuisines[currentCuisineIndex].description}
                    </p>
                    <p className="text-white/90 text-sm">
                      Swipe right to select, swipe left to skip
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {currentCuisineIndex >= cuisines.length && (
            <div className="flex items-center justify-center h-full bg-card rounded-xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-cheffy-cream">Thanks for your selections!</h3>
                <p className="text-cheffy-cream/90 mb-4">
                  We've found some recipes based on your preferences.
                </p>
                <Button onClick={() => setCurrentCuisineIndex(0)} className="bg-cheffy-brown">
                  Choose Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Recipe Cards */}
      {selectedCuisine && (
        <div className="flex-1 px-4 pb-4">
          <h2 className="text-xl font-bold mb-4 text-cheffy-cream">
            {selectedCuisine.charAt(0).toUpperCase() + selectedCuisine.slice(1)} Recipes
          </h2>
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
            {recipes.length === 0 && (
              <div className="text-center p-8 bg-card rounded-xl">
                <p className="text-cheffy-cream">No recipes found. Try a different cuisine!</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <NavBar />
    </div>
  );
};

export default Index;
