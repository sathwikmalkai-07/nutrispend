import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDailySpend,
  calculateWeeklySpend,
  calculateBudgetStatus,
  calculateCategoryBreakdown,
  calculateEstimatedSavings,
  formatCurrency,
  MealItem,
} from './budgetCalculations';

const mockMeals: MealItem[] = [
  {
    id: '1',
    userId: 'u1',
    name: 'Oatmeal & Banana',
    mealType: 'breakfast',
    category: 'homemade',
    cost: 1.5,
    calories: 320,
    protein: 10,
    carbs: 55,
    fat: 5,
    date: '2026-10-26',
    createdAt: '2026-10-26T08:00:00Z',
  },
  {
    id: '2',
    userId: 'u1',
    name: 'Campus Burrito',
    mealType: 'lunch',
    category: 'restaurant',
    cost: 11.0,
    calories: 780,
    protein: 32,
    carbs: 85,
    fat: 30,
    date: '2026-10-26',
    createdAt: '2026-10-26T12:30:00Z',
  },
  {
    id: '3',
    userId: 'u1',
    name: 'Pasta & Tomato Sauce',
    mealType: 'dinner',
    category: 'homemade',
    cost: 2.5,
    calories: 550,
    protein: 18,
    carbs: 90,
    fat: 12,
    date: '2026-10-25',
    createdAt: '2026-10-25T19:00:00Z',
  },
];

test('calculateDailySpend sums meals for given date', () => {
  const spendToday = calculateDailySpend(mockMeals, '2026-10-26');
  assert.equal(spendToday, 12.5);

  const spendYesterday = calculateDailySpend(mockMeals, '2026-10-25');
  assert.equal(spendYesterday, 2.5);

  const spendEmpty = calculateDailySpend(mockMeals, '2026-10-20');
  assert.equal(spendEmpty, 0);
});

test('calculateWeeklySpend calculates 7-day rolling window spend', () => {
  const weeklySpend = calculateWeeklySpend(mockMeals, '2026-10-26');
  assert.equal(weeklySpend, 15.0);
});

test('calculateBudgetStatus computes remaining, percent and status flags', () => {
  const safe = calculateBudgetStatus(10, 20);
  assert.equal(safe.remaining, 10);
  assert.equal(safe.percentUsed, 50);
  assert.equal(safe.status, 'safe');
  assert.equal(safe.isOverBudget, false);

  const warning = calculateBudgetStatus(17, 20);
  assert.equal(warning.status, 'warning');
  assert.equal(warning.percentUsed, 85);

  const exceeded = calculateBudgetStatus(25, 20);
  assert.equal(exceeded.status, 'exceeded');
  assert.equal(exceeded.isOverBudget, true);
  assert.equal(exceeded.remaining, -5);
});

test('calculateCategoryBreakdown groups by category', () => {
  const breakdown = calculateCategoryBreakdown(mockMeals);
  assert.equal(breakdown.homemade.count, 2);
  assert.equal(breakdown.homemade.totalCost, 4.0);
  assert.equal(breakdown.restaurant.count, 1);
  assert.equal(breakdown.restaurant.totalCost, 11.0);
});

test('calculateEstimatedSavings compares homemade cost vs takeout cost', () => {
  // 2 homemade meals cost $4.00. Hypothetical takeout for 2 meals at $12.50 = $25.00. Savings = $21.00
  const savings = calculateEstimatedSavings(mockMeals, 12.5);
  assert.equal(savings, 21.0);
});

test('formatCurrency outputs correctly with symbol', () => {
  assert.equal(formatCurrency(12.5, '$'), '$12.50');
  assert.equal(formatCurrency(0, '€'), '€0.00');
});
