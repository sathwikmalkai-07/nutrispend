import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeals } from '../context/MealContext';
import {
  User,
  DollarSign,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { user, updateProfile, resetDemoData } = useAuth();
  const { showToast } = useMeals();

  const [name, setName] = useState(user?.name || '');
  const [dailyBudget, setDailyBudget] = useState(user?.dailyBudget?.toString() || '15');
  const [weeklyBudget, setWeeklyBudget] = useState(user?.weeklyBudget?.toString() || '90');
  const [calorieGoal, setCalorieGoal] = useState(user?.dailyCalorieGoal?.toString() || '2100');
  const [proteinGoal, setProteinGoal] = useState(user?.dailyProteinGoal?.toString() || '80');
  const [carbsGoal, setCarbsGoal] = useState(user?.dailyCarbsGoal?.toString() || '250');
  const [fatGoal, setFatGoal] = useState(user?.dailyFatGoal?.toString() || '65');
  const [currencySymbol, setCurrencySymbol] = useState(user?.currencySymbol || '$');
  const [university, setUniversity] = useState(user?.university || '');
  const [selectedDiet, setSelectedDiet] = useState<string[]>(user?.dietaryRestrictions || ['Budget Friendly']);
  const [selectedGear, setSelectedGear] = useState<string[]>(user?.kitchenEquipment || ['Microwave', 'Mini Fridge']);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setDailyBudget(user.dailyBudget.toString());
      setWeeklyBudget(user.weeklyBudget.toString());
      setCalorieGoal(user.dailyCalorieGoal.toString());
      setProteinGoal(user.dailyProteinGoal.toString());
      setCarbsGoal(user.dailyCarbsGoal.toString());
      setFatGoal(user.dailyFatGoal.toString());
      setCurrencySymbol(user.currencySymbol || '$');
      setUniversity(user.university || '');
      setSelectedDiet(user.dietaryRestrictions || ['Budget Friendly']);
      setSelectedGear(user.kitchenEquipment || ['Microwave', 'Mini Fridge']);
    }
  }, [user]);

  const dietOptions = [
    'Budget Friendly',
    'High Protein',
    'Vegetarian',
    'Vegan',
    'Halal',
    'Kosher',
    'Gluten-Free',
    'Dairy-Free',
    'Low Carb / Keto',
  ];

  const gearOptions = [
    'Microwave',
    'Mini Fridge',
    'Hot Plate',
    'Electric Kettle',
    'Rice Cooker',
    'Toaster',
    'Air Fryer',
    'Full Kitchen & Oven',
  ];

  const toggleDiet = (item: string) => {
    setSelectedDiet((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleGear = (item: string) => {
    setSelectedGear((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfile({
        name: name.trim(),
        dailyBudget: parseFloat(dailyBudget) || 15,
        weeklyBudget: parseFloat(weeklyBudget) || 90,
        dailyCalorieGoal: parseInt(calorieGoal, 10) || 2100,
        dailyProteinGoal: parseFloat(proteinGoal) || 80,
        dailyCarbsGoal: parseFloat(carbsGoal) || 250,
        dailyFatGoal: parseFloat(fatGoal) || 65,
        currencySymbol,
        university: university.trim(),
        dietaryRestrictions: selectedDiet,
        kitchenEquipment: selectedGear,
      });

      setSavedSuccess(true);
      showToast('Profile and budget targets saved!', 'success');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all demo student meals and budget back to original seed data?')) {
      await resetDemoData();
      showToast('Student demo data restored!', 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Student Profile & Budget Targets</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure your food allowances, calorie goals, kitchen gear, and dietary preferences
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Your profile and budget targets have been updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Student Personal Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span>Student Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">University / Campus</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. Pacific Coast University"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Budget Goals & Currency */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Food Spending Limits</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Food Budget</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Default: $15.00/day</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weekly Food Budget</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">{currencySymbol}</span>
                <input
                  type="number"
                  step="1"
                  min="5"
                  required
                  value={weeklyBudget}
                  onChange={(e) => setWeeklyBudget(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Default: $90.00/week</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="$">$ (USD / CAD / AUD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="₹">₹ (INR)</option>
                <option value="¥">¥ (JPY / CNY)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Nutritional Goals (Calories & Macros) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>Daily Nutrition Targets</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Calories (kcal)</label>
              <input
                type="number"
                min="800"
                max="6000"
                required
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Protein (g)</label>
              <input
                type="number"
                min="10"
                required
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Carbs (g)</label>
              <input
                type="number"
                min="10"
                required
                value={carbsGoal}
                onChange={(e) => setCarbsGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fat (g)</label>
              <input
                type="number"
                min="5"
                required
                value={fatGoal}
                onChange={(e) => setFatGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Dietary Preferences & Kitchen Gear Checklists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Dietary Preferences</h3>
            <div className="flex flex-wrap gap-2">
              {dietOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleDiet(opt)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    selectedDiet.includes(opt)
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {selectedDiet.includes(opt) && '✓ '}
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Available Kitchen Gear</h3>
            <div className="flex flex-wrap gap-2">
              {gearOptions.map((gear) => (
                <button
                  key={gear}
                  type="button"
                  onClick={() => toggleGear(gear)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    selectedGear.includes(gear)
                      ? 'bg-teal-100 border-teal-300 text-teal-900 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {selectedGear.includes(gear) && '✓ '}
                  {gear}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-2.5 rounded-xl border border-rose-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Student Data</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm shadow-emerald-200 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
