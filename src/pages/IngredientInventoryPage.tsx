
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import { useUserPreferences } from '@/store/userPreferences';
import { toast } from '@/components/ui/sonner';

interface InventoryItem {
  item: string;
  quantity: number;
  unitPrice?: number;
  total?: number;
}

const IngredientInventoryPage = () => {
  const [newItem, setNewItem] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<string>('1');
  const { currentIngredients, addIngredient, removeIngredient, clearIngredients } = useUserPreferences();
  const navigate = useNavigate();

  const handleAddItem = () => {
    if (newItem.trim() === '') {
      toast.error('Please enter an ingredient name');
      return;
    }

    const quantity = parseFloat(newQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    addIngredient({
      item: newItem.trim(),
      quantity,
      unitPrice: 0,
      total: 0
    });

    setNewItem('');
    setNewQuantity('1');
    toast.success(`Added ${newItem} to your inventory`);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleContinue = () => {
    navigate('/home');
  };

  const handleSkip = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display mb-6 text-cheffy-cream">My Ingredients</h1>
        <p className="text-lg text-cheffy-cream mb-8">
          Enter ingredients you currently have in your kitchen to get personalized recipe recommendations, or skip to browse all recipes.
        </p>

        <div className="bg-card rounded-lg p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow">
              <Input 
                placeholder="Enter ingredient (e.g., tomatoes, chicken, rice)"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-32">
              <Input 
                type="number"
                placeholder="Qty"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                onKeyDown={handleKeyDown}
                min="0"
                step="0.1"
                className="w-full"
              />
            </div>
            <Button onClick={handleAddItem} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>

          <div className="rounded-md border mb-6 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Ingredient</TableHead>
                  <TableHead className="w-[30%]">Quantity</TableHead>
                  <TableHead className="w-[10%]"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentIngredients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No ingredients added yet. Add some ingredients to get started or skip to browse all recipes.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentIngredients.map((item) => (
                    <TableRow key={item.item}>
                      <TableCell className="font-medium">{item.item}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeIngredient(item.item)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => clearIngredients()}
              disabled={currentIngredients.length === 0}
            >
              Clear All
            </Button>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleContinue}>
                Continue to Recipes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientInventoryPage;
