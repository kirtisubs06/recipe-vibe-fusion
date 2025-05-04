
import React, { useState } from 'react';
import { ArrowLeft, Settings, Edit, Bell, Star, Moon, LogOut, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { useUserPreferences } from '@/store/userPreferences';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [newPreference, setNewPreference] = useState('');
  
  // Get dietary preferences from our store
  const { 
    dietaryPreferences, 
    addDietaryPreference, 
    removeDietaryPreference,
    currentIngredients
  } = useUserPreferences();
  
  const handleAddPreference = () => {
    if (!newPreference.trim()) return;
    
    // Check if preference already exists
    if (dietaryPreferences.includes(newPreference.trim())) {
      toast("Preference already exists", {
        description: "This dietary preference is already in your list"
      });
      return;
    }
    
    addDietaryPreference(newPreference.trim());
    setNewPreference('');
    
    toast("Preference added", {
      description: `Added "${newPreference.trim()}" to your dietary preferences`
    });
  };
  
  const handleRemovePreference = (preference: string) => {
    removeDietaryPreference(preference);
    
    toast("Preference removed", {
      description: `Removed "${preference}" from your dietary preferences`
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
            <h1 className="text-2xl font-bold text-recipe-terracota">Profile</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <div className="flex flex-col items-center mt-4 mb-8">
          <div className="w-24 h-24 rounded-full bg-recipe-sunset flex items-center justify-center text-recipe-rojo text-4xl font-bold mb-3">
            JS
          </div>
          <h2 className="text-xl font-bold">Jamie Smith</h2>
          <p className="text-sm text-muted-foreground">jamie@example.com</p>
          <Button variant="outline" size="sm" className="mt-2 flex gap-2 border-recipe-terracota text-recipe-terracota hover:bg-recipe-terracota/10">
            <Edit className="h-4 w-4" /> Edit Profile
          </Button>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-medium mb-3">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-recipe-olive" />
                <span>Notifications</span>
              </div>
              <Switch />
            </div>
            <Separator className="bg-muted" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-recipe-olive" />
                <span>Dark Mode</span>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-medium mb-3">Activity</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Saved Recipes</span>
              <span className="text-recipe-terracota font-medium">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cooking Streak</span>
              <span className="text-recipe-terracota font-medium">7 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Current Ingredients</span>
              <span className="text-recipe-terracota font-medium">{currentIngredients.length}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Dietary Preferences</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 w-7 p-0 rounded-full border-recipe-terracota text-recipe-terracota"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Dietary Preference</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2 mt-2">
                  <Input 
                    placeholder="e.g. Gluten Free" 
                    value={newPreference}
                    onChange={(e) => setNewPreference(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPreference()}
                  />
                  <Button onClick={handleAddPreference} className="bg-recipe-terracota">Add</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-wrap gap-2">
            {dietaryPreferences.map((preference) => (
              <div 
                key={preference} 
                className="bg-recipe-olive text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                <span>{preference}</span>
                <button 
                  className="h-4 w-4 rounded-full hover:bg-white/20 flex items-center justify-center"
                  onClick={() => handleRemovePreference(preference)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {dietaryPreferences.length === 0 && (
              <div className="text-muted-foreground text-sm italic">
                No dietary preferences set
              </div>
            )}
          </div>
        </div>
        
        <Button variant="outline" className="w-full flex gap-2 text-destructive hover:text-destructive border-destructive">
          <LogOut className="h-4 w-4" /> Log Out
        </Button>
      </main>
      
      <NavBar />
    </div>
  );
};

export default ProfilePage;
