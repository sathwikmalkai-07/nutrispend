import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeals } from '../context/MealContext';
import {
  UtensilsCrossed,
  Sparkles,
  Lock,
  Mail,
  User,
  GraduationCap,
  DollarSign,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register, demoLogin } = useAuth();
  const { showToast } = useMeals();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [dailyBudget, setDailyBudget] = useState('15');
  const [weeklyBudget, setWeeklyBudget] = useState('90');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Welcome back to NutriBudget AI!', 'success');
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          dailyBudget: parseFloat(dailyBudget) || 15,
          weeklyBudget: parseFloat(weeklyBudget) || 90,
          university: university.trim(),
        });
        showToast('Student account created! Welcome aboard!', 'success');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await demoLogin();
      showToast('Logged in as Alex Chen (Demo Student)', 'success');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Header branding */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto border border-white/20">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">NutriBudget AI</h1>
          <p className="text-xs text-emerald-100 max-w-xs mx-auto">
            Student food expense analyzer & smart nutrition planner
          </p>
        </div>

        {/* 1-Click Demo Shortcut Banner */}
        <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold text-emerald-950">
              Want to test immediately?
            </span>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Explore as Demo Student
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-slate-100 text-center text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-3 transition-colors cursor-pointer ${
              mode === 'login'
                ? 'border-b-2 border-emerald-600 text-emerald-700'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-3 transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-b-2 border-emerald-600 text-emerald-700'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Chen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">University / Campus</label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="State University"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Budget ($)</label>
                    <input
                      type="number"
                      min="1"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Weekly Budget ($)</label>
                    <input
                      type="number"
                      min="5"
                      value={weeklyBudget}
                      onChange={(e) => setWeeklyBudget(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 disabled:opacity-50 transition-colors mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to NutriBudget' : 'Create Free Student Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">Demo student credentials: </span>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                demo@student.edu / demo1234
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
