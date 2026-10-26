import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNutritionTotals,
  calculateMacroPercentages,
  calculateCostPer100gProtein,
  calculateNutritionGrade,
} from './nutritionCalculations';
import { MealItem } from './budgetCalculations';

const mockMeals: MealItem[] = [
  {
    id: '1',
    userId: 'u1',
    name: 'Scrambled Eggs & Spinach',
    mealType: 'breakfast',
    category: 'homemade',
    cost: 1.8,
    calories: 280,
    protein: 20,
    carbs: 4,
    fat: 18,
    date: '2026-10-26',
    healthScore: 90,
    createdAt: '2026-10-26T08:00:00Z',
  },
  {
    id: '2',
    userId: 'u1',
    name: 'Tuna Rice Bowl',
    mealType: 'lunch',
    category: 'homemade',
    cost: 2.5,
    calories: 520,
    protein: 35,
    carbs: 65,
    fat: 10,
    date: '2026-10-26',
    healthScore: 85,
    createdAt: '2026-10-26T12:00:00Z',
  },
];

test('calculateNutritionTotals sums calories and macros', () => {
  const totals = calculateNutritionTotals(mockMeals);
  assert.equal(totals.calories, 800);
  assert.equal(totals.protein, 55);
  assert.equal(totals.carbs, 69);
  assert.equal(totals.fat, 28);
  assert.equal(totals.healthScoreAvg, 88);
});

test('calculateMacroPercentages calculates standard 4-4-9 calorie percentages', () => {
  // Protein: 50g * 4 = 200 kcal
  // Carbs: 50g * 4 = 200 kcal
  // Fat: 22.22g * 9 ~= 200 kcal
  // Total ~ 600 kcal. Each should be ~ 33%
  const macros = calculateMacroPercentages(50, 50, 22.22);
  assert.equal(macros.proteinPct, 33);
  assert.equal(macros.carbsPct, 33);
  assert.equal(macros.fatPct, 33);
});

test('calculateCostPer100gProtein calculates student protein economics', () => {
  // Total cost: $1.8 + $2.5 = $4.30. Total protein: 55g.
  // Cost per 100g = (4.30 / 55) * 100 = 7.82
  const costPer100g = calculateCostPer100gProtein(mockMeals);
  assert.equal(costPer100g, 7.82);
});

test('calculateNutritionGrade gives A for compliant home-cooked day', () => {
  const grade = calculateNutritionGrade(800, 850, mockMeals);
  assert.equal(grade.grade, 'A');
});
