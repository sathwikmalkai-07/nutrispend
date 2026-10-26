import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Meal, MealInput } from '../types';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface MealContextType {
  meals: Meal[];
  loading: boolean;
  filter: {
    startDate?: string;
    endDate?: string;
    category?: string;
    mealType?: string;
    search?: string;
  };
  setFilter: React.Dispatch<React.SetStateAction<{
    startDate?: string;
    endDate?: string;
    category?: string;
    mealType?: string;
    search?: string;
  }>>;
  fetchMeals: () => Promise<void>;
  addMeal: (mealData: MealInput) => Promise<Meal>;
  updateMeal: (id: string, mealData: Partial<MealInput>) => Promise<Meal>;
  deleteMeal: (id: string) => Promise<void>;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  editingMeal: Meal | null;
  setEditingMeal: (meal: Meal | null) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

export const MealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [filter, setFilter] = useState<{
    startDate?: string;
    endDate?: string;
    category?: string;
    mealType?: string;
    search?: string;
  }>({
    category: 'all',
    mealType: 'all',
    search: '',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getHeaders = useCallback(() => {
    const t = token || localStorage.getItem('nutribudget_token');
    return {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    };
  }, [token]);

  const fetchMeals = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      if (filter.category && filter.category !== 'all') params.append('category', filter.category);
      if (filter.mealType && filter.mealType !== 'all') params.append('mealType', filter.mealType);
      if (filter.search) params.append('search', filter.search);

      const url = `/api/meals${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMeals(data.meals || []);
      }
    } catch (err) {
      console.error('Failed to load meals:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filter, getHeaders]);

  useEffect(() => {
    if (user) {
      fetchMeals();
    } else {
      setMeals([]);
    }
  }, [user, fetchMeals]);

  const addMeal = async (mealData: MealInput): Promise<Meal> => {
    const res = await fetch('/api/meals', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(mealData),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data.error || 'Failed to add meal';
      showToast(errMsg, 'error');
      throw new Error(errMsg);
    }

    const newMeal: Meal = data.meal;
    setMeals((prev) => [newMeal, ...prev]);
    showToast(`Logged "${newMeal.name}" ($${newMeal.cost.toFixed(2)})!`, 'success');
    return newMeal;
  };

  const updateMeal = async (id: string, mealData: Partial<MealInput>): Promise<Meal> => {
    const res = await fetch(`/api/meals/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(mealData),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data.error || 'Failed to update meal';
      showToast(errMsg, 'error');
      throw new Error(errMsg);
    }

    const updatedMeal: Meal = data.meal;
    setMeals((prev) => prev.map((m) => (m.id === id ? updatedMeal : m)));
    showToast(`Updated "${updatedMeal.name}"!`, 'success');
    return updatedMeal;
  };

  const deleteMeal = async (id: string): Promise<void> => {
    const res = await fetch(`/api/meals/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data.error || 'Failed to delete meal';
      showToast(errMsg, 'error');
      throw new Error(errMsg);
    }

    setMeals((prev) => prev.filter((m) => m.id !== id));
    showToast('Meal removed from log', 'info');
  };

  return (
    <MealContext.Provider
      value={{
        meals,
        loading,
        filter,
        setFilter,
        fetchMeals,
        addMeal,
        updateMeal,
        deleteMeal,
        quickAddOpen,
        setQuickAddOpen,
        editingMeal,
        setEditingMeal,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </MealContext.Provider>
  );
};

export const useMeals = () => {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMeals must be used within a MealProvider');
  }
  return context;
};
