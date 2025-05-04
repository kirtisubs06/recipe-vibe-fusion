
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import NavBar from '@/components/NavBar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock categories for shopping list organization
const categories = [
  'Produce',
  'Meat & Seafood',
  'Dairy',
  'Grains & Pasta',
  'Canned Goods',
  'Spices & Herbs',
  'Other'
];

// Mock function to categorize ingredients
const categorizeIngredients = (ingredients: string[]) => {
  // In a real implementation, this would use an AI model or database
  // For now, we'll just randomly assign ingredients to categories
  
  const categorized = categories.reduce((acc, category) => {
    acc[category] = [];
    return acc;
  }, {} as Record<string, string[]>);
  
  ingredients.forEach(ingredient => {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    categorized[randomCategory].push(ingredient);
  });
  
  return categorized;
};

const ShoppingListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Get shopping list from location state
  const rawShoppingList = location.state?.shoppingList || [];
  const categorizedItems = categorizeIngredients(rawShoppingList);
  
  const toggleItemCheck = (item: string) => {
    setCheckedItems({
      ...checkedItems,
      [item]: !checkedItems[item]
    });
  };
  
  const handleShare = () => {
    // In a real implementation, this would generate a shareable link or export
    toast("Shopping list copied to clipboard!", {
      description: "You can now paste it to share with others",
    });
  };
  
  const allChecked = rawShoppingList.length > 0 && 
    rawShoppingList.every(item => checkedItems[item]);
  
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-recipe-primary">Shopping List</h1>
          </div>
          <div className="text-sm text-gray-600">
            {checkedCount}/{rawShoppingList.length} items
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-medium mb-2">Optimized Shopping List</h2>
          <p className="text-gray-600">
            We've organized ingredients based on store layout
          </p>
        </div>
        
        {Object.entries(categorizedItems).map(([category, items]) => 
          items.length > 0 && (
            <div key={category} className="mb-6">
              <h3 className="text-md font-semibold mb-2 text-gray-700 bg-gray-100 p-2 rounded">
                {category}
              </h3>
              <Table>
                <TableBody>
                  {items.map((item) => (
                    <TableRow 
                      key={item}
                      className={checkedItems[item] ? "bg-gray-50" : ""}
                    >
                      <TableCell className="p-2">
                        <button 
                          className={`w-6 h-6 rounded-full border ${
                            checkedItems[item] 
                              ? 'bg-recipe-primary border-recipe-primary text-white' 
                              : 'border-gray-300'
                          } flex items-center justify-center`}
                          onClick={() => toggleItemCheck(item)}
                        >
                          {checkedItems[item] && <Check className="h-3 w-3" />}
                        </button>
                      </TableCell>
                      <TableCell 
                        className={`p-2 ${checkedItems[item] ? 'line-through text-gray-400' : ''}`}
                        onClick={() => toggleItemCheck(item)}
                      >
                        {item}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        )}

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleShare}
            className="bg-recipe-primary hover:bg-recipe-primary/90 w-full max-w-md flex items-center gap-2 justify-center"
          >
            <Download className="h-5 w-5" />
            Export Shopping List
          </Button>
        </div>
      </main>
      
      <NavBar />
    </div>
  );
};

export default ShoppingListPage;
