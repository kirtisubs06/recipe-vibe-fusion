
import React from 'react';
import { Search, Home, Heart, User, ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-10">
      <div className="flex justify-around items-center py-2">
        <Link to="/" className="flex flex-col items-center p-2 text-recipe-primary">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/search" className="flex flex-col items-center p-2 text-gray-500">
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Explore</span>
        </Link>
        <div className="relative -mt-5">
          <Link to="/create" className="flex items-center justify-center rounded-full w-14 h-14 bg-recipe-primary text-white shadow-lg">
            <ChefHat className="h-7 w-7" />
          </Link>
        </div>
        <Link to="/favorites" className="flex flex-col items-center p-2 text-gray-500">
          <Heart className="h-6 w-6" />
          <span className="text-xs mt-1">Favorites</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center p-2 text-gray-500">
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
