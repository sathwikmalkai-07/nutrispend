export interface MealItem {
  id: string;
  userId: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  category: 'homemade' | 'restaurant' | 'snack' | 'grocery';
  cost: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // ISO date string YYYY-MM-DD
  time?: string; // HH:mm
  notes?: string;
  location?: string;
  healthScore?: number; // 1-100
  createdAt: string;
}

export interface UserBudget {
  dailyBudget: number;
  weeklyBudget: number;
  currencySymbol: string;
}

export interface BudgetStatus {
  spent: number;
  budget: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  status: 'safe' | 'warning' | 'exceeded';
}

/**
 * Filter meals by a specific date string (YYYY-MM-DD)
 */
export function getMealsForDate(meals: MealItem[], dateStr: string): MealItem[] {
  return meals.filter((m) => m.date === dateStr);
}

/**
 * Sum expenses for a specific date
 */
export function calculateDailySpend(meals: MealItem[], dateStr: string): number {
  return meals
    .filter((m) => m.date === dateStr)
    .reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
}

/**
 * Filter meals for the last N days up to reference date
 */
export function getMealsForDateRange(meals: MealItem[], startDateStr: string, endDateStr: string): MealItem[] {
  return meals.filter((m) => m.date >= startDateStr && m.date <= endDateStr);
}

/**
 * Sum expenses for a 7-day window ending on referenceDate
 */
export function calculateWeeklySpend(meals: MealItem[], referenceDateStr: string): number {
  const ref = new Date(referenceDateStr + 'T12:00:00Z');
  const past7Days = new Date(ref);
  past7Days.setUTCDate(ref.getUTCDate() - 6);
  const startDateStr = past7Days.toISOString().split('T')[0];

  return meals
    .filter((m) => m.date >= startDateStr && m.date <= referenceDateStr)
    .reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
}

/**
 * Calculates budget status and health indicator
 */
export function calculateBudgetStatus(spent: number, budget: number): BudgetStatus {
  const safeBudget = budget > 0 ? budget : 1;
  const remaining = Number((budget - spent).toFixed(2));
  const percentUsed = Math.min(Math.round((spent / safeBudget) * 100), 999);
  const isOverBudget = spent > budget;

  let status: 'safe' | 'warning' | 'exceeded' = 'safe';
  if (percentUsed >= 100) {
    status = 'exceeded';
  } else if (percentUsed >= 80) {
    status = 'warning';
  }

  return {
    spent: Number(spent.toFixed(2)),
    budget: Number(budget.toFixed(2)),
    remaining,
    percentUsed,
    isOverBudget,
    status,
  };
}

/**
 * Breakdown of spending by category (homemade, restaurant, snack, grocery)
 */
export function calculateCategoryBreakdown(meals: MealItem[]): Record<string, { totalCost: number; count: number; percentage: number }> {
  const total = meals.reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
  const categories: Array<'homemade' | 'restaurant' | 'snack' | 'grocery'> = ['homemade', 'restaurant', 'snack', 'grocery'];
  
  const result: Record<string, { totalCost: number; count: number; percentage: number }> = {};
  for (const cat of categories) {
    result[cat] = { totalCost: 0, count: 0, percentage: 0 };
  }

  for (const m of meals) {
    const cat = m.category || 'homemade';
    if (!result[cat]) {
      result[cat] = { totalCost: 0, count: 0, percentage: 0 };
    }
    result[cat].totalCost += Number(m.cost) || 0;
    result[cat].count += 1;
  }

  for (const cat of Object.keys(result)) {
    result[cat].totalCost = Number(result[cat].totalCost.toFixed(2));
    result[cat].percentage = total > 0 ? Math.round((result[cat].totalCost / total) * 100) : 0;
  }

  return result;
}

/**
 * Calculates estimated student savings from cooking homemade meals
 * (Assuming average student restaurant/takeout meal costs ~$12.50)
 */
export function calculateEstimatedSavings(meals: MealItem[], averageTakeoutCost = 12.5): number {
  const homemadeMeals = meals.filter((m) => m.category === 'homemade');
  if (homemadeMeals.length === 0) return 0;

  const actualHomemadeCost = homemadeMeals.reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
  const hypotheticalTakeoutCost = homemadeMeals.length * averageTakeoutCost;
  const savings = hypotheticalTakeoutCost - actualHomemadeCost;

  return Math.max(0, Number(savings.toFixed(2)));
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: number, symbol = '$'): string {
  const num = Number(amount) || 0;
  return `${symbol}${num.toFixed(2)}`;
}
