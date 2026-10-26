import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeals } from '../context/MealContext';
import { calculateWeeklySpend, calculateDailySpend } from '../utils/budgetCalculations';
import {
  UtensilsCrossed,
  PlusCircle,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  User,
  LogOut,
  RefreshCw,
  Award,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { user, logout, resetDemoData, demoLogin } = useAuth();
  const { meals, setQuickAddOpen, setEditingMeal } = useMeals();

  const todayStr = new Date().toISOString().split('T')[0];
  const spentToday = calculateDailySpend(meals, todayStr);
  const spentThisWeek = calculateWeeklySpend(meals, todayStr);

  const weeklyBudget = user?.weeklyBudget || 90;
  const weeklyRemaining = Math.max(0, weeklyBudget - spentThisWeek);
  const weeklyPercent = Math.min(Math.round((spentThisWeek / weeklyBudget) * 100), 100);

  const handleOpenAddMeal = () => {
    setEditingMeal(null);
    setQuickAddOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 lg:hidden focus:outline-hidden"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">NutriBudget</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    AI
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">Smart Student Nutrition & Expense Tracker</p>
              </div>
            </button>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                {/* Weekly Budget Quick Pill (Hidden on tiny screens) */}
                <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500">Week:</span>
                    <span className="font-semibold text-slate-800">
                      ${spentThisWeek.toFixed(2)} / ${weeklyBudget.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        weeklyPercent > 90
                          ? 'bg-rose-500'
                          : weeklyPercent > 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${weeklyPercent}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
                      weeklyRemaining > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    ${weeklyRemaining.toFixed(0)} left
                  </span>
                </div>

                {/* Quick Add Meal Button */}
                <button
                  onClick={handleOpenAddMeal}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm shadow-emerald-200 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden xs:inline">Log Meal</span>
                  <span className="xs:hidden">Log</span>
                </button>

                {/* User Info & Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setCurrentView('settings')}
                    className="p-2 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    title="Profile & Budget Settings"
                    aria-label="Profile and settings"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => logout()}
                    className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Sign Out"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('auth')}
                  className="text-sm font-medium text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={() => demoLogin()}
                  className="flex items-center gap-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Demo Student</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
