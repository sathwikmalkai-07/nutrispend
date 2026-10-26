import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeals } from '../context/MealContext';
import { Meal, MealCategory } from '../types';
import {
  calculateDailySpend,
  calculateWeeklySpend,
  calculateBudgetStatus,
  calculateEstimatedSavings,
  getMealsForDate,
} from '../utils/budgetCalculations';
import { calculateNutritionTotals, calculateMacroPercentages } from '../utils/nutritionCalculations';
import {
  DollarSign,
  Flame,
  Dumbbell,
  TrendingDown,
  TrendingUp,
  PlusCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  Utensils,
  Award,
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  ShoppingBag,
  Coffee,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardPageProps {
  setCurrentView: (view: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setCurrentView }) => {
  const { user } = useAuth();
  const { meals, setQuickAddOpen, setEditingMeal, deleteMeal, showToast } = useMeals();

  // Selected date (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  // Change date offset
  const handleDateOffset = (offset: number) => {
    const d = new Date(selectedDate + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Metrics for selected date
  const dateMeals = getMealsForDate(meals, selectedDate);
  const spentSelectedDate = calculateDailySpend(meals, selectedDate);
  const spentThisWeek = calculateWeeklySpend(meals, todayStr);

  const dailyBudget = user?.dailyBudget || 15;
  const weeklyBudget = user?.weeklyBudget || 90;

  const dailyStatus = calculateBudgetStatus(spentSelectedDate, dailyBudget);
  const weeklyStatus = calculateBudgetStatus(spentThisWeek, weeklyBudget);

  const nutritionSelected = calculateNutritionTotals(dateMeals);
  const calorieGoal = user?.dailyCalorieGoal || 2100;
  const proteinGoal = user?.dailyProteinGoal || 80;
  const carbsGoal = user?.dailyCarbsGoal || 250;
  const fatGoal = user?.dailyFatGoal || 65;

  const macroPct = calculateMacroPercentages(
    nutritionSelected.protein,
    nutritionSelected.carbs,
    nutritionSelected.fat
  );

  const estimatedSavings = calculateEstimatedSavings(dateMeals, 12.50);

  // Compute 7-day bar chart data
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStr + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() - i);
    const dayStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
    const spend = calculateDailySpend(meals, dayStr);
    chartData.push({
      date: dayStr,
      day: dayName,
      spent: Number(spend.toFixed(2)),
      budget: dailyBudget,
    });
  }

  const handleDeleteMeal = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from your meal log?`)) {
      await deleteMeal(id);
    }
  };

  const getCategoryBadge = (cat: MealCategory) => {
    switch (cat) {
      case 'homemade':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <ChefHat className="w-3 h-3" /> Homemade
          </span>
        );
      case 'restaurant':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            <ShoppingBag className="w-3 h-3" /> Restaurant / Takeout
          </span>
        );
      case 'snack':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
            <Coffee className="w-3 h-3" /> Snack / Cafe
          </span>
        );
      case 'grocery':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
            <DollarSign className="w-3 h-3" /> Grocery Batch
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Student Meal & Expense Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor daily spending, calorie goals, and nutrient-dense budget choices
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => handleDateOffset(-1)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span>{selectedDate}</span>
            {isToday && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-600 text-white rounded-md">
                Today
              </span>
            )}
          </div>

          <button
            onClick={() => handleDateOffset(1)}
            disabled={selectedDate >= todayStr}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-xs font-medium text-emerald-700 hover:underline px-2 py-1 cursor-pointer"
            >
              Reset to Today
            </button>
          )}
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Daily Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>DAILY FOOD BUDGET</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                ${spentSelectedDate.toFixed(2)}
              </span>
              <span className="text-sm font-medium text-slate-400">/ ${dailyBudget.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  dailyStatus.status === 'exceeded'
                    ? 'bg-rose-500'
                    : dailyStatus.status === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${dailyStatus.percentUsed}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span
                className={`font-semibold ${
                  dailyStatus.remaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {dailyStatus.remaining >= 0
                  ? `$${dailyStatus.remaining.toFixed(2)} remaining`
                  : `$${Math.abs(dailyStatus.remaining).toFixed(2)} over budget`}
              </span>
              <span className="text-slate-400">{dailyStatus.percentUsed}%</span>
            </div>
          </div>
        </div>

        {/* 2. Weekly Rolling Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>7-DAY WEEKLY BUDGET</span>
              <TrendingDown className="w-4 h-4 text-teal-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                ${spentThisWeek.toFixed(2)}
              </span>
              <span className="text-sm font-medium text-slate-400">/ ${weeklyBudget.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  weeklyStatus.status === 'exceeded'
                    ? 'bg-rose-500'
                    : weeklyStatus.status === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-teal-500'
                }`}
                style={{ width: `${weeklyStatus.percentUsed}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span
                className={`font-semibold ${
                  weeklyStatus.remaining >= 0 ? 'text-teal-700' : 'text-rose-600'
                }`}
              >
                {weeklyStatus.remaining >= 0
                  ? `$${weeklyStatus.remaining.toFixed(2)} left in week`
                  : 'Weekly budget exceeded'}
              </span>
              <span className="text-slate-400">{weeklyStatus.percentUsed}%</span>
            </div>
          </div>
        </div>

        {/* 3. Calories & Protein */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>CALORIES & PROTEIN</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {nutritionSelected.calories}
              </span>
              <span className="text-sm font-medium text-slate-400">/ {calorieGoal} kcal</span>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Protein: {nutritionSelected.protein}g</span>
              <span className="text-slate-400 font-medium">Goal: {proteinGoal}g</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((nutritionSelected.protein / proteinGoal) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Student Savings from Home Cooking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>HOME COOKING SAVINGS</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                +${estimatedSavings.toFixed(2)}
              </span>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                vs Takeout
              </span>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>
              {dateMeals.filter((m) => m.category === 'homemade').length} homemade meals today
            </span>
            <span className="text-emerald-700 font-semibold">Wallet Win!</span>
          </div>
        </div>
      </div>

      {/* AI Daily Student Tip & Quick Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                NutriBudget AI Student Advisor
              </span>
            </div>
            <p className="text-sm sm:text-base font-medium text-emerald-50 leading-snug">
              {dailyStatus.status === 'safe'
                ? `You're currently spending $${spentSelectedDate.toFixed(2)} today—well within your $${dailyBudget.toFixed(2)} allowance! Keep up the home-cooked lunches to pocket ~$45 by the weekend.`
                : dailyStatus.status === 'warning'
                ? `You're approaching today's budget limit ($${spentSelectedDate.toFixed(2)} / $${dailyBudget.toFixed(2)}). Consider a zero-cost dorm dinner using pantry leftovers!`
                : `You're $${Math.abs(dailyStatus.remaining).toFixed(2)} over today's target. Check our AI Pantry Remix to make cheap meals for the next 2 days to balance it out!`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setCurrentView('ai-planner')}
              className="px-3.5 py-2 rounded-xl bg-white text-emerald-950 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer"
            >
              AI Meal Planner
            </button>
            <button
              onClick={() => setCurrentView('pantry-remix')}
              className="px-3.5 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-white font-medium text-xs sm:text-sm border border-emerald-700/60 transition-colors cursor-pointer"
            >
              Pantry Leftovers
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column: Today's Meals Timeline & 7-Day Spending Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Meals for Selected Date */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-slate-900">
                Meals on {selectedDate}
              </h2>
              <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                {dateMeals.length} logged
              </span>
            </div>

            <button
              onClick={() => {
                setEditingMeal(null);
                setQuickAddOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Meal</span>
            </button>
          </div>

          {dateMeals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">No meals logged for this date</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Did you cook oats in your dorm or grab food on campus? Click below or use Gemini AI to estimate it!
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingMeal(null);
                  setQuickAddOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Meal on {selectedDate}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dateMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-emerald-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {meal.mealType}
                      </span>
                      {getCategoryBadge(meal.category)}
                      {meal.time && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" /> {meal.time}
                        </span>
                      )}
                      {meal.location && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3" /> {meal.location}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 truncate">{meal.name}</h3>

                    {meal.notes && (
                      <p className="text-xs text-slate-500 line-clamp-1">{meal.notes}</p>
                    )}

                    {/* Nutrition pill tags */}
                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-600 flex-wrap">
                      <span className="font-semibold text-slate-800">{meal.calories} kcal</span>
                      <span className="text-emerald-700 font-medium">{meal.protein}g protein</span>
                      <span className="text-amber-700 font-medium">{meal.carbs}g carbs</span>
                      <span className="text-sky-700 font-medium">{meal.fat}g fat</span>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                        ${meal.cost.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingMeal(meal);
                          setQuickAddOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit meal"
                        aria-label={`Edit ${meal.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(meal.id, meal.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete meal"
                        aria-label={`Delete ${meal.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: 7-Day Spending Chart & Macro Breakdown */}
        <div className="space-y-6">
          {/* 7-Day Bar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">7-Day Spending Trend</h3>
                <p className="text-xs text-slate-500">Daily expenses vs ${dailyBudget} target</p>
              </div>
              <button
                onClick={() => setCurrentView('expense-analytics')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Full Analytics →
              </button>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`$${val}`, 'Spent']}
                    labelFormatter={(day, payload) => payload?.[0]?.payload?.date || day}
                  />
                  <Bar dataKey="spent" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Macronutrient Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Today's Macronutrients</h3>
              <button
                onClick={() => setCurrentView('nutrition-analytics')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Details →
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Protein ({nutritionSelected.protein}g)</span>
                  <span className="text-slate-500">{macroPct.proteinPct}% of calories</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${macroPct.proteinPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Carbohydrates ({nutritionSelected.carbs}g)</span>
                  <span className="text-slate-500">{macroPct.carbsPct}% of calories</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${macroPct.carbsPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Healthy Fats ({nutritionSelected.fat}g)</span>
                  <span className="text-slate-500">{macroPct.fatPct}% of calories</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${macroPct.fatPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
