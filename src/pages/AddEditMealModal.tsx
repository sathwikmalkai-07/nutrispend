import React, { useState, useEffect } from 'react';
import { useMeals } from '../context/MealContext';
import { MealInput, MealType, MealCategory } from '../types';
import {
  X,
  Sparkles,
  Utensils,
  DollarSign,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Loader2,
  Check,
  AlertCircle,
  Lightbulb,
  FileText,
} from 'lucide-react';
import { getAuthHeaders } from '../utils/api';

interface AddEditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEditMealModal: React.FC<AddEditMealModalProps> = ({ isOpen, onClose }) => {
  const { addMeal, updateMeal, editingMeal, showToast } = useMeals();

  // Mode: 'ai' or 'manual'
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [category, setCategory] = useState<MealCategory>('homemade');
  const [cost, setCost] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fat, setFat] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(new Date().toTimeString().substring(0, 5));
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (editingMeal) {
      setName(editingMeal.name);
      setMealType(editingMeal.mealType);
      setCategory(editingMeal.category);
      setCost(editingMeal.cost.toString());
      setCalories(editingMeal.calories ? editingMeal.calories.toString() : '');
      setProtein(editingMeal.protein ? editingMeal.protein.toString() : '');
      setCarbs(editingMeal.carbs ? editingMeal.carbs.toString() : '');
      setFat(editingMeal.fat ? editingMeal.fat.toString() : '');
      setDate(editingMeal.date);
      setTime(editingMeal.time || new Date().toTimeString().substring(0, 5));
      setLocation(editingMeal.location || '');
      setNotes(editingMeal.notes || '');
      setActiveTab('manual');
    } else {
      resetForm();
    }
  }, [editingMeal, isOpen]);

  const resetForm = () => {
    setName('');
    setMealType('lunch');
    setCategory('homemade');
    setCost('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().substring(0, 5));
    setLocation('');
    setNotes('');
    setAiPrompt('');
    setAiTip(null);
    setValidationError(null);
    setActiveTab('ai');
  };

  const handleAiEstimate = async (sampleText?: string) => {
    const textToAnalyze = sampleText || aiPrompt;
    if (!textToAnalyze.trim()) {
      setValidationError('Please enter a meal or food description first.');
      return;
    }

    setValidationError(null);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/estimate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ description: textToAnalyze }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI estimation failed');
      }

      const est = data.estimate;
      setName(est.name || textToAnalyze.slice(0, 40));
      setMealType(est.mealType || 'lunch');
      setCategory(est.category || 'homemade');
      setCost(est.cost !== undefined ? est.cost.toFixed(2) : '3.00');
      setCalories(est.calories ? est.calories.toString() : '450');
      setProtein(est.protein ? est.protein.toString() : '20');
      setCarbs(est.carbs ? est.carbs.toString() : '50');
      setFat(est.fat ? est.fat.toString() : '15');
      setAiTip(est.studentTip || null);
      if (est.breakdown?.length) {
        setNotes((prev) => (prev ? `${prev}\n\n` : '') + `AI Breakdown: ${est.breakdown.join('; ')}`);
      }

      setActiveTab('manual');
      showToast('Nutritional & cost estimate generated!', 'success');
    } catch (err: any) {
      setValidationError(err.message || 'Could not estimate meal with AI');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please enter a meal name.');
      return;
    }

    const numCost = parseFloat(cost);
    if (isNaN(numCost) || numCost < 0) {
      setValidationError('Please enter a valid expense cost ($0 or greater).');
      return;
    }

    setIsSubmitting(true);

    const mealData: MealInput = {
      name: name.trim(),
      mealType,
      category,
      cost: numCost,
      calories: calories ? parseInt(calories, 10) : 0,
      protein: protein ? parseFloat(protein) : 0,
      carbs: carbs ? parseFloat(carbs) : 0,
      fat: fat ? parseFloat(fat) : 0,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '12:00',
      location: location.trim(),
      notes: notes.trim(),
    };

    try {
      if (editingMeal) {
        await updateMeal(editingMeal.id, mealData);
      } else {
        await addMeal(mealData);
      }
      onClose();
      resetForm();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save meal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingMeal ? 'Edit Meal' : 'Log a Food & Meal Expense'}
              </h2>
              <p className="text-xs text-slate-500">Track cost, calories, and macros for student budgeting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!editingMeal && (
          <div className="flex border-b border-slate-100 px-6 pt-3 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'ai'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>✨ Gemini AI Autofill</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'manual'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Manual Entry & Details</span>
            </button>
          </div>
        )}

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {validationError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* AI Tab Content */}
          {activeTab === 'ai' && !editingMeal && (
            <div className="space-y-4 mb-4">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
                <label className="block text-sm font-semibold text-emerald-950 mb-1.5">
                  Describe what you ate or cooked:
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. 2 scrambled eggs on whole wheat toast with peanut butter and an apple, cooked in dorm"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />

                <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-emerald-800 font-medium">Quick student examples:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Chicken & rice bowl with broccoli',
                      'Oatmeal with whey & banana',
                      'Dining hall pizza & soda',
                      'Chipotle chicken bowl',
                    ].map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => {
                          setAiPrompt(example);
                          handleAiEstimate(example);
                        }}
                        className="text-xs bg-white text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={() => handleAiEstimate()}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm shadow-emerald-200 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini AI is calculating nutrition & cost...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Estimate Cost & Nutrition with Gemini AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* AI Tip Banner */}
          {aiTip && (
            <div className="my-4 p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-2.5">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">AI Student Tip</p>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{aiTip}</p>
              </div>
            </div>
          )}

          {/* Main Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Turkey Wrap with Spinach"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meal Time</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack / Coffee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MealCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="homemade">🍳 Homemade (Cooked in dorm/home)</option>
                  <option value="restaurant">🍔 Restaurant / Takeout / Fast Food</option>
                  <option value="snack">☕ Snack / Cafe / Vending Machine</option>
                  <option value="grocery">🛒 Grocery Batch Run</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cost ($ USD) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="2.50"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Calories (kcal)</label>
                <div className="relative">
                  <Flame className="w-4 h-4 text-amber-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="520"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Macronutrients */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nutritional Breakdown (Grams)
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1 flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-emerald-600" />
                    <span>Protein (g)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="25"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1 flex items-center gap-1">
                    <Wheat className="w-3 h-3 text-amber-600" />
                    <span>Carbs (g)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="60"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1 flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-sky-600" />
                    <span>Fat (g)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="15"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Date, Time & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Store</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Dorm Room"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Ingredients</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Cooked with store brand canned beans; batch recipe for 3 days."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{editingMeal ? 'Save Changes' : 'Record Meal'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
