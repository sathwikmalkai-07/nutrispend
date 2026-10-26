import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeals } from '../context/MealContext';
import { calculateCategoryBreakdown, calculateEstimatedSavings, calculateDailySpend } from '../utils/budgetCalculations';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  Award,
  AlertCircle,
  ChefHat,
  ShoppingBag,
  Coffee,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  homemade: '#059669', // Emerald
  restaurant: '#f59e0b', // Amber
  snack: '#0284c7', // Sky
  grocery: '#8b5cf6', // Purple
};

export const ExpenseAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { meals } = useMeals();

  const dailyBudget = user?.dailyBudget || 15;
  const weeklyBudget = user?.weeklyBudget || 90;

  // Last 14 days spending trend
  const dailySpendData = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayShort = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      const spent = calculateDailySpend(meals, dateStr);

      list.push({
        date: dateStr,
        day: dayShort,
        spent: Number(spent.toFixed(2)),
        budget: dailyBudget,
      });
    }
    return list;
  }, [meals, dailyBudget]);

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const breakdown = calculateCategoryBreakdown(meals);
    return [
      { name: 'Homemade', key: 'homemade', value: breakdown.homemade.totalCost, count: breakdown.homemade.count, color: CATEGORY_COLORS.homemade },
      { name: 'Restaurant / Takeout', key: 'restaurant', value: breakdown.restaurant.totalCost, count: breakdown.restaurant.count, color: CATEGORY_COLORS.restaurant },
      { name: 'Snacks & Coffee', key: 'snack', value: breakdown.snack.totalCost, count: breakdown.snack.count, color: CATEGORY_COLORS.snack },
      { name: 'Grocery Staples', key: 'grocery', value: breakdown.grocery.totalCost, count: breakdown.grocery.count, color: CATEGORY_COLORS.grocery },
    ].filter((item) => item.value > 0);
  }, [meals]);

  // Spending by day of week (Monday through Sunday)
  const dayOfWeekData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const sums: Record<number, { total: number; count: number }> = {
      0: { total: 0, count: 0 },
      1: { total: 0, count: 0 },
      2: { total: 0, count: 0 },
      3: { total: 0, count: 0 },
      4: { total: 0, count: 0 },
      5: { total: 0, count: 0 },
      6: { total: 0, count: 0 },
    };

    meals.forEach((m) => {
      const d = new Date(m.date + 'T12:00:00Z');
      const dayIdx = d.getUTCDay();
      sums[dayIdx].total += m.cost || 0;
      sums[dayIdx].count += 1;
    });

    // Reorder Mon to Sun
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.map((idx) => ({
      day: days[idx],
      avgSpent: sums[idx].count > 0 ? Number((sums[idx].total / Math.max(1, sums[idx].count / 2)).toFixed(2)) : 0,
      totalSpent: Number(sums[idx].total.toFixed(2)),
    }));
  }, [meals]);

  // Top 5 most expensive meals
  const topExpenses = useMemo(() => {
    return [...meals]
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
  }, [meals]);

  const totalSpent = meals.reduce((sum, m) => sum + (m.cost || 0), 0);
  const totalSavings = calculateEstimatedSavings(meals, 12.50);
  const homemadeCount = meals.filter((m) => m.category === 'homemade').length;
  const restaurantCount = meals.filter((m) => m.category === 'restaurant').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Expense Analytics & Budget Audit</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Visualize where your student food funds are going and optimize cost-per-meal
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>TOTAL RECORDED SPEND</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">${totalSpent.toFixed(2)}</span>
          <span className="text-xs text-slate-400 block mt-1">Across {meals.length} total meals</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>ESTIMATED DORM SAVINGS</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">+${totalSavings.toFixed(2)}</span>
          <span className="text-xs text-emerald-800 block mt-1">Saved cooking {homemadeCount} homemade meals</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>HOMEMADE VS RESTAURANT</span>
            <ChefHat className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {meals.length > 0 ? Math.round((homemadeCount / meals.length) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-500 font-medium">Home-cooked</span>
          </div>
          <span className="text-xs text-slate-400 block mt-1">{restaurantCount} takeout visits logged</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>DAILY BUDGET CEILING</span>
            <TrendingDown className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">${dailyBudget.toFixed(2)}</span>
          <span className="text-xs text-slate-400 block mt-1">${weeklyBudget.toFixed(2)} weekly cap</span>
        </div>
      </div>

      {/* 2-Column: 14-Day Spend vs Budget & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14-Day Spend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">14-Day Food Expense Velocity</h2>
              <p className="text-xs text-slate-500">Daily spending compared to your ${dailyBudget} target allowance</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" /> Actual Spend
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-0.5 bg-rose-500 inline-block" /> Budget Target
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailySpendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `$${Number(val).toFixed(2)}`,
                    name === 'spent' ? 'Spent' : 'Target Budget',
                  ]}
                />
                <Area type="monotone" dataKey="spent" fill="#ecfdf5" stroke="#059669" strokeWidth={2} />
                <Line type="monotone" dataKey="budget" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Donut Chart (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Expense by Category</h2>
            <p className="text-xs text-slate-500">Homemade vs Dining Out vs Snacks</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Spent']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-700 font-medium">{cat.name} ({cat.count})</span>
                </div>
                <span className="font-bold text-slate-900">${cat.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column: Day-of-Week Patterns & Top Cost Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day of Week */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Spending Patterns by Day of Week</h2>
            <p className="text-xs text-slate-500">Spot weekend surges and mid-week study takeout spikes</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip formatter={(val: any) => [`$${val}`, 'Total Spent']} />
                <Bar dataKey="totalSpent" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Most Expensive Meals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Top Cost Drivers</h2>
            <p className="text-xs text-slate-500">Highest single meal expenses recorded</p>
          </div>

          <div className="space-y-2.5">
            {topExpenses.map((m, idx) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{m.name}</p>
                    <p className="text-slate-400 text-[11px]">{m.date} • {m.category}</p>
                  </div>
                </div>
                <span className="font-extrabold text-slate-900 text-sm shrink-0 ml-2">
                  ${m.cost.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
