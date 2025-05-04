
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Download, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import NavBar from '@/components/NavBar';
import {
  Table,
  TableBody,
  TableCell,
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

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Produce': return 'bg-cheffy-olive text-white';
      case 'Meat & Seafood': return 'bg-cheffy-brown text-white';
      case 'Dairy': return 'bg-cheffy-cream text-cheffy-brown';
      default: return 'bg-cheffy-brown text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-10">
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
              Shopping List
            </h1>
          </div>
          <div className="text-sm font-medium px-3 py-1 bg-cheffy-brown/20 text-cheffy-cream rounded-full">
            {checkedCount}/{rawShoppingList.length}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-medium mb-2">Optimized Shopping List</h2>
          <p className="text-muted-foreground">
            We've organized ingredients based on store layout
          </p>
        </div>
        
        {Object.entries(categorizedItems).map(([category, items]) => 
          items.length > 0 && (
            <div key={category} className="mb-6">
              <h3 className={`text-md font-semibold mb-2 ${getCategoryColor(category)} px-3 py-2 rounded-md inline-block`}>
                {category}
              </h3>
              <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                <Table>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow 
                        key={item}
                        className={checkedItems[item] ? "bg-muted/30" : ""}
                      >
                        <TableCell className="p-2 w-10">
                          <button 
                            className={`w-6 h-6 rounded-full ${
                              checkedItems[item] 
                                ? 'bg-cheffy-brown border-cheffy-brown text-white' 
                                : 'border border-gray-300'
                            } flex items-center justify-center`}
                            onClick={() => toggleItemCheck(item)}
                          >
                            {checkedItems[item] && <Check className="h-3 w-3" />}
                          </button>
                        </TableCell>
                        <TableCell 
                          className={`p-3 ${checkedItems[item] ? 'line-through text-muted-foreground' : ''}`}
                          onClick={() => toggleItemCheck(item)}
                        >
                          {item}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )
        )}

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleShare}
            className="bg-cheffy-brown hover:bg-cheffy-brown/90 transition-opacity w-full flex items-center gap-2 justify-center"
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
