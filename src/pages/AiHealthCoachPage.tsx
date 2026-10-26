import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeals } from '../context/MealContext';
import { CoachAdvice } from '../types';
import {
  HeartPulse,
  Sparkles,
  Award,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  Loader2,
  RefreshCw,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { getAuthHeaders } from '../utils/api';

export const AiHealthCoachPage: React.FC<{ setCurrentView: (v: string) => void }> = ({ setCurrentView }) => {
  const { user } = useAuth();
  const { meals, showToast } = useMeals();

  const [advice, setAdvice] = useState<CoachAdvice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCoachAdvice();
  }, [user]);

  const fetchCoachAdvice = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/coach-advice', {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (res.ok && data.advice) {
        setAdvice(data.advice);
      }
    } catch (err) {
      console.error('Failed to get coach advice:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">AI Budget & Nutrition Health Coach</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Personalized audit of your live spending pace, takeout habits, and protein targets
          </p>
        </div>

        <button
          onClick={fetchCoachAdvice}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Refresh Coach Diagnosis</span>
        </button>
      </div>

      {loading && !advice ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-sm font-bold text-slate-800">Analyzing your student meal records...</p>
          <p className="text-xs text-slate-400">Comparing your expenses against your weekly budget and protein intake</p>
        </div>
      ) : advice ? (
        <div className="space-y-6">
          {/* Main Status Hero */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold px-3 py-1 bg-white/10 text-emerald-200 rounded-full uppercase tracking-wider">
                Live Student Diagnosis
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Pace Status:</span>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    advice.statusRating === 'On Track'
                      ? 'bg-emerald-500 text-white'
                      : advice.statusRating === 'Watch Out'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {advice.statusRating}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-w-3xl">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{advice.weeklyBurnRate}</h2>
              <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">{advice.encouragement}</p>
            </div>

            <div className="pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                  Primary Spending Trap Detected
                </span>
                <p className="text-sm font-medium text-white">{advice.biggestSpendingTrap}</p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                  Projected Weekend Savings
                </span>
                <p className="text-2xl font-black text-emerald-400">+${advice.projectedWeekendSavings.toFixed(2)}</p>
                <span className="text-xs text-slate-300">By swapping 2 takeout meals for batch cooking</span>
              </div>
            </div>
          </div>

          {/* 3 Action Steps */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>3 Concrete Action Steps for this Week</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advice.actionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                      {idx + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links to tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentView('ai-planner')}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-xs text-left group transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Generate a $40 Student Grocery Plan →
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Full shopping checklist and 5 days of easy dorm recipes
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => setCurrentView('pantry-remix')}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-xs text-left group transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Remix Current Dorm Leftovers →
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Cook dinner tonight for $0 using what you already have
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
