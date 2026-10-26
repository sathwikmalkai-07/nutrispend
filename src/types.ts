export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dailyBudget: number;
  weeklyBudget: number;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatGoal: number;
  currencySymbol: string;
  dietaryRestrictions: string[];
  kitchenEquipment: string[];
  university?: string;
  createdAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MealCategory = 'homemade' | 'restaurant' | 'snack' | 'grocery';

export interface Meal {
  id: string;
  userId: string;
  name: string;
  mealType: MealType;
  category: MealCategory;
  cost: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  notes?: string;
  location?: string;
  healthScore?: number; // 1-100
  createdAt: string;
}

export interface MealInput {
  name: string;
  mealType: MealType;
  category: MealCategory;
  cost: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  time?: string;
  notes?: string;
  location?: string;
  healthScore?: number;
}

export interface AiNutritionEstimate {
  name: string;
  mealType: MealType;
  category: MealCategory;
  cost: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  studentTip: string;
  breakdown: string[];
}

export interface PlannedMeal {
  dayName: string;
  mealType: MealType;
  recipeName: string;
  description: string;
  estimatedCost: number;
  prepTimeMinutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
}

export interface ShoppingListItem {
  item: string;
  aisle: 'Produce' | 'Pantry & Grains' | 'Dairy & Protein' | 'Frozen & Spices';
  estimatedPrice: number;
  quantity: string;
}

export interface AiMealPlanResponse {
  planTitle: string;
  totalCost: number;
  days: number;
  dailyAverageCost: number;
  meals: PlannedMeal[];
  shoppingList: ShoppingListItem[];
  studentMoneySavingHacks: string[];
}

export interface PantryRecipe {
  title: string;
  prepTime: string;
  costPerServing: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredientsNeeded: string[];
  pantryItemsUsed: string[];
  steps: string[];
  dormTip: string;
}

export interface CoachAdvice {
  statusRating: 'On Track' | 'Watch Out' | 'Budget Alert';
  weeklyBurnRate: string;
  biggestSpendingTrap: string;
  projectedWeekendSavings: number;
  actionSteps: string[];
  encouragement: string;
}
