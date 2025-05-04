
import React from 'react';
import { Home, Receipt, Map, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavBar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-cheffy-olive shadow-lg backdrop-blur-lg bg-opacity-95 border-t border-cheffy-brown/20 z-10">
      <div className="flex justify-around items-center py-2 px-2 max-w-md mx-auto">
        <Link to="/home" className={`nav-link ${isActive('/home') ? 'active' : 'inactive'}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1 font-medium">Home</span>
        </Link>
        
        <Link to="/meal-plan" className={`nav-link ${isActive('/meal-plan') ? 'active' : 'inactive'}`}>
          <Map className="h-6 w-6" />
          <span className="text-xs mt-1 font-medium">Plan</span>
        </Link>
        
        <div className="relative -mt-8">
          <Link 
            to="/receipt-upload" 
            className="flex items-center justify-center rounded-full w-16 h-16 bg-cheffy-brown text-cheffy-cream shadow-lg"
          >
            <Receipt className="h-7 w-7" />
          </Link>
        </div>
        
        <Link to="/shopping-list" className={`nav-link ${isActive('/shopping-list') ? 'active' : 'inactive'}`}>
          <ShoppingCart className="h-6 w-6" />
          <span className="text-xs mt-1 font-medium">Shop</span>
        </Link>
        
        <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : 'inactive'}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1 font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
