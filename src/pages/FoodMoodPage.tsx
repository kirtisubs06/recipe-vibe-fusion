
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const FoodMoodPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set loading to false after a short delay to show loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cheffy-olive">
      {/* Header with back button */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-cheffy-olive shadow-md">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleGoBack}
          className="text-cheffy-cream hover:text-cheffy-cream/80"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="font-bold text-xl text-cheffy-cream">Food Mood</div>
        <div className="w-6"></div> {/* Empty div for alignment */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-cheffy-cream border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <iframe 
            src="https://artsandculture.google.com/experiment/food-mood/HwHnGalZ3up0EA?hl=en&cp=e30." 
            className="w-full h-full flex-1" 
            title="Google Food Mood"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {/* Navigation Bar */}
      <NavBar />
    </div>
  );
};

export default FoodMoodPage;
