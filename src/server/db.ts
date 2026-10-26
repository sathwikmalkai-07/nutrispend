import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { UserProfile, Meal, MealInput } from '../types';

interface DBUser extends UserProfile {
  passwordHash: string;
}

interface DBSchema {
  users: DBUser[];
  meals: Meal[];
  plans: any[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'nutribudget-db.json');

// Helper to get formatted dates in current week
function getDateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// Initial realistic student seed data
function getInitialSeedData(): DBSchema {
  const salt = bcrypt.genSaltSync(10);
  const demoHashedPassword = bcrypt.hashSync('demo1234', salt);

  const demoUserId = 'user-student-alex';

  const demoUser: DBUser = {
    id: demoUserId,
    name: 'Alex Chen',
    email: 'demo@student.edu',
    passwordHash: demoHashedPassword,
    dailyBudget: 15.00,
    weeklyBudget: 95.00,
    dailyCalorieGoal: 2200,
    dailyProteinGoal: 90,
    dailyCarbsGoal: 260,
    dailyFatGoal: 70,
    currencySymbol: '$',
    dietaryRestrictions: ['Budget Friendly', 'High Protein'],
    kitchenEquipment: ['Microwave', 'Mini Fridge', 'Hot Plate', 'Electric Kettle'],
    university: 'Pacific Coast University',
    createdAt: new Date().toISOString(),
  };

  // Seed meals for the past 6 days + today
  const meals: Meal[] = [
    // Today
    {
      id: 'm-today-1',
      userId: demoUserId,
      name: 'Peanut Butter & Banana Oats with Whey',
      mealType: 'breakfast',
      category: 'homemade',
      cost: 1.65,
      calories: 450,
      protein: 28,
      carbs: 62,
      fat: 11,
      date: getDateOffset(0),
      time: '08:30',
      notes: 'Quick dorm breakfast before 9 AM bio lecture. 1 cup oats, 1 scoop vanilla whey, peanut butter.',
      location: 'Dorm Room 304',
      healthScore: 92,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'm-today-2',
      userId: demoUserId,
      name: 'Chicken Rice & Black Bean Bowl',
      mealType: 'lunch',
      category: 'homemade',
      cost: 2.80,
      calories: 620,
      protein: 42,
      carbs: 75,
      fat: 14,
      date: getDateOffset(0),
      time: '12:45',
      notes: 'Meal-prepped on Sunday night in big Pyrex container. Canned black beans, jasmine rice, seasoned chicken breast.',
      location: 'Student Union Lounge',
      healthScore: 95,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'm-today-3',
      userId: demoUserId,
      name: 'Cold Brew & Trail Mix',
      mealType: 'snack',
      category: 'snack',
      cost: 3.25,
      calories: 220,
      protein: 6,
      carbs: 24,
      fat: 12,
      date: getDateOffset(0),
      time: '15:30',
      notes: 'Library study session pick-me-up.',
      location: 'Campus Coffee Cart',
      healthScore: 78,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    // Yesterday (1 day ago)
    {
      id: 'm-yest-1',
      userId: demoUserId,
      name: 'Greek Yogurt with Frozen Berries & Honey',
      mealType: 'breakfast',
      category: 'homemade',
      cost: 1.90,
      calories: 310,
      protein: 22,
      carbs: 38,
      fat: 5,
      date: getDateOffset(1),
      time: '08:15',
      notes: 'Kirkland Greek yogurt tub is a budget lifesaver.',
      location: 'Dorm Room',
      healthScore: 94,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'm-yest-2',
      userId: demoUserId,
      name: 'Campus Dining Hall Salad & Turkey Wrap',
      mealType: 'lunch',
      category: 'restaurant',
      cost: 8.50,
      calories: 680,
      protein: 34,
      carbs: 68,
      fat: 26,
      date: getDateOffset(1),
      time: '13:00',
      notes: 'Forgot meal prep box, bought at student commons.',
      location: 'Student Commons Deli',
      healthScore: 82,
      createdAt: new Date(Date.now() - 86400000 + 3600000 * 4).toISOString(),
    },
    {
      id: 'm-yest-3',
      userId: demoUserId,
      name: 'Garlic Butter Spaghetti & Canned Tuna',
      mealType: 'dinner',
      category: 'homemade',
      cost: 2.10,
      calories: 580,
      protein: 36,
      carbs: 78,
      fat: 12,
      date: getDateOffset(1),
      time: '19:15',
      notes: 'Classic broke student high-protein feast. Added chili flakes and lemon.',
      location: 'Dorm Kitchen',
      healthScore: 88,
      createdAt: new Date(Date.now() - 86400000 + 3600000 * 10).toISOString(),
    },
    // 2 days ago
    {
      id: 'm-2d-1',
      userId: demoUserId,
      name: 'Scrambled Eggs on Whole Grain Toast (3 eggs)',
      mealType: 'breakfast',
      category: 'homemade',
      cost: 1.45,
      calories: 380,
      protein: 24,
      carbs: 28,
      fat: 18,
      date: getDateOffset(2),
      time: '09:00',
      notes: 'Cooked on hot plate with butter.',
      location: 'Dorm Room',
      healthScore: 90,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'm-2d-2',
      userId: demoUserId,
      name: 'Chicken Rice & Black Bean Bowl',
      mealType: 'lunch',
      category: 'homemade',
      cost: 2.80,
      calories: 620,
      protein: 42,
      carbs: 75,
      fat: 14,
      date: getDateOffset(2),
      time: '12:30',
      notes: 'Batch prep #2.',
      location: 'Engineering Quad Bench',
      healthScore: 95,
      createdAt: new Date(Date.now() - 86400000 * 2 + 3600000 * 4).toISOString(),
    },
    {
      id: 'm-2d-3',
      userId: demoUserId,
      name: 'Chipotle Chicken Burrito Bowl',
      mealType: 'dinner',
      category: 'restaurant',
      cost: 11.75,
      calories: 840,
      protein: 48,
      carbs: 88,
      fat: 32,
      date: getDateOffset(2),
      time: '19:45',
      notes: 'Group dinner after midterms exam. Extra pinto beans.',
      location: 'Chipotle Ave',
      healthScore: 80,
      createdAt: new Date(Date.now() - 86400000 * 2 + 3600000 * 11).toISOString(),
    },
    // 3 days ago
    {
      id: 'm-3d-1',
      userId: demoUserId,
      name: 'Peanut Butter Banana Toast & Milk',
      mealType: 'breakfast',
      category: 'homemade',
      cost: 1.20,
      calories: 420,
      protein: 16,
      carbs: 58,
      fat: 15,
      date: getDateOffset(3),
      time: '08:45',
      location: 'Dorm Room',
      healthScore: 86,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'm-3d-2',
      userId: demoUserId,
      name: 'Subway 6-inch Rotisserie Chicken',
      mealType: 'lunch',
      category: 'restaurant',
      cost: 7.95,
      calories: 550,
      protein: 30,
      carbs: 52,
      fat: 21,
      date: getDateOffset(3),
      time: '13:15',
      location: 'Subway Plaza',
      healthScore: 84,
      createdAt: new Date(Date.now() - 86400000 * 3 + 3600000 * 4).toISOString(),
    },
    {
      id: 'm-3d-3',
      userId: demoUserId,
      name: 'Spicy Tofu & Veggie Stir Fry with Brown Rice',
      mealType: 'dinner',
      category: 'homemade',
      cost: 2.65,
      calories: 490,
      protein: 26,
      carbs: 64,
      fat: 14,
      date: getDateOffset(3),
      time: '19:00',
      notes: 'Firm tofu block ($1.89) split into two dinners. Soy sauce, sriracha, frozen stir-fry veggies.',
      location: 'Floor Kitchen',
      healthScore: 96,
      createdAt: new Date(Date.now() - 86400000 * 3 + 3600000 * 10).toISOString(),
    },
    // 4 days ago
    {
      id: 'm-4d-1',
      userId: demoUserId,
      name: 'Instant Oatmeal with Chia Seeds & Cinnamon',
      mealType: 'breakfast',
      category: 'homemade',
      cost: 0.95,
      calories: 280,
      protein: 10,
      carbs: 48,
      fat: 6,
      date: getDateOffset(4),
      time: '08:00',
      location: 'Dorm Room',
      healthScore: 91,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'm-4d-2',
      userId: demoUserId,
      name: 'Lentil & Sweet Potato Curry with Rice',
      mealType: 'lunch',
      category: 'homemade',
      cost: 1.85,
      calories: 540,
      protein: 22,
      carbs: 88,
      fat: 8,
      date: getDateOffset(4),
      time: '12:40',
      location: 'Library Cafe Seating',
      healthScore: 97,
      createdAt: new Date(Date.now() - 86400000 * 4 + 3600000 * 4).toISOString(),
    },
    {
      id: 'm-4d-3',
      userId: demoUserId,
      name: 'Vending Machine Chips & Energy Drink',
      mealType: 'snack',
      category: 'snack',
      cost: 4.50,
      calories: 340,
      protein: 2,
      carbs: 55,
      fat: 14,
      date: getDateOffset(4),
      time: '16:00',
      notes: 'All-nighter study rush. Unhealthy impulse buy.',
      location: 'Library Basement',
      healthScore: 42,
      createdAt: new Date(Date.now() - 86400000 * 4 + 3600000 * 7).toISOString(),
    },
    {
      id: 'm-4d-4',
      userId: demoUserId,
      name: 'Egg & Cheddar Quesadilla with Salsa',
      mealType: 'dinner',
      category: 'homemade',
      cost: 2.15,
      calories: 520,
      protein: 28,
      carbs: 38,
      fat: 26,
      date: getDateOffset(4),
      time: '20:15',
      location: 'Dorm Kitchenette',
      healthScore: 85,
      createdAt: new Date(Date.now() - 86400000 * 4 + 3600000 * 11).toISOString(),
    },
    // 5 days ago
    {
      id: 'm-5d-1',
      userId: demoUserId,
      name: 'Hard Boiled Eggs (3) & Apple',
      mealType: 'breakfast',
      category: 'homemade',
      cost: 1.30,
      calories: 310,
      protein: 20,
      carbs: 26,
      fat: 14,
      date: getDateOffset(5),
      time: '08:20',
      location: 'Dorm Room',
      healthScore: 93,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'm-5d-2',
      userId: demoUserId,
      name: 'Campus Food Truck Street Tacos (3)',
      mealType: 'lunch',
      category: 'restaurant',
      cost: 10.50,
      calories: 720,
      protein: 38,
      carbs: 62,
      fat: 32,
      date: getDateOffset(5),
      time: '13:00',
      location: 'Food Truck Alley',
      healthScore: 76,
      createdAt: new Date(Date.now() - 86400000 * 5 + 3600000 * 4).toISOString(),
    },
    {
      id: 'm-5d-3',
      userId: demoUserId,
      name: 'Ramen Upgrade with Poached Egg & Scallions',
      mealType: 'dinner',
      category: 'homemade',
      cost: 1.15,
      calories: 460,
      protein: 15,
      carbs: 58,
      fat: 18,
      date: getDateOffset(5),
      time: '19:30',
      notes: 'Added baby bok choy and half a pack of ramen spice to cut sodium.',
      location: 'Dorm Room',
      healthScore: 72,
      createdAt: new Date(Date.now() - 86400000 * 5 + 3600000 * 10).toISOString(),
    },
    // 6 days ago (Sunday batch cooking)
    {
      id: 'm-6d-1',
      userId: demoUserId,
      name: 'Pancake Stack with Banana & Cinnamon',
      mealType: 'breakfast',
      category: 'homemade',
      cost: 1.80,
      calories: 510,
      protein: 14,
      carbs: 85,
      fat: 11,
      date: getDateOffset(6),
      time: '10:00',
      location: 'Dorm Kitchen',
      healthScore: 82,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 'm-6d-2',
      userId: demoUserId,
      name: 'Grocery Batch Ingredients (Chicken, Rice, Beans, Veggies)',
      mealType: 'dinner',
      category: 'grocery',
      cost: 22.40,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      date: getDateOffset(6),
      time: '15:00',
      notes: 'Weekly grocery run at ALDI. Prep for the week meals!',
      location: 'ALDI Grocery Store',
      healthScore: 98,
      createdAt: new Date(Date.now() - 86400000 * 6 + 3600000 * 5).toISOString(),
    },
  ];

  return {
    users: [demoUser],
    meals,
    plans: [],
  };
}

class NutriBudgetDatabase {
  private data: DBSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DBSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading DB file, using fresh seeds:', err);
    }

    const initial = getInitialSeedData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DBSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  public resetDemoData(): void {
    this.data = getInitialSeedData();
    this.saveData();
  }

  // --- User Operations ---
  public getUserByEmail(email: string): DBUser | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): DBUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(userData: {
    name: string;
    email: string;
    password: string;
    dailyBudget?: number;
    weeklyBudget?: number;
    university?: string;
  }): UserProfile {
    const existing = this.getUserByEmail(userData.email);
    if (existing) {
      throw new Error('A student account with this email already exists.');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.password, salt);
    const newUserId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newUser: DBUser = {
      id: newUserId,
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      passwordHash,
      dailyBudget: userData.dailyBudget || 15.00,
      weeklyBudget: userData.weeklyBudget || 90.00,
      dailyCalorieGoal: 2100,
      dailyProteinGoal: 80,
      dailyCarbsGoal: 250,
      dailyFatGoal: 65,
      currencySymbol: '$',
      dietaryRestrictions: ['Budget Friendly'],
      kitchenEquipment: ['Microwave', 'Mini Fridge'],
      university: userData.university || 'College Campus',
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.saveData();

    // Return safe profile without passwordHash
    const { passwordHash: _, ...safeProfile } = newUser;
    return safeProfile;
  }

  public updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const userIndex = this.data.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const current = this.data.users[userIndex];
    const updated: DBUser = {
      ...current,
      ...updates,
      id: current.id, // prevent id change
      email: current.email, // prevent email change
      passwordHash: current.passwordHash,
    };

    this.data.users[userIndex] = updated;
    this.saveData();

    const { passwordHash: _, ...safeProfile } = updated;
    return safeProfile;
  }

  // --- Meal Operations ---
  public getMealsByUser(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    mealType?: string;
    search?: string;
  }): Meal[] {
    let list = this.data.meals.filter((m) => m.userId === userId);

    if (filters) {
      if (filters.startDate) {
        list = list.filter((m) => m.date >= filters.startDate!);
      }
      if (filters.endDate) {
        list = list.filter((m) => m.date <= filters.endDate!);
      }
      if (filters.category && filters.category !== 'all') {
        list = list.filter((m) => m.category === filters.category);
      }
      if (filters.mealType && filters.mealType !== 'all') {
        list = list.filter((m) => m.mealType === filters.mealType);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            (m.notes && m.notes.toLowerCase().includes(q)) ||
            (m.location && m.location.toLowerCase().includes(q))
        );
      }
    }

    // Sort newest date & time first
    return list.sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date);
      if (dateDiff !== 0) return dateDiff;
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeB.localeCompare(timeA);
    });
  }

  public getMealById(mealId: string, userId: string): Meal | undefined {
    return this.data.meals.find((m) => m.id === mealId && m.userId === userId);
  }

  public createMeal(userId: string, input: MealInput): Meal {
    const mealId = `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMeal: Meal = {
      id: mealId,
      userId,
      name: input.name.trim(),
      mealType: input.mealType,
      category: input.category,
      cost: Number(Number(input.cost || 0).toFixed(2)),
      calories: Math.max(0, Math.round(Number(input.calories || 0))),
      protein: Math.max(0, Math.round((Number(input.protein || 0)) * 10) / 10),
      carbs: Math.max(0, Math.round((Number(input.carbs || 0)) * 10) / 10),
      fat: Math.max(0, Math.round((Number(input.fat || 0)) * 10) / 10),
      date: input.date || new Date().toISOString().split('T')[0],
      time: input.time || new Date().toTimeString().substring(0, 5),
      notes: input.notes?.trim() || '',
      location: input.location?.trim() || '',
      healthScore: input.healthScore ? Math.min(100, Math.max(1, Math.round(input.healthScore))) : 80,
      createdAt: new Date().toISOString(),
    };

    this.data.meals.push(newMeal);
    this.saveData();
    return newMeal;
  }

  public updateMeal(mealId: string, userId: string, updates: Partial<MealInput>): Meal {
    const index = this.data.meals.findIndex((m) => m.id === mealId && m.userId === userId);
    if (index === -1) {
      throw new Error('Meal not found');
    }

    const current = this.data.meals[index];
    const updated: Meal = {
      ...current,
      ...updates,
      id: current.id,
      userId: current.userId,
      cost: typeof updates.cost !== 'undefined' ? Number(Number(updates.cost).toFixed(2)) : current.cost,
      calories: typeof updates.calories !== 'undefined' ? Math.max(0, Math.round(Number(updates.calories))) : current.calories,
      protein: typeof updates.protein !== 'undefined' ? Math.max(0, Math.round(Number(updates.protein) * 10) / 10) : current.protein,
      carbs: typeof updates.carbs !== 'undefined' ? Math.max(0, Math.round(Number(updates.carbs) * 10) / 10) : current.carbs,
      fat: typeof updates.fat !== 'undefined' ? Math.max(0, Math.round(Number(updates.fat) * 10) / 10) : current.fat,
      createdAt: current.createdAt,
    };

    this.data.meals[index] = updated;
    this.saveData();
    return updated;
  }

  public deleteMeal(mealId: string, userId: string): boolean {
    const prevLen = this.data.meals.length;
    this.data.meals = this.data.meals.filter((m) => !(m.id === mealId && m.userId === userId));
    const deleted = this.data.meals.length < prevLen;
    if (deleted) {
      this.saveData();
    }
    return deleted;
  }
}

export const db = new NutriBudgetDatabase();
