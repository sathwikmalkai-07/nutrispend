import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeals } from '../context/MealContext';
import { AiMealPlanResponse, PlannedMeal, PantryRecipe } from '../types';
import {
  Sparkles,
  ChefHat,
  DollarSign,
  Clock,
  Flame,
  Dumbbell,
  ShoppingCart,
  PlusCircle,
  CheckCircle2,
  ListChecks,
  Loader2,
  Calendar,
  AlertCircle,
  Lightbulb,
  Refrigerator,
} from 'lucide-react';

import { getAuthHeaders } from '../utils/api';

interface AiMealPlannerPageProps {
  initialTab?: 'planner' | 'pantry';
}

export const AiMealPlannerPage: React.FC<AiMealPlannerPageProps> = ({ initialTab = 'planner' }) => {
  const { user } = useAuth();
  const { addMeal, showToast } = useMeals();

  const [activeTab, setActiveTab] = useState<'planner' | 'pantry'>(initialTab);

  // Meal Planner form state
  const [budget, setBudget] = useState<number>(user?.weeklyBudget ? Math.round(user.weeklyBudget * 0.7) : 50);
  const [days, setDays] = useState<number>(5);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['Budget Friendly', 'High Protein']);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['Microwave', 'Mini Fridge', 'Hot Plate']);
  const [targetCalories, setTargetCalories] = useState<number>(user?.dailyCalorieGoal || 2100);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [planResult, setPlanResult] = useState<AiMealPlanResponse | null>(null);

  // Pantry Leftovers Remix state
  const [pantryInput, setPantryInput] = useState<string>('Eggs, White Rice, Canned Black Beans, Cheddar Cheese, Soy Sauce');
  const [isRemixing, setIsRemixing] = useState<boolean>(false);
  const [remixRecipes, setRemixRecipes] = useState<PantryRecipe[] | null>(null);

  // Error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dietaryOptions = ['Budget Friendly', 'High Protein', 'Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Quick Prep (<15m)'];
  const equipmentOptions = ['Microwave', 'Mini Fridge', 'Hot Plate', 'Rice Cooker', 'Toaster', 'Air Fryer', 'Full Kitchen'];

  const togglePreference = (pref: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/meal-plan', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          budget,
          days,
          preferences: selectedPreferences,
          equipment: selectedEquipment,
          targetCalories,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate meal plan');
      }

      setPlanResult(data.plan);
      showToast('AI Student Meal Plan generated!', 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not generate meal plan');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleRemixPantry = async () => {
    if (!pantryInput.trim()) {
      setErrorMessage('Please type at least 1-2 leftover ingredients.');
      return;
    }

    setIsRemixing(true);
    setErrorMessage(null);

    const items = pantryInput.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/ai/pantry-remix', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ingredients: items,
          equipment: selectedEquipment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remix leftovers');
      }

      setRemixRecipes(data.recipes);
      showToast('Created 3 dorm leftover recipes!', 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not remix leftovers');
    } finally {
      setIsRemixing(false);
    }
  };

  const handleLogPlannedMeal = async (m: PlannedMeal) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await addMeal({
        name: m.recipeName,
        mealType: m.mealType,
        category: 'homemade',
        cost: m.estimatedCost,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        date: today,
        notes: `AI Plan: ${m.description}`,
      });
      showToast(`Logged "${m.recipeName}" to today's meals!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to log planned meal', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Tab switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">AI Meal Planner & Pantry Remix</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Powered by Gemini AI to optimize your student grocery budget and prevent food waste
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Budget Meal Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('pantry')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'pantry'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Refrigerator className="w-4 h-4" />
            <span>Dorm Pantry Remix</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ================= TAB 1: AI MEAL PLANNER ================= */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          {/* Planner Setup Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Student Meal Plan Constraints</span>
              <span className="text-xs font-normal text-slate-500">(Tailored for college dorms & tight budgets)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Budget slider/input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Budget Limit ($ USD): <span className="text-emerald-700 font-extrabold text-sm">${budget}</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="5"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>$20 (Extreme broke)</span>
                  <span>$80 (Average)</span>
                  <span>$150 (Comfortable)</span>
                </div>
              </div>

              {/* Days duration */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[3, 5, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDays(num)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                        days === num
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {num} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Calories */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Target (kcal)</label>
                <input
                  type="number"
                  step="50"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Dietary Preferences Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dietary Focus</label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((opt) => {
                  const isSel = selectedPreferences.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => togglePreference(opt)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isSel && '✓ '}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kitchen Equipment Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Available Kitchen Gear</label>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map((eq) => {
                  const isSel = selectedEquipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-teal-100 border-teal-300 text-teal-900 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isSel && '✓ '}
                      {eq}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gemini AI is crafting your {days}-day budget meal schedule...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate AI Student Meal Plan (${budget} cap)</span>
                </>
              )}
            </button>
          </div>

          {/* Plan Results */}
          {planResult && (
            <div className="space-y-6">
              {/* Plan Banner */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-6 text-white shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                      Personalized AI Schedule
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black mt-0.5">{planResult.planTitle}</h2>
                    <p className="text-xs text-emerald-100 mt-1">
                      Designed for {planResult.days} days • Estimated total grocery bill: ${planResult.totalCost.toFixed(2)} (${planResult.dailyAverageCost.toFixed(2)}/day)
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/20 text-center shrink-0">
                    <span className="text-[11px] font-medium text-emerald-100 block">TOTAL PLAN COST</span>
                    <span className="text-2xl font-black text-white">${planResult.totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* 2-Column: Planned Meals Schedule & Grocery Shopping List */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Planned Meals (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-emerald-600" />
                    <span>Day-by-Day Meal Breakdown</span>
                  </h3>

                  <div className="space-y-4">
                    {planResult.meals.map((meal, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                              {meal.dayName}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              {meal.mealType}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-extrabold text-slate-900">
                              ${meal.estimatedCost.toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-400 ml-1">serving</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900">{meal.recipeName}</h4>
                          <p className="text-xs text-slate-600 mt-1">{meal.description}</p>
                        </div>

                        {/* Nutrition & prep badges */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-700 font-semibold">
                            <Flame className="w-3.5 h-3.5 text-amber-500" /> {meal.calories} kcal
                          </span>
                          <span className="text-emerald-700 font-medium">{meal.protein}g protein</span>
                          <span className="text-amber-700 font-medium">{meal.carbs}g carbs</span>
                          <span className="text-sky-700 font-medium">{meal.fat}g fat</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3.5 h-3.5" /> {meal.prepTimeMinutes} mins prep
                          </span>
                        </div>

                        {/* Ingredients List */}
                        {meal.ingredients?.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Ingredients:
                            </span>
                            <p className="text-xs text-slate-600">{meal.ingredients.join(' • ')}</p>
                          </div>
                        )}

                        {/* Instructions */}
                        {meal.instructions?.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Instructions:
                            </span>
                            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-0.5">
                              {meal.instructions.map((step, sIdx) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Quick log button */}
                        <div className="pt-3 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() => handleLogPlannedMeal(meal)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Log this meal to Today</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Col: Grocery Shopping List & Hacks */}
                <div className="space-y-6">
                  {/* Shopping List */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-slate-900">Grocery Shopping Checklist</h3>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">
                        ${planResult.totalCost.toFixed(2)} est.
                      </span>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {planResult.shoppingList?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{item.item}</p>
                            <span className="text-[10px] text-slate-400">{item.aisle} • {item.quantity}</span>
                          </div>
                          <span className="font-bold text-slate-800">${item.estimatedPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student Money-Saving Hacks */}
                  {planResult.studentMoneySavingHacks?.length > 0 && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        <span>Student Budget Hacks</span>
                      </div>
                      <ul className="space-y-2 text-xs text-amber-900">
                        {planResult.studentMoneySavingHacks.map((hack, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{hack}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: DORMY PANTRY REMIX ================= */}
      {activeTab === 'pantry' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Refrigerator className="w-5 h-5 text-emerald-600" />
                <span>What's currently in your dorm fridge & cupboard?</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your leftover ingredients, condiments, or half-empty pantry items. Gemini AI will invent 3 zero-waste meals!
              </p>
            </div>

            <textarea
              value={pantryInput}
              onChange={(e) => setPantryInput(e.target.value)}
              placeholder="e.g. 3 eggs, half a pack of spaghetti, soy sauce, cheddar cheese, 1 can chickpeas, hot sauce"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
            />

            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-400 font-medium">Quick dorm combos:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Ramen, eggs, scallions, chili oil',
                  'Canned tuna, mayo, rice, cucumber',
                  'Tortilla, cheese, black beans, salsa',
                  'Rolled oats, peanut butter, banana',
                ].map((combo) => (
                  <button
                    key={combo}
                    type="button"
                    onClick={() => setPantryInput(combo)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {combo}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRemixPantry}
              disabled={isRemixing}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isRemixing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gemini AI is remixing your pantry leftovers...</span>
                </>
              ) : (
                <>
                  <ChefHat className="w-5 h-5" />
                  <span>Invent 3 Leftover Recipes Now ($0 Extra Grocery Trip)</span>
                </>
              )}
            </button>
          </div>

          {/* Remix Results */}
          {remixRecipes && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>3 Inventive Leftover Recipes Generated for You</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {remixRecipes.map((recipe, rIdx) => (
                  <div
                    key={rIdx}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-all space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          ~${recipe.costPerServing.toFixed(2)} / serving
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {recipe.prepTime}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">{recipe.title}</h4>

                      {/* Macros */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                        <span className="font-semibold text-slate-800">{recipe.calories} kcal</span>
                        <span className="text-emerald-700 font-medium">{recipe.protein}g protein</span>
                        <span className="text-amber-700 font-medium">{recipe.carbs}g C</span>
                        <span className="text-sky-700 font-medium">{recipe.fat}g F</span>
                      </div>

                      {/* Ingredients */}
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Ingredients Used:
                        </span>
                        <p className="text-xs text-slate-600">{recipe.ingredientsNeeded.join(', ')}</p>
                      </div>

                      {/* Instructions */}
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Cooking Steps:
                        </span>
                        <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1">
                          {recipe.steps.map((s, stepIdx) => (
                            <li key={stepIdx}>{s}</li>
                          ))}
                        </ol>
                      </div>

                      {/* Dorm Tip */}
                      {recipe.dormTip && (
                        <div className="p-2.5 bg-amber-50 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{recipe.dormTip}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        handleLogPlannedMeal({
                          dayName: 'Today',
                          mealType: 'dinner',
                          recipeName: recipe.title,
                          description: `Pantry Remix: ${recipe.ingredientsNeeded.join(', ')}`,
                          estimatedCost: recipe.costPerServing,
                          prepTimeMinutes: parseInt(recipe.prepTime, 10) || 10,
                          calories: recipe.calories,
                          protein: recipe.protein,
                          carbs: recipe.carbs,
                          fat: recipe.fat,
                          ingredients: recipe.ingredientsNeeded,
                          instructions: recipe.steps,
                        })
                      }
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Log to Today's Meals</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
