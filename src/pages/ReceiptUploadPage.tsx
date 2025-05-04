
import React, { useState } from 'react';
import { Upload, ArrowLeft, Camera, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import NavBar from '@/components/NavBar';
import { Progress } from '@/components/ui/progress';

const ReceiptUploadPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setUploadedImage(e.target.result);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleCameraCapture = () => {
    // In a real implementation, we'd use the device camera API
    // For now, just trigger the file input click
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
    
    // Simulate AI processing with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            toast("Receipt processed successfully!", {
              description: "Your ingredients inventory has been updated",
            });
            navigate('/cuisine-selection');
          }, 500);
        }
        return newProgress;
      });
    }, 200);
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
              Upload Receipt
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <div className="flex flex-col items-center justify-center mt-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Scan Your Receipt</h2>
            <p className="text-muted-foreground mb-6">
              Upload a photo of your grocery receipt to track your ingredients
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
            {isProcessing ? "Processing..." : "Process Receipt"}
          </Button>
        </div>
      </main>
      
      <NavBar />
    </div>
  );
};

export default ReceiptUploadPage;
