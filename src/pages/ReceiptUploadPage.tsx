import React, { useState } from 'react';
import { Upload, ArrowLeft, Camera, X, FileText, Clipboard, Plus, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import NavBar from '@/components/NavBar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUserPreferences, ParsedReceiptItem } from '@/store/userPreferences';
import { supabase } from "@/integrations/supabase/client";

const ReceiptUploadPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [parsedItems, setParsedItems] = useState<ParsedReceiptItem[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('1');
  const [manualIngredients, setManualIngredients] = useState<ParsedReceiptItem[]>([]);
  
  // Get the addIngredients function from our user preferences store
  const { addIngredients, currentIngredients } = useUserPreferences();
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setUploadedImage(e.target.result);
          setParsedItems([]); // Clear previous results
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleCameraCapture = () => {
    document.getElementById('receipt-file-input')?.click();
  };

  const handleProcessReceipt = () => {
    if (!uploadedImage) {
      toast("Please upload a receipt first", {
        description: "We need a receipt image to process your ingredients",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    // Simulate OCR processing with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        
        // When processing is complete
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            simulateReceiptParsing();
            setActiveTab("results");
            toast("Receipt processed successfully!", {
              description: "Your receipt has been analyzed",
            });
          }, 500);
        }
        return newProgress;
      });
    }, 100);
  };

  // This function simulates the OCR and parsing logic from the Python code
  const simulateReceiptParsing = () => {
    // Simulate finding items from a receipt
    // In a real implementation, this would use an API call to a backend with the OCR logic
    const mockParsedItems: ParsedReceiptItem[] = [
      { 
        item: "Tomatoes", 
        quantity: 2, 
        unitPrice: 1.99, 
        total: 3.98 
      },
      { 
        item: "Chicken Breast", 
        quantity: 1.5, 
        unitPrice: 5.99, 
        total: 8.99 
      },
      { 
        item: "Rice", 
        quantity: 1, 
        unitPrice: 3.49, 
        total: 3.49 
      },
      { 
        item: "Bell Peppers", 
        quantity: 3, 
        unitPrice: 0.99, 
        total: 2.97 
      },
      { 
        item: "Onions", 
        quantity: 2, 
        unitPrice: 0.79, 
        total: 1.58 
      }
    ];
    
    setParsedItems(mockParsedItems);
  };

  const handleAddManualIngredient = () => {
    if (!newIngredientName.trim()) {
      toast.error("Ingredient name cannot be empty");
      return;
    }

    const quantity = parseFloat(newIngredientQuantity) || 1;
    
    // Create a new ingredient item
    const newItem: ParsedReceiptItem = {
      item: newIngredientName.trim(),
      quantity: quantity,
      unitPrice: 0, // We don't have this for manual entries
      total: 0 // We don't have this for manual entries
    };
    
    // Add to local state
    setManualIngredients([...manualIngredients, newItem]);
    
    // Save to Supabase
    saveIngredientToSupabase(newItem);
    
    // Clear the inputs
    setNewIngredientName('');
    setNewIngredientQuantity('1');
    
    toast.success(`Added ${newItem.item} to your ingredients`);
  };

  const saveIngredientToSupabase = async (ingredient: ParsedReceiptItem) => {
    try {
      const { data, error } = await supabase
        .from('groceries')
        .insert([
          { 
            ingredient: ingredient.item, 
            quantity: ingredient.quantity,
            user: 'current-user' // In a real app with auth, this would be the user ID
          }
        ]);
      
      if (error) {
        console.error("Error saving ingredient to Supabase:", error);
        toast.error("Failed to save ingredient to database");
      }
    } catch (err) {
      console.error("Exception saving ingredient to Supabase:", err);
    }
  };

  const handleSaveToInventory = () => {
    const itemsToAdd = [...parsedItems, ...manualIngredients];
    
    if (itemsToAdd.length === 0) {
      toast("No items to save", {
        description: "Please process a receipt or add ingredients manually",
      });
      return;
    }

    // Store the parsed items in our user preferences store
    addIngredients(itemsToAdd);

    toast("Items added to inventory", {
      description: `Added ${itemsToAdd.length} items to your ingredients inventory`,
    });
    
    // Navigate to the cuisine selection page
    navigate('/cuisine-selection');
  };

  const handleCopyToClipboard = () => {
    if (parsedItems.length === 0) return;
    
    const csvContent = ["Item,Quantity,Unit Price,Total"]
      .concat(parsedItems.map(item => 
        `${item.item},${item.quantity},${item.unitPrice.toFixed(2)},${item.total.toFixed(2)}`))
      .join('\n');
      
    navigator.clipboard.writeText(csvContent)
      .then(() => {
        toast("Copied to clipboard", {
          description: "Receipt data copied as CSV format",
        });
      })
      .catch(() => {
        toast("Failed to copy", {
          description: "Could not access clipboard",
        });
      });
  };

  const handleRemoveManualIngredient = async (index: number) => {
    const ingredientToRemove = manualIngredients[index];
    
    // Remove from local state
    const updatedIngredients = [...manualIngredients];
    updatedIngredients.splice(index, 1);
    setManualIngredients(updatedIngredients);
    
    // Remove from Supabase
    try {
      const { error } = await supabase
        .from('groceries')
        .delete()
        .eq('ingredient', ingredientToRemove.item)
        .eq('user', 'current-user'); // In a real app with auth, this would be the user ID
      
      if (error) {
        console.error("Error removing ingredient from Supabase:", error);
        toast.error("Failed to remove ingredient from database");
      }
    } catch (err) {
      console.error("Exception removing ingredient from Supabase:", err);
    }
    
    toast(`Removed ${ingredientToRemove.item}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4">
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
              Receipt Scanner
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="text-cheffy-cream">Upload Receipt</TabsTrigger>
            <TabsTrigger value="manual" className="text-cheffy-cream">Manual Entry</TabsTrigger>
            <TabsTrigger value="results" className="text-cheffy-cream">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="text-center">
                    <p className="text-cheffy-cream mb-6">
                      Upload a photo of your grocery receipt to extract ingredients
                    </p>
                  </div>

                  <div className="w-full bg-card rounded-xl shadow-sm overflow-hidden">
                    {uploadedImage ? (
                      <div className="relative">
                        <img 
                          src={uploadedImage} 
                          alt="Uploaded receipt" 
                          className="w-full h-auto object-contain"
                          style={{ maxHeight: "300px" }}
                        />
                        <Button 
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 rounded-full h-8 w-8"
                          onClick={() => setUploadedImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-cheffy-cream rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer hover:border-cheffy-orange transition-colors"
                        onClick={handleCameraCapture}
                        style={{ minHeight: "200px" }}
                      >
                        <div className="p-4 rounded-full bg-muted mb-4">
                          <Camera className="h-10 w-10 text-cheffy-orange" />
                        </div>
                        <p className="font-medium text-sm mb-2 text-cheffy-cream">Take a photo of your receipt</p>
                        <p className="text-xs text-cheffy-cream mb-2">or</p>
                        <label 
                          htmlFor="receipt-file-input"
                          className="text-cheffy-orange underline cursor-pointer text-sm"
                        >
                          Browse files
                        </label>
                      </div>
                    )}

                    <input
                      id="receipt-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    
                    {isProcessing && (
                      <div className="p-4 bg-muted/50">
                        <p className="text-sm font-medium mb-2 text-cheffy-cream">Processing receipt...</p>
                        <Progress value={progress} className="h-2 bg-muted" />
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleProcessReceipt} 
                    className="bg-cheffy-orange hover:bg-cheffy-orange/90 transition-opacity w-full text-white"
                    disabled={!uploadedImage || isProcessing}
                  >
                    {isProcessing ? "Processing..." : (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Extract Items from Receipt</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manual">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-cheffy-cream mb-4">
                      Manually add ingredients you have on hand
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <Label htmlFor="ingredient-name" className="text-cheffy-cream mb-1 block">Ingredient</Label>
                        <Input 
                          id="ingredient-name"
                          placeholder="e.g. Tomatoes" 
                          value={newIngredientName}
                          onChange={(e) => setNewIngredientName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddManualIngredient()}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ingredient-quantity" className="text-cheffy-cream mb-1 block">Quantity</Label>
                        <Input 
                          id="ingredient-quantity"
                          type="number" 
                          min="0.1"
                          step="0.1"
                          placeholder="1" 
                          value={newIngredientQuantity}
                          onChange={(e) => setNewIngredientQuantity(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddManualIngredient()}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleAddManualIngredient}
                      className="bg-cheffy-orange hover:bg-cheffy-orange/90 w-full text-white"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Ingredient
                    </Button>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-3 text-cheffy-cream">Added Ingredients</h3>
                    
                    {manualIngredients.length === 0 ? (
                      <div className="text-center py-6 text-cheffy-cream/70 italic">
                        No ingredients added yet
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden border-cheffy-cream">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-2 text-cheffy-cream">Ingredient</th>
                              <th className="text-right p-2 text-cheffy-cream">Quantity</th>
                              <th className="text-right p-2 text-cheffy-cream">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {manualIngredients.map((item, i) => (
                              <tr key={i} className={i % 2 ? "bg-muted/20" : ""}>
                                <td className="p-2 text-cheffy-cream">{item.item}</td>
                                <td className="p-2 text-right text-cheffy-cream">{item.quantity}</td>
                                <td className="p-2 text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRemoveManualIngredient(i)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleSaveToInventory} 
                    className="w-full mt-4 bg-cheffy-orange hover:bg-cheffy-orange/90 text-white"
                    disabled={manualIngredients.length === 0 && parsedItems.length === 0}
                  >
                    Add All Items to Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-cheffy-cream">Extracted Items</h3>
                    {parsedItems.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyToClipboard}
                        className="border-cheffy-cream text-cheffy-cream hover:bg-cheffy-light-brown/20"
                      >
                        <Clipboard className="h-4 w-4 mr-1" />
                        Copy CSV
                      </Button>
                    )}
                  </div>
                  
                  {parsedItems.length === 0 ? (
                    <div className="text-center py-8 text-cheffy-cream">
                      <p>No items extracted yet. Process a receipt first.</p>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden border-cheffy-cream">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2 text-cheffy-cream">Item</th>
                            <th className="text-right p-2 text-cheffy-cream">Qty</th>
                            <th className="text-right p-2 text-cheffy-cream">Price</th>
                            <th className="text-right p-2 text-cheffy-cream">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedItems.map((item, i) => (
                            <tr key={i} className={i % 2 ? "bg-muted/20" : ""}>
                              <td className="p-2 text-cheffy-cream">{item.item}</td>
                              <td className="p-2 text-right text-cheffy-cream">{item.quantity}</td>
                              <td className="p-2 text-right text-cheffy-cream">${item.unitPrice.toFixed(2)}</td>
                              <td className="p-2 text-right text-cheffy-cream">${item.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-muted">
                          <tr>
                            <td colSpan={3} className="text-right p-2 font-medium text-cheffy-cream">Total:</td>
                            <td className="p-2 text-right font-medium text-cheffy-cream">
                              ${parsedItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleSaveToInventory} 
                    className="w-full bg-cheffy-orange hover:bg-cheffy-orange/90 text-white"
                    disabled={parsedItems.length === 0 && manualIngredients.length === 0}
                  >
                    Add Items to Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <NavBar />
    </div>
  );
};

export default ReceiptUploadPage;
