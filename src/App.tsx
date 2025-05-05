
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import ReceiptUploadPage from "./pages/ReceiptUploadPage";
import CuisineSelectionPage from "./pages/CuisineSelectionPage";
import MealPlanPage from "./pages/MealPlanPage";
import ShoppingListPage from "./pages/ShoppingListPage";
import ProfilePage from "./pages/ProfilePage";
import LoadingPage from "./pages/LoadingPage";
import IngredientInventoryPage from "./pages/IngredientInventoryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="bg-background min-h-screen text-foreground">
        <Toaster />
        <Sonner position="top-center" closeButton />
        <BrowserRouter>
          <Routes>
            {/* Loading page temporarily accessible at /loading */}
            <Route path="/loading" element={<LoadingPage />} />
            {/* Set IngredientInventoryPage as the initial route */}
            <Route path="/" element={<IngredientInventoryPage />} />
            <Route path="/home" element={<Index />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/receipt-upload" element={<ReceiptUploadPage />} />
            <Route path="/cuisine-selection" element={<CuisineSelectionPage />} />
            <Route path="/meal-plan" element={<MealPlanPage />} />
            <Route path="/shopping-list" element={<ShoppingListPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
