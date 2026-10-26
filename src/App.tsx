import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MealProvider, useMeals } from './context/MealContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { DashboardPage } from './pages/DashboardPage';
import { MealHistoryPage } from './pages/MealHistoryPage';
import { ExpenseAnalyticsPage } from './pages/ExpenseAnalyticsPage';
import { NutritionAnalyticsPage } from './pages/NutritionAnalyticsPage';
import { AiMealPlannerPage } from './pages/AiMealPlannerPage';
import { AiHealthCoachPage } from './pages/AiHealthCoachPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AddEditMealModal } from './pages/AddEditMealModal';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const { quickAddOpen, setQuickAddOpen } = useMeals();

  // Detect autostart or view param from URL
  const [currentView, setCurrentView] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view')) return params.get('view')!;
    if (params.get('autostart') === '1') return 'dashboard';
    return 'dashboard';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync view to URL search params when changed
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', currentView);
    window.history.replaceState({}, '', url.toString());
  }, [currentView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-800">Starting NutriBudget AI...</p>
        <p className="text-xs text-slate-400 mt-1">Loading student nutrition and budget data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans antialiased flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar for logged-in or app navigation */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Content Area (offset on large screens for sidebar) */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 lg:ml-64">
          {currentView === 'dashboard' && <DashboardPage setCurrentView={setCurrentView} />}
          {currentView === 'history' && <MealHistoryPage />}
          {currentView === 'expense-analytics' && <ExpenseAnalyticsPage />}
          {currentView === 'nutrition-analytics' && <NutritionAnalyticsPage />}
          {currentView === 'ai-planner' && <AiMealPlannerPage initialTab="planner" />}
          {currentView === 'pantry-remix' && <AiMealPlannerPage initialTab="pantry" />}
          {currentView === 'ai-coach' && <AiHealthCoachPage setCurrentView={setCurrentView} />}
          {currentView === 'settings' && <ProfileSettingsPage />}
          {currentView === 'landing' && <LandingPage setCurrentView={setCurrentView} />}
          {currentView === 'auth' && <AuthPage onSuccess={() => setCurrentView('dashboard')} />}
        </main>
      </div>

      {/* Add / Edit Meal Modal */}
      <AddEditMealModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MealProvider>
        <AppContent />
      </MealProvider>
    </AuthProvider>
  );
}
