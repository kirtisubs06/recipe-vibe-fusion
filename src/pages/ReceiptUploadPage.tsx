
import React, { useState } from 'react';
import { Upload, ArrowLeft, Camera, X, FileText, Clipboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import NavBar from '@/components/NavBar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ParsedReceiptItem {
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const ReceiptUploadPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [parsedItems, setParsedItems] = useState<ParsedReceiptItem[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  
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

  const handleSaveToInventory = () => {
    if (parsedItems.length === 0) {
      toast("No items to save", {
        description: "Please process a receipt first",
      });
      return;
    }

    toast("Items added to inventory", {
      description: `Added ${parsedItems.length} items to your ingredients inventory`,
    });
    
    // In a real app, we would save these items to inventory
    // For now, navigate to the next page
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
          variant: "destructive",
        });
      });
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-6">
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
                        className="border-2 border-dashed border-muted rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer hover:border-cheffy-brown transition-colors"
                        onClick={handleCameraCapture}
                        style={{ minHeight: "200px" }}
                      >
                        <div className="p-4 rounded-full bg-muted mb-4">
                          <Camera className="h-10 w-10 text-cheffy-brown" />
                        </div>
                        <p className="font-medium text-sm mb-2">Take a photo of your receipt</p>
                        <p className="text-xs text-muted-foreground mb-2">or</p>
                        <label 
                          htmlFor="receipt-file-input"
                          className="text-cheffy-brown underline cursor-pointer text-sm"
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
                        <p className="text-sm font-medium mb-2">Processing receipt...</p>
                        <Progress value={progress} className="h-2 bg-muted" />
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleProcessReceipt} 
                    className="bg-cheffy-brown hover:bg-cheffy-brown/90 transition-opacity w-full"
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
          
          <TabsContent value="results">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Extracted Items</h3>
                    {parsedItems.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyToClipboard}
                      >
                        <Clipboard className="h-4 w-4 mr-1" />
                        Copy CSV
                      </Button>
                    )}
                  </div>
                  
                  {parsedItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No items extracted yet. Process a receipt first.</p>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Item</th>
                            <th className="text-right p-2">Qty</th>
                            <th className="text-right p-2">Price</th>
                            <th className="text-right p-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedItems.map((item, i) => (
                            <tr key={i} className={i % 2 ? "bg-muted/20" : ""}>
                              <td className="p-2">{item.item}</td>
                              <td className="p-2 text-right">{item.quantity}</td>
                              <td className="p-2 text-right">${item.unitPrice.toFixed(2)}</td>
                              <td className="p-2 text-right">${item.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-muted">
                          <tr>
                            <td colSpan={3} className="text-right p-2 font-medium">Total:</td>
                            <td className="p-2 text-right font-medium">
                              ${parsedItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleSaveToInventory} 
                    className="w-full bg-cheffy-brown hover:bg-cheffy-brown/90"
                    disabled={parsedItems.length === 0}
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
