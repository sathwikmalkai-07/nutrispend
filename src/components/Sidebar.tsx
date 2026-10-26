import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeals } from '../context/MealContext';
import { calculateDailySpend } from '../utils/budgetCalculations';
import { calculateNutritionTotals } from '../utils/nutritionCalculations';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  TrendingDown,
  Activity,
  Sparkles,
  ChefHat,
  HeartPulse,
  Settings,
  Compass,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { user, resetDemoData } = useAuth();
  const { meals, setQuickAddOpen, setEditingMeal, showToast } = useMeals();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter((m) => m.date === todayStr);
  const spentToday = calculateDailySpend(meals, todayStr);
  const nutritionToday = calculateNutritionTotals(todayMeals);

  const dailyBudget = user?.dailyBudget || 15;
  const remainingToday = Number((dailyBudget - spentToday).toFixed(2));
  const dailyPercent = Math.min(Math.round((spentToday / dailyBudget) * 100), 100);

  const calorieGoal = user?.dailyCalorieGoal || 2100;
  const caloriePercent = Math.min(Math.round((nutritionToday.calories / calorieGoal) * 100), 100);

  const navItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    {
      id: 'add-meal',
      label: 'Log / Add Meal',
      icon: PlusCircle,
      action: () => {
        setEditingMeal(null);
        setQuickAddOpen(true);
      },
    },
    { id: 'history', label: 'Meal History', icon: History },
    { id: 'expense-analytics', label: 'Expense Analytics', icon: TrendingDown },
    { id: 'nutrition-analytics', label: 'Nutrition Analytics', icon: Activity },
    { id: 'ai-planner', label: 'AI Meal Planner', icon: Sparkles, badge: 'AI' },
    { id: 'pantry-remix', label: 'Dorm Pantry Remix', icon: ChefHat, badge: 'New' },
    { id: 'ai-coach', label: 'AI Health Coach', icon: HeartPulse, badge: 'AI' },
    { id: 'settings', label: 'Profile & Settings', icon: Settings },
    { id: 'landing', label: 'About & Features', icon: Compass },
  ];

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (item.action) {
      item.action();
    } else {
      setCurrentView(item.id);
    }
    setMobileMenuOpen(false);
  };

  const handleReset = async () => {
    if (window.confirm('Reset student demo data to the initial state?')) {
      await resetDemoData();
      showToast('Demo student data reset successfully!', 'info');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* User welcome card */}
          {user && (
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 border border-emerald-100 rounded-2xl p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-emerald-700 font-medium truncate">{user.university || 'Student'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Links list */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Quick Progress Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
          <div className="space-y-2">
            {/* Daily spend gauge */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Today's Budget</span>
              <span className="font-semibold text-slate-700">
                ${spentToday.toFixed(2)} / ${dailyBudget.toFixed(2)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  dailyPercent > 95
                    ? 'bg-rose-500'
                    : dailyPercent > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${dailyPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>{remainingToday >= 0 ? `$${remainingToday.toFixed(2)} left` : 'Over budget'}</span>
              <span>{dailyPercent}%</span>
            </div>
          </div>

          {/* Calorie mini gauge */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Calories</span>
              <span className="font-semibold text-slate-700">
                {nutritionToday.calories} / {calorieGoal} kcal
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
          </div>

          {/* Reset Demo Data button */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/80 py-1.5 rounded-lg border border-dashed border-slate-300 transition-colors mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
