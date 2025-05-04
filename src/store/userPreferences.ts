
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Define types for our user preferences store
export interface ParsedReceiptItem {
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface UserPreferences {
  // Dietary preferences
  dietaryPreferences: string[];
  
  // Ingredients from receipt scans
  currentIngredients: ParsedReceiptItem[];
  
  // Selected cuisines
  selectedCuisines: string[];
  
  // Functions to update the store
  addDietaryPreference: (preference: string) => void;
  removeDietaryPreference: (preference: string) => void;
  setDietaryPreferences: (preferences: string[]) => void;
  
  addIngredient: (item: ParsedReceiptItem) => void;
  addIngredients: (items: ParsedReceiptItem[]) => void;
  removeIngredient: (itemName: string) => void;
  clearIngredients: () => void;
  
  addCuisine: (cuisine: string) => void;
  removeCuisine: (cuisine: string) => void;
  setCuisines: (cuisines: string[]) => void;
  clearCuisines: () => void;
}

// Create the store with persistence
export const useUserPreferences = create<UserPreferences>()(
  persist(
    (set) => ({
      // Initial state
      dietaryPreferences: ['Vegetarian', 'Low Carb', 'Dairy Free'],
      currentIngredients: [],
      selectedCuisines: [],
      
      // Dietary preferences actions
      addDietaryPreference: (preference) => 
        set((state) => ({
          dietaryPreferences: [...state.dietaryPreferences, preference]
        })),
      
      removeDietaryPreference: (preference) => 
        set((state) => ({
          dietaryPreferences: state.dietaryPreferences.filter(p => p !== preference)
        })),
      
      setDietaryPreferences: (preferences) => 
        set(() => ({ dietaryPreferences: preferences })),
      
      // Ingredient actions
      addIngredient: (item) => 
        set((state) => {
          // Check if the ingredient already exists
          const existingIndex = state.currentIngredients.findIndex(
            i => i.item.toLowerCase() === item.item.toLowerCase()
          );
          
          if (existingIndex >= 0) {
            // Update the existing ingredient
            const updatedIngredients = [...state.currentIngredients];
            updatedIngredients[existingIndex] = {
              ...updatedIngredients[existingIndex],
              quantity: updatedIngredients[existingIndex].quantity + item.quantity,
              total: updatedIngredients[existingIndex].total + item.total
            };
            return { currentIngredients: updatedIngredients };
          } else {
            // Add new ingredient
            return {
              currentIngredients: [...state.currentIngredients, item]
            };
          }
        }),
      
      addIngredients: (items) => 
        set((state) => {
          const currentItems = [...state.currentIngredients];
          
          // For each new item
          items.forEach((newItem) => {
            const existingIndex = currentItems.findIndex(
              i => i.item.toLowerCase() === newItem.item.toLowerCase()
            );
            
            if (existingIndex >= 0) {
              // Update existing
              currentItems[existingIndex] = {
                ...currentItems[existingIndex],
                quantity: currentItems[existingIndex].quantity + newItem.quantity,
                total: currentItems[existingIndex].total + newItem.total
              };
            } else {
              // Add new
              currentItems.push(newItem);
            }
          });
          
          return { currentIngredients: currentItems };
        }),
      
      removeIngredient: (itemName) => 
        set((state) => ({
          currentIngredients: state.currentIngredients.filter(
            i => i.item.toLowerCase() !== itemName.toLowerCase()
          )
        })),
      
      clearIngredients: () => set(() => ({ currentIngredients: [] })),
      
      // Cuisine actions
      addCuisine: (cuisine) => 
        set((state) => ({
          selectedCuisines: [...state.selectedCuisines, cuisine]
        })),
      
      removeCuisine: (cuisine) => 
        set((state) => ({
          selectedCuisines: state.selectedCuisines.filter(c => c !== cuisine)
        })),
      
      setCuisines: (cuisines) => 
        set(() => ({ selectedCuisines: cuisines })),
      
      clearCuisines: () => set(() => ({ selectedCuisines: [] })),
    }),
    {
      name: 'user-preferences-storage',
    }
  )
);
