import React, { useState, useMemo } from 'react';
import { useMeals } from '../context/MealContext';
import { Meal, MealCategory, MealType } from '../types';
import {
  Search,
  Filter,
  Download,
  Calendar,
  ChefHat,
  ShoppingBag,
  Coffee,
  DollarSign,
  Pencil,
  Trash2,
  Copy,
  Clock,
  ArrowUpDown,
  Utensils,
  PlusCircle,
} from 'lucide-react';

export const MealHistoryPage: React.FC = () => {
  const { meals, setEditingMeal, setQuickAddOpen, deleteMeal, addMeal, showToast } = useMeals();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'cost-desc' | 'cost-asc' | 'calories-desc' | 'protein-desc'>('date-desc');

  // Filter & sort meals
  const filteredMeals = useMemo(() => {
    return meals
      .filter((m) => {
        const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
        const matchesType = selectedMealType === 'all' || m.mealType === selectedMealType;
        const matchesSearch =
          !searchTerm ||
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (m.location && m.location.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesCategory && matchesType && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date-desc':
            return b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || '');
          case 'date-asc':
            return a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '');
          case 'cost-desc':
            return b.cost - a.cost;
          case 'cost-asc':
            return a.cost - b.cost;
          case 'calories-desc':
            return (b.calories || 0) - (a.calories || 0);
          case 'protein-desc':
            return (b.protein || 0) - (a.protein || 0);
          default:
            return 0;
        }
      });
  }, [meals, searchTerm, selectedCategory, selectedMealType, sortBy]);

  // Aggregate stats of filtered view
  const totalCost = filteredMeals.reduce((sum, m) => sum + (m.cost || 0), 0);
  const avgCost = filteredMeals.length > 0 ? totalCost / filteredMeals.length : 0;
  const totalCalories = filteredMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = filteredMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const homemadeCount = filteredMeals.filter((m) => m.category === 'homemade').length;
  const homemadeRatio = filteredMeals.length > 0 ? Math.round((homemadeCount / filteredMeals.length) * 100) : 0;

  // Duplicate meal for today
  const handleDuplicate = async (m: Meal) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toTimeString().substring(0, 5);
      await addMeal({
        name: m.name,
        mealType: m.mealType,
        category: m.category,
        cost: m.cost,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        date: today,
        time: nowTime,
        location: m.location,
        notes: m.notes ? `Repeated meal: ${m.notes}` : 'Repeated meal',
      });
      showToast(`Logged "${m.name}" again for today!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to duplicate meal', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from your meal log?`)) {
      await deleteMeal(id);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredMeals.length === 0) {
      showToast('No meals to export with current filters', 'info');
      return;
    }

    const headers = ['Date', 'Time', 'Meal Name', 'Meal Type', 'Category', 'Cost (USD)', 'Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Location', 'Notes'];
    const rows = filteredMeals.map((m) => [
      `"${m.date}"`,
      `"${m.time || ''}"`,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.mealType}"`,
      `"${m.category}"`,
      m.cost.toFixed(2),
      m.calories || 0,
      m.protein || 0,
      m.carbs || 0,
      m.fat || 0,
      `"${(m.location || '').replace(/"/g, '""')}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nutribudget-meals-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported meal history to CSV!', 'success');
  };

  const getCategoryBadge = (cat: MealCategory) => {
    switch (cat) {
      case 'homemade':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <ChefHat className="w-3 h-3" /> Homemade
          </span>
        );
      case 'restaurant':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            <ShoppingBag className="w-3 h-3" /> Restaurant
          </span>
        );
      case 'snack':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
            <Coffee className="w-3 h-3" /> Snack
          </span>
        );
      case 'grocery':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
            <DollarSign className="w-3 h-3" /> Grocery
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Meal & Expense History</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Search, filter, and audit every recorded meal, snack, and grocery run
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingMeal(null);
              setQuickAddOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Meal</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary for Current Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">TOTAL RECORDED</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{filteredMeals.length} meals</span>
          <span className="text-xs text-slate-400 block mt-0.5">{homemadeRatio}% homemade</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">TOTAL EXPENSE</span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">${totalCost.toFixed(2)}</span>
          <span className="text-xs text-slate-400 block mt-0.5">${avgCost.toFixed(2)} avg/meal</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">TOTAL CALORIES</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{totalCalories.toLocaleString()}</span>
          <span className="text-xs text-slate-400 block mt-0.5">kcal total</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">TOTAL PROTEIN</span>
          <span className="text-xl sm:text-2xl font-extrabold text-teal-600">{Math.round(totalProtein)}g</span>
          <span className="text-xs text-slate-400 block mt-0.5">muscle fuel</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search meals, locations, ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Food Categories</option>
              <option value="homemade">🍳 Homemade Only</option>
              <option value="restaurant">🍔 Restaurant / Takeout Only</option>
              <option value="snack">☕ Snacks & Cafe Only</option>
              <option value="grocery">🛒 Grocery Batch Only</option>
            </select>
          </div>

          {/* Meal Type filter */}
          <div>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Meal Times</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="cost-desc">Expense (Highest First)</option>
              <option value="cost-asc">Expense (Lowest First)</option>
              <option value="calories-desc">Calories (Highest First)</option>
              <option value="protein-desc">Protein (Highest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meals Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredMeals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No meals found matching your filters</p>
            <p className="text-xs text-slate-400">Try clearing your search query or changing category.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedMealType('all');
              }}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Meal Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th className="py-3 px-4 text-right">Calories</th>
                  <th className="py-3 px-4 text-right">Protein / Carbs / Fat</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMeals.map((meal) => (
                  <tr key={meal.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Date & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="font-semibold text-slate-900">{meal.date}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{meal.time || '--:--'}</span>
                        <span className="capitalize ml-1 text-slate-500 font-medium">({meal.mealType})</span>
                      </div>
                    </td>

                    {/* Meal Name & Notes */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{meal.name}</div>
                      {meal.location && (
                        <div className="text-[11px] text-slate-400 truncate">📍 {meal.location}</div>
                      )}
                      {meal.notes && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5">{meal.notes}</div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getCategoryBadge(meal.category)}
                    </td>

                    {/* Cost */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-extrabold text-slate-900 text-base">
                        ${meal.cost.toFixed(2)}
                      </span>
                    </td>

                    {/* Calories */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-semibold text-slate-700">{meal.calories}</span>
                      <span className="text-[11px] text-slate-400 ml-1">kcal</span>
                    </td>

                    {/* Macros */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-semibold text-emerald-700">{meal.protein}g P</div>
                      <div className="text-[11px] text-slate-400">
                        {meal.carbs}g C • {meal.fat}g F
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleDuplicate(meal)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Log this meal again today"
                          aria-label={`Log ${meal.name} again`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingMeal(meal);
                            setQuickAddOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit meal"
                          aria-label={`Edit ${meal.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(meal.id, meal.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete meal"
                          aria-label={`Delete ${meal.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
