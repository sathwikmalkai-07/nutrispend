import { MealItem } from './budgetCalculations';

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScoreAvg: number;
}

export interface MacroPercentages {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

/**
 * Calculates sum of calories, protein, carbs, fat, and average health score for given meals
 */
export function calculateNutritionTotals(meals: MealItem[]): NutritionSummary {
  if (meals.length === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, healthScoreAvg: 0 };
  }

  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let healthScoreSum = 0;
  let scoredCount = 0;

  for (const m of meals) {
    calories += Number(m.calories) || 0;
    protein += Number(m.protein) || 0;
    carbs += Number(m.carbs) || 0;
    fat += Number(m.fat) || 0;

    if (typeof m.healthScore === 'number' && m.healthScore > 0) {
      healthScoreSum += m.healthScore;
      scoredCount++;
    }
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    healthScoreAvg: scoredCount > 0 ? Math.round(healthScoreSum / scoredCount) : 75,
  };
}

/**
 * Calculates macro caloric percentage (Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g)
 */
export function calculateMacroPercentages(proteinG: number, carbsG: number, fatG: number): MacroPercentages {
  const proteinKcal = (proteinG || 0) * 4;
  const carbsKcal = (carbsG || 0) * 4;
  const fatKcal = (fatG || 0) * 9;
  const totalKcal = proteinKcal + carbsKcal + fatKcal;

  if (totalKcal <= 0) {
    return { proteinPct: 0, carbsPct: 0, fatPct: 0 };
  }

  return {
    proteinPct: Math.round((proteinKcal / totalKcal) * 100),
    carbsPct: Math.round((carbsKcal / totalKcal) * 100),
    fatPct: Math.round((fatKcal / totalKcal) * 100),
  };
}

/**
 * Calculates cost per 100g of protein (vital metric for students trying to meet protein targets cheaply)
 */
export function calculateCostPer100gProtein(meals: MealItem[]): number {
  let totalCost = 0;
  let totalProtein = 0;

  for (const m of meals) {
    totalCost += Number(m.cost) || 0;
    totalProtein += Number(m.protein) || 0;
  }

  if (totalProtein <= 0) return 0;
  const costPerGram = totalCost / totalProtein;
  return Number((costPerGram * 100).toFixed(2));
}

/**
 * Calculates student nutrition grade (A, B, C, D) based on target variance and whole-food ratio
 */
export function calculateNutritionGrade(actualCalories: number, targetCalories: number, meals: MealItem[]): { grade: string; feedback: string } {
  if (meals.length === 0) {
    return { grade: 'N/A', feedback: 'No meals recorded yet today.' };
  }

  const homemadeRatio = meals.filter((m) => m.category === 'homemade').length / meals.length;
  const calorieDiff = Math.abs(actualCalories - targetCalories);
  const diffPercent = targetCalories > 0 ? (calorieDiff / targetCalories) * 100 : 0;

  if (diffPercent <= 10 && homemadeRatio >= 0.6) {
    return { grade: 'A', feedback: 'Excellent balance! You hit your calorie targets with nutrient-dense home cooking.' };
  } else if (diffPercent <= 20) {
    return { grade: 'B', feedback: 'Good job! Balanced intake with minor variances.' };
  } else if (diffPercent <= 30) {
    return { grade: 'C', feedback: 'Moderate deviation from target. Keep an eye on late snacks.' };
  } else {
    return { grade: 'D', feedback: 'Significant variance from your nutritional goal. Try planning meals ahead.' };
  }
}
