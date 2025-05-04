
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to main page after 2.5 seconds
    const timer = setTimeout(() => {
      navigate('/home');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cheffy-olive">
      <div className="animate-pulse">
        <div className="flex flex-col items-center">
          <img 
            src="/lovable-uploads/86286b24-5a62-4fe2-9370-178d77d49428.png" 
            alt="Cheffy Logo" 
            className="h-32 w-32 mb-4"
          />
          <h1 className="text-6xl font-script text-cheffy-cream mb-2">Cheffy</h1>
          <p className="text-cheffy-cream/90 text-xl">Shop. Plan. Save. Eat!</p>
        </div>
      </div>

      <div className="mt-16">
        <div className="animate-spin h-8 w-8 border-4 border-cheffy-cream border-t-transparent rounded-full"></div>
      </div>
    </div>
  );
};

export default LoadingPage;
