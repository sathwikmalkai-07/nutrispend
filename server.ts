import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './src/server/db';
import { estimateMealNutrition, generateStudentMealPlan, remixPantryLeftovers, getAiCoachAdvice } from './src/server/gemini';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Simple token storage (in-memory with 30-day longevity)
const activeSessions = new Map<string, { userId: string; createdAt: number }>();

function createSessionToken(userId: string): string {
  const token = `nb_${userId}_${crypto.randomBytes(24).toString('hex')}`;
  activeSessions.set(token, { userId, createdAt: Date.now() });
  return token;
}

function resolveUserIdFromRequest(req: Request): string | null {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const session = activeSessions.get(token);
    if (session) return session.userId;
    // Also allow raw user-id prefixed tokens for resilience
    if (token.startsWith('nb_')) {
      const parts = token.split('_');
      if (parts[1]) return parts[1];
    }
  }

  // Check cookie
  const cookieToken = req.cookies?.nutribudget_token;
  if (cookieToken) {
    const session = activeSessions.get(cookieToken);
    if (session) return session.userId;
    if (cookieToken.startsWith('nb_')) {
      const parts = cookieToken.split('_');
      if (parts[1]) return parts[1];
    }
  }

  return null;
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = resolveUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = db.getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'User session expired or invalid' });
  }

  (req as any).user = user;
  (req as any).userId = userId;
  next();
}

// ================= API ROUTES =================

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, dailyBudget, weeklyBudget, university } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const user = db.createUser({
      name,
      email,
      password,
      dailyBudget: dailyBudget ? Number(dailyBudget) : 15,
      weeklyBudget: weeklyBudget ? Number(weeklyBudget) : 90,
      university,
    });

    const token = createSessionToken(user.id);
    res.cookie('nutribudget_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ user, token });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = createSessionToken(user.id);
    res.cookie('nutribudget_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...safeProfile } = user;
    return res.json({ user: safeProfile, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Demo Login (Instant access for evaluation)
app.post('/api/auth/demo-login', (_req: Request, res: Response) => {
  try {
    const user = db.getUserByEmail('demo@student.edu');
    if (!user) {
      db.resetDemoData();
    }
    const freshUser = db.getUserByEmail('demo@student.edu') || db.getUserById('user-student-alex');
    if (!freshUser) {
      return res.status(500).json({ error: 'Could not load demo student account.' });
    }

    const token = createSessionToken(freshUser.id);
    res.cookie('nutribudget_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...safeProfile } = freshUser;
    return res.json({ user: safeProfile, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Demo login failed' });
  }
});

// Logout
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('nutribudget_token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Current User Profile
app.get('/api/auth/me', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { passwordHash: _, ...safeProfile } = user;
  return res.json({ user: safeProfile });
});

// Update Profile & Budget Settings
app.put('/api/auth/profile', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      name,
      dailyBudget,
      weeklyBudget,
      dailyCalorieGoal,
      dailyProteinGoal,
      dailyCarbsGoal,
      dailyFatGoal,
      currencySymbol,
      dietaryRestrictions,
      kitchenEquipment,
      university,
    } = req.body;

    const updated = db.updateUserProfile(userId, {
      ...(name && { name: name.trim() }),
      ...(dailyBudget !== undefined && { dailyBudget: Number(dailyBudget) }),
      ...(weeklyBudget !== undefined && { weeklyBudget: Number(weeklyBudget) }),
      ...(dailyCalorieGoal !== undefined && { dailyCalorieGoal: Number(dailyCalorieGoal) }),
      ...(dailyProteinGoal !== undefined && { dailyProteinGoal: Number(dailyProteinGoal) }),
      ...(dailyCarbsGoal !== undefined && { dailyCarbsGoal: Number(dailyCarbsGoal) }),
      ...(dailyFatGoal !== undefined && { dailyFatGoal: Number(dailyFatGoal) }),
      ...(currencySymbol && { currencySymbol }),
      ...(dietaryRestrictions && { dietaryRestrictions }),
      ...(kitchenEquipment && { kitchenEquipment }),
      ...(university !== undefined && { university }),
    });

    return res.json({ user: updated, message: 'Profile updated successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update profile' });
  }
});

// Reset Demo Data
app.post('/api/auth/reset-demo', (_req: Request, res: Response) => {
  db.resetDemoData();
  const demoUser = db.getUserById('user-student-alex');
  const { passwordHash: _, ...safeProfile } = demoUser!;
  return res.json({ success: true, user: safeProfile, message: 'Demo data reset successfully.' });
});

// --- Meal CRUD ---

// Get meals with query filters
app.get('/api/meals', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate, category, mealType, search } = req.query;

    const meals = db.getMealsByUser(userId, {
      startDate: startDate as string,
      endDate: endDate as string,
      category: category as string,
      mealType: mealType as string,
      search: search as string,
    });

    return res.json({ meals, count: meals.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch meals' });
  }
});

// Create meal
app.post('/api/meals', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, mealType, category, cost, calories, protein, carbs, fat, date, time, notes, location, healthScore } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Meal name is required.' });
    }
    if (cost === undefined || cost === null || Number(cost) < 0) {
      return res.status(400).json({ error: 'Valid cost ($ >= 0) is required.' });
    }

    const meal = db.createMeal(userId, {
      name,
      mealType: mealType || 'lunch',
      category: category || 'homemade',
      cost: Number(cost),
      calories: Number(calories || 0),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fat: Number(fat || 0),
      date: date || new Date().toISOString().split('T')[0],
      time,
      notes,
      location,
      healthScore,
    });

    return res.status(201).json({ meal, message: 'Meal logged successfully!' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to save meal' });
  }
});

// Update meal
app.put('/api/meals/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const mealId = req.params.id;

    const updated = db.updateMeal(mealId, userId, req.body);
    return res.json({ meal: updated, message: 'Meal updated successfully!' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update meal' });
  }
});

// Delete meal
app.delete('/api/meals/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const mealId = req.params.id;

    const success = db.deleteMeal(mealId, userId);
    if (!success) {
      return res.status(404).json({ error: 'Meal not found or already deleted.' });
    }
    return res.json({ success: true, message: 'Meal deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete meal' });
  }
});

// --- AI Endpoints ---

// 1. Natural Language Meal Estimate (Nutrition & Cost)
app.post('/api/ai/estimate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Meal description is required.' });
    }

    const estimate = await estimateMealNutrition(description.trim());
    return res.json({ estimate });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to estimate nutrition' });
  }
});

// 2. AI Budget Meal Planner
app.post('/api/ai/meal-plan', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { budget, days, preferences, equipment, targetCalories } = req.body;

    const plan = await generateStudentMealPlan({
      budget: Number(budget) || user.weeklyBudget || 75,
      days: Number(days) || 5,
      preferences: Array.isArray(preferences) ? preferences : user.dietaryRestrictions || [],
      equipment: Array.isArray(equipment) ? equipment : user.kitchenEquipment || ['Microwave', 'Mini Fridge'],
      targetCalories: Number(targetCalories) || user.dailyCalorieGoal || 2100,
    });

    return res.json({ plan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate meal plan' });
  }
});

// 3. AI Dorm Pantry Leftover Remix
app.post('/api/ai/pantry-remix', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { ingredients, equipment } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Please provide at least 1-2 leftover ingredients.' });
    }

    const recipes = await remixPantryLeftovers(
      ingredients,
      Array.isArray(equipment) ? equipment : user.kitchenEquipment || ['Microwave', 'Hot plate']
    );

    return res.json({ recipes });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to remix leftovers' });
  }
});

// 4. AI Student Budget & Nutrition Coach
app.post('/api/ai/coach-advice', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const meals = db.getMealsByUser(user.id);

    const advice = await getAiCoachAdvice(
      {
        name: user.name,
        dailyBudget: user.dailyBudget,
        weeklyBudget: user.weeklyBudget,
        dailyCalorieGoal: user.dailyCalorieGoal,
      },
      meals
    );

    return res.json({ advice });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate coach advice' });
  }
});

// --- Server & Vite Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NutriBudget AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
