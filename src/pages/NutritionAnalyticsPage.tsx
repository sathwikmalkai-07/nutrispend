import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeals } from '../context/MealContext';
import {
  calculateNutritionTotals,
  calculateMacroPercentages,
  calculateCostPer100gProtein,
  calculateNutritionGrade,
} from '../utils/nutritionCalculations';
import {
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Award,
  Activity,
  Heart,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const NutritionAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { meals } = useMeals();

  const calorieGoal = user?.dailyCalorieGoal || 2100;
  const proteinGoal = user?.dailyProteinGoal || 80;
  const carbsGoal = user?.dailyCarbsGoal || 250;
  const fatGoal = user?.dailyFatGoal || 65;

  // 14-day Calorie & Macro trends
  const trendData = useMemo(() => {
    const list = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayShort = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

      const dayMeals = meals.filter((m) => m.date === dateStr);
      const totals = calculateNutritionTotals(dayMeals);

      list.push({
        date: dateStr,
        day: dayShort,
        calories: totals.calories,
        targetCalories: calorieGoal,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
      });
    }
    return list;
  }, [meals, calorieGoal]);

  // Overall totals across all meals
  const allTimeTotals = useMemo(() => calculateNutritionTotals(meals), [meals]);
  const macroPct = useMemo(
    () => calculateMacroPercentages(allTimeTotals.protein, allTimeTotals.carbs, allTimeTotals.fat),
    [allTimeTotals]
  );

  const costPer100g = useMemo(() => calculateCostPer100gProtein(meals), [meals]);

  // Today's report card
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter((m) => m.date === todayStr);
  const todayTotals = calculateNutritionTotals(todayMeals);
  const reportCard = calculateNutritionGrade(todayTotals.calories, calorieGoal, todayMeals);

  const macroPieData = [
    { name: 'Protein', value: macroPct.proteinPct, color: '#059669', grams: allTimeTotals.protein },
    { name: 'Carbohydrates', value: macroPct.carbsPct, color: '#f59e0b', grams: allTimeTotals.carbs },
    { name: 'Fats', value: macroPct.fatPct, color: '#0284c7', grams: allTimeTotals.fat },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Nutrition Analytics & Health Quality</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track calorie consistency, macronutrient balance, and budget-to-protein efficiency
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Grade */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>TODAY'S NUTRITION GRADE</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-emerald-600">{reportCard.grade}</span>
              <span className="text-xs font-semibold text-slate-600">
                {reportCard.grade === 'A' ? 'Excellent Balance' : reportCard.grade === 'B' ? 'Good Intake' : 'In Progress'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">{reportCard.feedback}</p>
        </div>

        {/* Protein Economics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>STUDENT PROTEIN ECONOMICS</span>
              <Dumbbell className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">${costPer100g}</span>
            <span className="text-xs text-slate-400 block mt-1">Average cost per 100g protein</span>
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-3 pt-2 border-t border-slate-100">
            Eggs, canned tuna, and whey keep this below $8!
          </p>
        </div>

        {/* Average Health Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>HEALTH DENSITY SCORE</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{allTimeTotals.healthScoreAvg}</span>
              <span className="text-sm font-medium text-slate-400">/ 100</span>
            </div>
            <span className="text-xs text-slate-400 block mt-1">Whole food nutrient density</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
            Based on fiber, micronutrients, and cooking method
          </p>
        </div>

        {/* Calorie Target Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>DAILY CALORIE TARGET</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{calorieGoal}</span>
            <span className="text-xs text-slate-400 block mt-1">kcal standard baseline</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
            Target can be adjusted in Profile Settings
          </p>
        </div>
      </div>

      {/* 2-Column: 14-Day Calorie Trend & Macro Energy Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calorie Trend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">14-Day Caloric Intake Consistency</h2>
              <p className="text-xs text-slate-500">Actual daily calorie intake vs your {calorieGoal} kcal target</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Actual kcal
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-0.5 bg-emerald-600 inline-block" /> Target Goal
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip formatter={(val: any, name: any) => [`${val} kcal`, name === 'calories' ? 'Consumed' : 'Target'] } />
                <Area type="monotone" dataKey="calories" fill="#fef3c7" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="targetCalories" stroke="#059669" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macro Energy Ratio Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Macronutrient Energy Ratio</h2>
            <p className="text-xs text-slate-500">Caloric split (Protein 4 / Carbs 4 / Fat 9 kcal/g)</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {macroPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Calories']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {macroPieData.map((m) => (
              <div key={m.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-slate-700 font-medium">{m.name}</span>
                </div>
                <span className="font-bold text-slate-900">
                  {m.value}% ({m.grams}g)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Macronutrient Gram Trends Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Daily Macronutrient Breakdown (Grams)</h2>
          <p className="text-xs text-slate-500">Tracking daily protein, carbohydrate, and fat gram intake</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <Tooltip formatter={(val: any, name: any) => [`${val}g`, name.toUpperCase()]} />
              <Bar dataKey="protein" fill="#059669" name="protein" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="carbs" fill="#f59e0b" name="carbs" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="fat" fill="#0284c7" name="fat" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
