
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Download, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import NavBar from '@/components/NavBar';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { OptimizedGroceryItem } from '@/services/claudeService';
import { useUserPreferences } from '@/store/userPreferences';

const ShoppingListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Get user preferences
  const { currentIngredients } = useUserPreferences();
  
  // Get optimized shopping list from location state
  const optimizedList = location.state?.shoppingList || [];
  const mealIdeas = location.state?.mealIdeas || [];
  
  // Group the shopping list by category
  const groupedItems = optimizedList.reduce((acc: Record<string, OptimizedGroceryItem[]>, item: OptimizedGroceryItem) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});
  
  // Categories ordered by typical grocery store layout
  const orderedCategories = [
    'Produce',
    'Meat & Seafood',
    'Dairy',
    'Bakery',
    'Grains & Pasta',
    'Canned Goods',
    'Spices & Herbs',
    'Pantry',
    'Frozen',
    'Other'
  ];
  
  // Sort categories by the ordered list
  const sortedCategories = Object.keys(groupedItems).sort(
    (a, b) => {
      const indexA = orderedCategories.indexOf(a);
      const indexB = orderedCategories.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    }
  );
  
  const toggleItemCheck = (item: string) => {
    setCheckedItems({
      ...checkedItems,
      [item]: !checkedItems[item]
    });
  };
  
  const handleShare = () => {
    // Generate a CSV of the shopping list
    const csvContent = ["Item,Quantity,Category,Estimated Cost"]
      .concat(optimizedList.map((item: OptimizedGroceryItem) => 
        `${item.item},${item.quantity},${item.category},$${item.estimatedCost.toFixed(2)}`))
      .join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(csvContent)
      .then(() => {
        toast("Shopping list copied to clipboard!", {
          description: "You can now paste it to share with others",
        });
      })
      .catch(() => {
        toast("Failed to copy", {
          description: "Could not access clipboard",
        });
      });
  };
  
  // Calculate totals
  const totalItems = optimizedList.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCost = optimizedList.reduce(
    (sum: number, item: OptimizedGroceryItem) => sum + item.estimatedCost, 
    0
  );

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Produce': return 'bg-cheffy-olive text-white';
      case 'Meat & Seafood': return 'bg-cheffy-brown text-white';
      case 'Dairy': return 'bg-cheffy-cream text-cheffy-brown';
      case 'Bakery': return 'bg-amber-200 text-amber-800';
      case 'Grains & Pasta': return 'bg-amber-600 text-white';
      case 'Canned Goods': return 'bg-slate-400 text-white';
      case 'Pantry': return 'bg-orange-300 text-orange-800';
      case 'Spices & Herbs': return 'bg-green-600 text-white';
      case 'Frozen': return 'bg-blue-400 text-white';
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
              Optimized Shopping List
            </h1>
          </div>
          <div className="text-sm font-medium px-3 py-1 bg-cheffy-brown/20 text-cheffy-cream rounded-full">
            ${totalCost.toFixed(2)}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 max-w-md">
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-2 text-center">Weekly Grocery List</h2>
          <p className="text-muted-foreground text-center mb-4">
            We've optimized your list based on your current inventory and meal preferences
          </p>
          <div className="flex justify-between items-center px-4 py-2 bg-card rounded-lg shadow-sm mb-4">
            <span>Progress</span>
            <span className="font-medium">{checkedCount}/{totalItems} items</span>
          </div>
        </div>
        
        {sortedCategories.map((category) => (
          <div key={category} className="mb-6">
            <h3 className={`text-md font-semibold mb-2 ${getCategoryColor(category)} px-3 py-2 rounded-md inline-block`}>
              {category}
            </h3>
            <div className="bg-card rounded-xl shadow-sm overflow-hidden">
              <Table>
                <TableBody>
                  {groupedItems[category].map((item: OptimizedGroceryItem) => (
                    <TableRow 
                      key={item.item}
                      className={checkedItems[item.item] ? "bg-muted/30" : ""}
                    >
                      <TableCell className="p-2 w-10">
                        <button 
                          className={`w-6 h-6 rounded-full ${
                            checkedItems[item.item] 
                              ? 'bg-cheffy-brown border-cheffy-brown text-white' 
                              : 'border border-gray-300'
                          } flex items-center justify-center`}
                          onClick={() => toggleItemCheck(item.item)}
                        >
                          {checkedItems[item.item] && <Check className="h-3 w-3" />}
                        </button>
                      </TableCell>
                      <TableCell 
                        className={`p-3 ${checkedItems[item.item] ? 'line-through text-muted-foreground' : ''}`}
                        onClick={() => toggleItemCheck(item.item)}
                      >
                        <div className="flex flex-col">
                          <span>{item.item}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.quantity} - ${item.estimatedCost.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}

        {mealIdeas.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-medium mb-3">Meal Ideas</h3>
            <Accordion type="single" collapsible className="bg-card rounded-xl shadow-sm overflow-hidden">
              {mealIdeas.map((meal: any, index: number) => (
                <AccordionItem value={`meal-${index}`} key={index}>
                  <AccordionTrigger className="px-4 py-3">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{meal.name}</span>
                      <span className="text-xs text-muted-foreground">{meal.cuisineType} • {meal.mealType}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3">
                    <div className="text-sm">
                      <div className="font-medium mb-1">Ingredients:</div>
                      <ul className="list-disc pl-5">
                        {meal.ingredients.map((ingredient: string, i: number) => (
                          <li key={i} className="mb-1">
                            {ingredient}
                            {currentIngredients.some(item => 
                              item.item.toLowerCase().includes(ingredient.toLowerCase())) && 
                              <span className="text-xs ml-2 text-green-600">(in inventory)</span>
                            }
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleShare}
            className="bg-cheffy-brown hover:bg-cheffy-brown/90 transition-opacity flex items-center gap-2 justify-center flex-1"
          >
            <Download className="h-5 w-5" />
            Export List
          </Button>
          <Button
            onClick={() => navigate('/cuisine-selection')}
            variant="outline"
            className="border-cheffy-brown text-cheffy-cream hover:bg-cheffy-brown/10 flex-1"
          >
            Update Preferences
          </Button>
        </div>
      </main>
      
      <NavBar />
    </div>
  );
};

export default ShoppingListPage;
