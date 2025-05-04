
import React from 'react';
import { Search, Home, Heart, User, ChefHat, Receipt, Map, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavBar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-10">
      <div className="flex justify-around items-center py-2">
        <Link to="/" className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-recipe-primary' : 'text-gray-500'}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link to="/meal-plan" className={`flex flex-col items-center p-2 ${isActive('/meal-plan') ? 'text-recipe-primary' : 'text-gray-500'}`}>
          <Map className="h-6 w-6" />
          <span className="text-xs mt-1">Meal Plan</span>
        </Link>
        
        <div className="relative -mt-5">
          <Link to="/receipt-upload" className="flex items-center justify-center rounded-full w-14 h-14 bg-recipe-primary text-white shadow-lg">
            <Receipt className="h-7 w-7" />
          </Link>
        </div>
        
        <Link to="/shopping-list" className={`flex flex-col items-center p-2 ${isActive('/shopping-list') ? 'text-recipe-primary' : 'text-gray-500'}`}>
          <ShoppingCart className="h-6 w-6" />
          <span className="text-xs mt-1">Shopping</span>
        </Link>
        
        <Link to="/profile" className={`flex flex-col items-center p-2 ${isActive('/profile') ? 'text-recipe-primary' : 'text-gray-500'}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
