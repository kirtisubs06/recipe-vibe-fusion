
export type Recipe = {
  id: string;
  name: string;
  image: string;
  description: string;
  prep_time: string; // Changed from prepTime
  servings: number;
  ingredients: string[];
  instructions: string[];
  vibes: string[];
  dietary_info: string[]; // Changed from dietaryInfo
  cuisine_type: string; // Changed from cuisine
  created_at?: string; // Added to match supabaseService.Recipe type
};

export const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Creamy Garlic Butter Tuscan Salmon",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop",
    description: "Pan-seared salmon in a delicious creamy garlic butter sauce with spinach and sun-dried tomatoes.",
    prep_time: "25 mins", // Changed from prepTime
    servings: 4,
    ingredients: [
      "4 salmon fillets",
      "2 tbsp olive oil",
      "3 tbsp butter",
      "6 cloves garlic, finely diced",
      "1 small onion, diced",
      "1/3 cup vegetable broth",
      "5 oz jarred sun-dried tomato strips in oil, drained",
      "1 3/4 cups half and half",
      "3 cups baby spinach",
      "1/2 cup grated Parmesan cheese",
      "Salt and pepper to taste",
      "1 tbsp fresh parsley, chopped"
    ],
    instructions: [
      "Heat the oil in a large skillet over medium-high heat. Season salmon with salt and pepper and sear for 3-4 minutes on each side. Remove and set aside.",
      "Melt butter in the same skillet. Add garlic and onion; sauté until fragrant.",
      "Add the sun-dried tomatoes and vegetable broth; let simmer for 1-2 minutes.",
      "Reduce heat to low-medium and add half and half. Bring to a gentle simmer.",
      "Add spinach and let wilt, then mix in the Parmesan cheese. Allow sauce to thicken.",
      "Return salmon to the pan; spoon sauce over and cook for 3-4 more minutes.",
      "Garnish with parsley and serve immediately."
    ],
    vibes: ["Gourmet", "Date Night"],
    dietary_info: ["High Protein"], // Changed from dietaryInfo
    cuisine_type: "italian" // Changed from cuisine
  },
  {
    id: "2",
    name: "Quick Veggie Stir Fry",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop",
    description: "A colorful, nutritious vegetable stir-fry that comes together in minutes.",
    prep_time: "15 mins", // Changed from prepTime
    servings: 2,
    ingredients: [
      "2 tbsp sesame oil",
      "2 cloves garlic, minced",
      "1 tbsp ginger, grated",
      "1 bell pepper, sliced",
      "1 carrot, julienned",
      "1 cup broccoli florets",
      "1 cup snow peas",
      "2 tbsp soy sauce",
      "1 tbsp rice vinegar",
      "1 tsp honey",
      "2 green onions, sliced",
      "Sesame seeds for garnish"
    ],
    instructions: [
      "Heat sesame oil in a wok or large pan over high heat.",
      "Add garlic and ginger, stir for 30 seconds until fragrant.",
      "Add all vegetables and stir-fry for 3-4 minutes until crisp-tender.",
      "Mix soy sauce, rice vinegar, and honey in a small bowl.",
      "Pour sauce over vegetables and toss to coat evenly.",
      "Cook for another minute until sauce thickens slightly.",
      "Garnish with green onions and sesame seeds before serving."
    ],
    vibes: ["Quick & Easy", "Healthy"],
    dietary_info: ["Vegetarian", "Low Calorie"], // Changed from dietaryInfo
    cuisine_type: "chinese" // Changed from cuisine
  },
  {
    id: "3",
    name: "Homestyle Chicken Noodle Soup",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1170&auto=format&fit=crop",
    description: "Classic comfort food with tender chicken, vegetables, and egg noodles in a flavorful broth.",
    prep_time: "45 mins", // Changed from prepTime
    servings: 6,
    ingredients: [
      "2 tbsp olive oil",
      "1 large onion, diced",
      "2 carrots, sliced",
      "2 celery stalks, sliced",
      "3 cloves garlic, minced",
      "8 cups chicken broth",
      "2 bay leaves",
      "1 tsp dried thyme",
      "2 cups cooked shredded chicken",
      "2 cups egg noodles",
      "Salt and pepper to taste",
      "Fresh parsley, chopped"
    ],
    instructions: [
      "Heat oil in a large pot over medium heat. Add onions, carrots, and celery; cook for 5 minutes.",
      "Add garlic and cook for 30 seconds until fragrant.",
      "Pour in chicken broth, add bay leaves and thyme. Bring to a boil.",
      "Reduce heat and simmer for 15 minutes until vegetables are tender.",
      "Add shredded chicken and noodles. Cook for 6-8 minutes until noodles are tender.",
      "Season with salt and pepper to taste.",
      "Remove bay leaves, garnish with fresh parsley, and serve warm."
    ],
    vibes: ["Comfort Food", "Family Meal"],
    dietary_info: ["High Protein"], // Changed from dietaryInfo
    cuisine_type: "american" // Changed from cuisine
  },
  {
    id: "4",
    name: "Rainbow Buddha Bowl",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780&auto=format&fit=crop",
    description: "A vibrant, nutrient-packed bowl with quinoa, roasted vegetables, and tahini dressing.",
    prep_time: "30 mins", // Changed from prepTime
    servings: 2,
    ingredients: [
      "1 cup quinoa, cooked",
      "1 sweet potato, diced and roasted",
      "1 cup chickpeas, roasted",
      "1 cup purple cabbage, shredded",
      "1 avocado, sliced",
      "1 carrot, grated",
      "1/2 cucumber, sliced",
      "1/4 cup mixed seeds (pumpkin, sunflower)",
      "For the dressing:",
      "2 tbsp tahini",
      "1 tbsp lemon juice",
      "1 tbsp maple syrup",
      "2 tbsp water",
      "Salt to taste"
    ],
    instructions: [
      "Arrange cooked quinoa as the base of your bowl.",
      "Arrange roasted sweet potatoes, chickpeas, cabbage, avocado, carrot, and cucumber in sections on top of the quinoa.",
      "Sprinkle with mixed seeds.",
      "Whisk together tahini, lemon juice, maple syrup, water, and salt to make the dressing.",
      "Drizzle dressing over the bowl and serve immediately."
    ],
    vibes: ["Healthy", "Budget-Friendly"],
    dietary_info: ["Vegan", "Gluten-Free"], // Changed from dietaryInfo
    cuisine_type: "mediterranean" // Changed from cuisine
  }
];
