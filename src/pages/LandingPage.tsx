import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed,
  Sparkles,
  TrendingDown,
  ChefHat,
  DollarSign,
  HeartPulse,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Coffee,
} from 'lucide-react';

interface LandingPageProps {
  setCurrentView: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentView }) => {
  const { demoLogin, user } = useAuth();

  // Interactive quick budget simulator
  const [simBudget, setSimBudget] = useState(15);
  const [cookingStyle, setCookingStyle] = useState<'mixed' | 'home' | 'takeout'>('mixed');

  // Calculate simulated monthly savings
  let monthlyTakeoutCost = 30 * 14.50; // $435/mo if eating out
  let actualSimCost = simBudget * 30; // budget chosen
  let estimatedSavings = Math.max(0, monthlyTakeoutCost - actualSimCost);

  const handleStartDemo = async () => {
    if (!user) {
      await demoLogin();
    }
    setCurrentView('dashboard');
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built Specifically for College & University Students</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Eat Healthy on a <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
              Broke Student Budget.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            NutriBudget AI turns tight food allowances into high-protein, nutritious meals. Track expenses, audit takeout leaks, and generate $2 dorm recipes with Gemini AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Live Demo as Alex (Student)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentView('auth')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm sm:text-base transition-colors cursor-pointer"
            >
              <span>Create Free Account / Sign In</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">✓ 100% Free for Students</span>
            <span className="flex items-center gap-1.5">✓ Gemini 3.8 AI Powered</span>
            <span className="flex items-center gap-1.5">✓ Zero Spreadsheets Needed</span>
          </div>
        </div>
      </section>

      {/* Interactive Quick Budget Simulator */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
              Interactive Simulator
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              See How Much You Can Pocket Every Month
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100">
              Adjust your daily food target to calculate potential student savings vs campus dining halls & takeout
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  Target Daily Food Allowance:
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-300">${simBudget} / day</span>
              </div>
              <input
                type="range"
                min="8"
                max="25"
                step="1"
                value={simBudget}
                onChange={(e) => setSimBudget(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-emerald-200/70 mt-1">
                <span>$8/day (Batch cook champion)</span>
                <span>$15/day (Balanced dorm cook)</span>
                <span>$25/day (Frequent dining out)</span>
              </div>
            </div>

            {/* Simulated Result Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/15 text-center">
              <div className="bg-black/20 p-3.5 rounded-xl">
                <span className="text-[11px] text-slate-300 block">Monthly Food Spend</span>
                <span className="text-xl font-extrabold text-white">${simBudget * 30}</span>
              </div>
              <div className="bg-black/20 p-3.5 rounded-xl">
                <span className="text-[11px] text-slate-300 block">Campus Deli Equivalent</span>
                <span className="text-xl font-extrabold text-slate-400 line-through">$435</span>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-400/30 p-3.5 rounded-xl">
                <span className="text-[11px] text-emerald-200 block font-semibold">Your Monthly Savings</span>
                <span className="text-xl font-black text-emerald-300">+${estimatedSavings}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed for Real Student Life
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From late-night study sessions to budget ALDI runs, NutriBudget AI gives you total visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Track Homemade vs Takeout</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instantly categorize each food item. Spot when $12 DoorDash deliveries are draining your textbook savings.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Gemini AI Magic Autofill</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Type what you ate (e.g. "Scrambled eggs with spinach & toast") and Gemini calculates the calories, protein, and cost automatically.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ChefHat className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Dorm Pantry Leftover Remix</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Got 2 eggs, ramen, and a can of black beans? AI invents 3 healthy, zero-waste recipes with no extra grocery trip needed.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Student Protein Economics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track cost-per-100g of protein to maximize muscle fuel while keeping daily spending below $15.
            </p>
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">
          Trusted by Students Across Campuses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <p className="text-xs text-slate-600 italic">
              "I used to spend $14 every day at the campus food court without noticing. NutriBudget's weekly burn rate opened my eyes. I saved $190 in my first month."
            </p>
            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                M
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Maya S.</p>
                <p className="text-[11px] text-slate-400">State University • Bio major</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <p className="text-xs text-slate-600 italic">
              "The AI Pantry Remix is incredible. I only had eggs, peanut butter, and leftover white rice in my dorm, and it gave me a Thai-style savory skillet recipe that tasted amazing."
            </p>
            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                J
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Jordan K.</p>
                <p className="text-[11px] text-slate-400">Community College • Sophomore</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <p className="text-xs text-slate-600 italic">
              "Being able to see that eggs and canned tuna cost $4.50 per 100g protein while takeout costs $28 made it so easy to hit my fitness goals on a student budget."
            </p>
            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                D
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Devon R.</p>
                <p className="text-[11px] text-slate-400">Tech Institute • Junior</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center space-y-4 pt-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Ready to Take Control of Your Student Food Budget?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Start logging meals today or explore the pre-populated student demo account.
        </p>
        <button
          onClick={handleStartDemo}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-200 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch NutriBudget AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
