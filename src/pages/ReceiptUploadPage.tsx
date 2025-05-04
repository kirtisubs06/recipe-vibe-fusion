
import React, { useState } from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import NavBar from '@/components/NavBar';

const ReceiptUploadPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
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
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      toast("Receipt processed successfully!", {
        description: "Your ingredients inventory has been updated",
      });
      
      // In a real implementation, this would save the extracted ingredients
      // to the user's inventory in the backend
      
      // Navigate to cuisine selection
      navigate('/cuisine-selection');
    }, 2000);
  };

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
            <h1 className="text-2xl font-bold text-recipe-primary">Upload Receipt</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center mt-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Scan Your Receipt</h2>
            <p className="text-gray-600 mb-6">
              Upload a photo of your grocery receipt to track your ingredients inventory
            </p>
          </div>

          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
            {uploadedImage ? (
              <div className="mb-4">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded receipt" 
                  className="w-full h-auto object-contain rounded-lg border"
                  style={{ maxHeight: "300px" }}
                />
                <Button 
                  variant="outline" 
                  className="mt-2 w-full"
                  onClick={() => setUploadedImage(null)}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center flex flex-col items-center justify-center cursor-pointer hover:border-recipe-primary transition-colors"
                onClick={handleCameraCapture}
                style={{ minHeight: "200px" }}
              >
                <Upload className="h-10 w-10 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">Click or tap to take a photo</p>
                <p className="text-xs text-gray-500">or</p>
                <label 
                  htmlFor="receipt-file-input"
                  className="mt-2 text-recipe-primary underline cursor-pointer text-sm"
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
          </div>

          <Button 
            onClick={handleProcessReceipt} 
            className="bg-recipe-primary hover:bg-recipe-primary/90 w-full max-w-md"
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
