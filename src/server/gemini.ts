import { GoogleGenAI } from '@google/genai';
import { AiNutritionEstimate, AiMealPlanResponse, PantryRecipe, CoachAdvice, Meal } from '../types';

const apiKey = process.env.GEMINI_API_KEY || '';
const isRealKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && !apiKey.startsWith('MY_'));

let ai: GoogleGenAI | null = null;
if (isRealKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out, switching to smart heuristic')), timeoutMs)
    ),
  ]);
}

/**
 * AI Nutrition & Cost Estimator from Natural Language or Meal Description
 */
export async function estimateMealNutrition(description: string): Promise<AiNutritionEstimate> {
  const prompt = `You are an expert nutritionist and college student budgeting specialist.
Analyze this student meal or food item: "${description}"

Provide estimated nutritional content, serving cost, meal type, category, and student budget tip.
Return ONLY valid JSON matching this exact structure:
{
  "name": "concise recognizable name of the meal",
  "mealType": "breakfast" | "lunch" | "dinner" | "snack",
  "category": "homemade" | "restaurant" | "snack" | "grocery",
  "cost": number (estimated cost in USD, e.g. 2.50 for homemade or 11.00 for restaurant),
  "calories": number (integer in kcal),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "healthScore": number (1 to 100),
  "studentTip": "1-2 sentence actionable student tip to optimize cost or nutrition",
  "breakdown": ["key ingredient 1 with calories/cost", "key ingredient 2", "key ingredient 3"]
}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        return {
          name: parsed.name || description,
          mealType: ['breakfast', 'lunch', 'dinner', 'snack'].includes(parsed.mealType) ? parsed.mealType : 'lunch',
          category: ['homemade', 'restaurant', 'snack', 'grocery'].includes(parsed.category) ? parsed.category : 'homemade',
          cost: Number(parsed.cost) || 3.50,
          calories: Math.round(Number(parsed.calories)) || 450,
          protein: Math.round(Number(parsed.protein)) || 20,
          carbs: Math.round(Number(parsed.carbs)) || 50,
          fat: Math.round(Number(parsed.fat)) || 15,
          healthScore: Math.min(100, Math.max(10, Math.round(Number(parsed.healthScore)) || 80)),
          studentTip: parsed.studentTip || 'Cooking this in batches can save you up to $40/month!',
          breakdown: Array.isArray(parsed.breakdown) ? parsed.breakdown : ['Balanced protein and carb sources.'],
        };
      }
    } catch (err) {
      console.error('Gemini estimateMealNutrition error, using heuristic fallback:', err);
    }
  }

  // Heuristic student nutrition fallback if AI API is temporarily unavailable
  const lower = description.toLowerCase();
  let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch';
  let category: 'homemade' | 'restaurant' | 'snack' | 'grocery' = 'homemade';
  let cost = 3.50;
  let calories = 520;
  let protein = 24;
  let carbs = 65;
  let fat = 16;
  let healthScore = 82;

  if (lower.includes('coffee') || lower.includes('chip') || lower.includes('cookie') || lower.includes('candy') || lower.includes('bar')) {
    mealType = 'snack';
    category = 'snack';
    cost = 2.75;
    calories = 240;
    protein = 4;
    carbs = 35;
    fat = 10;
    healthScore = 65;
  } else if (lower.includes('egg') || lower.includes('oat') || lower.includes('toast') || lower.includes('pancake') || lower.includes('cereal') || lower.includes('yogurt')) {
    mealType = 'breakfast';
    cost = 1.80;
    calories = 380;
    protein = 18;
    carbs = 48;
    fat = 12;
    healthScore = 88;
  } else if (lower.includes('chipotle') || lower.includes('subway') || lower.includes('burger') || lower.includes('pizza') || lower.includes('taco bell') || lower.includes('takeout') || lower.includes('restaurant')) {
    category = 'restaurant';
    mealType = lower.includes('dinner') ? 'dinner' : 'lunch';
    cost = 11.50;
    calories = 780;
    protein = 35;
    carbs = 85;
    fat = 32;
    healthScore = 75;
  }

  return {
    name: description.split(',')[0].slice(0, 40),
    mealType,
    category,
    cost,
    calories,
    protein,
    carbs,
    fat,
    healthScore,
    studentTip: 'Prep similar whole-grain staples at the start of the week to stay under $3 per meal.',
    breakdown: ['Portion analyzed based on standard student serving size.'],
  };
}

/**
 * Generate a complete student meal plan & grocery shopping list matching budget
 */
export async function generateStudentMealPlan(params: {
  budget: number;
  days: number;
  preferences: string[];
  equipment: string[];
  targetCalories: number;
}): Promise<AiMealPlanResponse> {
  const prompt = `You are a student budget meal planner.
A college student needs a meal plan:
- Total Budget: $${params.budget} USD
- Duration: ${params.days} days
- Daily Calorie Target: ~${params.targetCalories} kcal
- Dietary Preferences/Restrictions: ${params.preferences.join(', ') || 'Any healthy budget food'}
- Kitchen Equipment Available: ${params.equipment.join(', ') || 'Microwave, mini fridge'}

Create an ultra-practical, high-nutrition, low-cost student meal plan. Every meal must be realistic for a dorm or student apartment.
Return ONLY valid JSON matching this exact structure:
{
  "planTitle": "title of the plan (e.g. 5-Day High-Protein Dorm Survival Plan)",
  "totalCost": number (must be <= ${params.budget}),
  "days": ${params.days},
  "dailyAverageCost": number,
  "meals": [
    {
      "dayName": "Day 1",
      "mealType": "breakfast" | "lunch" | "dinner",
      "recipeName": "name of dish",
      "description": "brief description",
      "estimatedCost": number,
      "prepTimeMinutes": number,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["Step 1...", "Step 2..."]
    }
  ],
  "shoppingList": [
    {
      "item": "e.g. Rolled Oats (32 oz)",
      "aisle": "Produce" | "Pantry & Grains" | "Dairy & Protein" | "Frozen & Spices",
      "estimatedPrice": number,
      "quantity": "1 tub"
    }
  ],
  "studentMoneySavingHacks": [
    "hack 1",
    "hack 2",
    "hack 3"
  ]
}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        return parsed;
      }
    } catch (err) {
      console.error('Gemini generateStudentMealPlan error, falling back:', err);
    }
  }

  // Realistic fallback plan
  const dailyAvg = Number((params.budget / params.days).toFixed(2));
  return {
    planTitle: `${params.days}-Day Budget Champion Plan`,
    totalCost: Number((dailyAvg * params.days).toFixed(2)),
    days: params.days,
    dailyAverageCost: dailyAvg,
    meals: [
      {
        dayName: 'Day 1',
        mealType: 'breakfast',
        recipeName: 'Cinnamon Banana Overnight Oats',
        description: 'No cooking needed. Mix oats, milk or water, chia seeds and peanut butter the night before in a mason jar.',
        estimatedCost: 1.25,
        prepTimeMinutes: 5,
        calories: 420,
        protein: 16,
        carbs: 62,
        fat: 12,
        ingredients: ['1/2 cup rolled oats', '1 tbsp peanut butter', '1 ripe banana', '1/2 cup milk or water', 'cinnamon'],
        instructions: ['Combine oats, milk, and peanut butter in a jar.', 'Refrigerate overnight.', 'Top with sliced banana and cinnamon in the morning.'],
      },
      {
        dayName: 'Day 1',
        mealType: 'lunch',
        recipeName: 'Fiesta Black Bean & Brown Rice Bowl',
        description: 'Fiber and protein packed meal prep favorite seasoned with taco spices and lime.',
        estimatedCost: 2.10,
        prepTimeMinutes: 15,
        calories: 580,
        protein: 22,
        carbs: 84,
        fat: 14,
        ingredients: ['1 cup cooked brown rice', '1/2 can black beans (rinsed)', '1/2 cup frozen corn', 'salsa', '1/4 avocado or cheese'],
        instructions: ['Heat rice, black beans, and corn in microwave for 90 seconds.', 'Stir in salsa, cumin, and a squeeze of lime juice.', 'Top with avocado slices.'],
      },
      {
        dayName: 'Day 1',
        mealType: 'dinner',
        recipeName: 'One-Skillet Egg & Veggie Fried Rice',
        description: 'Transforms leftover rice into a satisfying savory high-protein dinner.',
        estimatedCost: 1.85,
        prepTimeMinutes: 12,
        calories: 520,
        protein: 26,
        carbs: 68,
        fat: 16,
        ingredients: ['2 large eggs', '1 cup day-old rice', '1/2 cup frozen peas and carrots', '1 tbsp soy sauce', '1 tsp sesame oil or butter'],
        instructions: ['Scramble eggs in hot pan and remove.', 'Sauté frozen veggies with soy sauce for 2 minutes.', 'Add cold rice and stir-fry until heated, then fold scrambled eggs back in.'],
      },
      {
        dayName: 'Day 2',
        mealType: 'breakfast',
        recipeName: 'Cheesy Spinach Microwave Scramble',
        description: 'Fluffy eggs cooked in under 2 minutes in a microwave-safe mug.',
        estimatedCost: 1.40,
        prepTimeMinutes: 4,
        calories: 360,
        protein: 22,
        carbs: 8,
        fat: 24,
        ingredients: ['3 eggs', 'handful fresh spinach', '2 tbsp shredded cheddar', 'salt and pepper', '1 slice whole wheat toast'],
        instructions: ['Whisk eggs in a mug with salt and pepper.', 'Fold in spinach and microwave on high for 70 seconds.', 'Sprinkle cheese on top and serve with toast.'],
      },
      {
        dayName: 'Day 2',
        mealType: 'lunch',
        recipeName: 'Mediterranean Chickpea & Tuna Salad',
        description: 'Crisp, no-cook lunch that holds up well in a backpack.',
        estimatedCost: 2.45,
        prepTimeMinutes: 8,
        calories: 490,
        protein: 38,
        carbs: 45,
        fat: 12,
        ingredients: ['1 can chunk light tuna (drained)', '1/2 can chickpeas', 'diced cucumber', '1 tbsp olive oil & vinegar'],
        instructions: ['Toss tuna, chickpeas, and cucumber in a bowl.', 'Dress with olive oil, vinegar, oregano, and black pepper.', 'Eat with whole wheat crackers or wrap in a tortilla.'],
      },
      {
        dayName: 'Day 2',
        mealType: 'dinner',
        recipeName: 'Garlic Parmesan Lentil Pasta',
        description: 'Budget Italian comfort food with plant-powered protein.',
        estimatedCost: 2.20,
        prepTimeMinutes: 18,
        calories: 590,
        protein: 28,
        carbs: 86,
        fat: 12,
        ingredients: ['3 oz pasta', '1/2 cup canned brown lentils', '1/2 cup marinara sauce', 'parmesan cheese', 'garlic powder'],
        instructions: ['Boil pasta until al dente.', 'In same pot, warm marinara and lentils.', 'Toss together and sprinkle generously with parmesan.'],
      },
    ],
    shoppingList: [
      { item: 'Rolled Oats (Large Tub)', aisle: 'Pantry & Grains', estimatedPrice: 3.29, quantity: '1 container' },
      { item: 'Jasmine or Brown Rice (2 lbs)', aisle: 'Pantry & Grains', estimatedPrice: 2.49, quantity: '1 bag' },
      { item: 'Dozen Large Eggs', aisle: 'Dairy & Protein', estimatedPrice: 2.89, quantity: '1 carton' },
      { item: 'Black Beans & Chickpeas', aisle: 'Pantry & Grains', estimatedPrice: 2.40, quantity: '3 cans' },
      { item: 'Canned Chunk Light Tuna (3-pack)', aisle: 'Dairy & Protein', estimatedPrice: 3.50, quantity: '1 pack' },
      { item: 'Frozen Peas & Carrots / Stir Fry Veggies', aisle: 'Frozen & Spices', estimatedPrice: 1.69, quantity: '1 bag' },
      { item: 'Bananas', aisle: 'Produce', estimatedPrice: 1.20, quantity: '1 bunch' },
      { item: 'Peanut Butter (16 oz)', aisle: 'Pantry & Grains', estimatedPrice: 2.19, quantity: '1 jar' },
      { item: 'Shredded Cheddar Cheese', aisle: 'Dairy & Protein', estimatedPrice: 2.29, quantity: '1 bag' },
    ],
    studentMoneySavingHacks: [
      'Buy store-brand eggs and canned beans—they have the identical nutritional profile for 40% less.',
      'Freeze ripe bananas peeled in ziploc bags for smoothies and oatmeal sweeteners instead of buying flavored sugar packets.',
      'Cook double portions of grains (rice/pasta) on Sunday so you never spend $12 on impulsive takeout after class.',
    ],
  };
}

/**
 * AI Pantry Leftover Remix - Invent creative recipes from what's left in dorm fridge
 */
export async function remixPantryLeftovers(ingredients: string[], equipment: string[]): Promise<PantryRecipe[]> {
  const prompt = `A college student has ONLY these leftovers in their dorm fridge and pantry:
${ingredients.join(', ')}

Available cooking gear: ${equipment.join(', ') || 'Microwave, hotplate'}

Create 3 inventive, delicious, healthy, ultra-cheap recipes they can make RIGHT NOW without going to the store.
Return ONLY valid JSON matching this exact structure:
[
  {
    "title": "Creative recipe name",
    "prepTime": "e.g. 10 mins",
    "costPerServing": number (e.g. 1.20),
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "pantryItemsUsed": ["item 1", "item 2"],
    "ingredientsNeeded": ["ingredient with measurement"],
    "steps": ["Step 1...", "Step 2..."],
    "dormTip": "A clever student cooking shortcut for this dish"
  }
]`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Gemini remixPantryLeftovers error:', err);
    }
  }

  // Fallback recipes
  const mainItem = ingredients[0] || 'Eggs';
  return [
    {
      title: `Student Skillet Surprise with ${mainItem}`,
      prepTime: '10 mins',
      costPerServing: 1.45,
      calories: 440,
      protein: 24,
      carbs: 45,
      fat: 16,
      pantryItemsUsed: ingredients.slice(0, 3),
      ingredientsNeeded: [
        `${mainItem} (main protein)`,
        '1 cup leftover grains or noodles',
        'Soy sauce, salt, or hot sauce to taste',
        '1 tsp cooking oil or butter',
      ],
      steps: [
        'Heat a pan or hot plate on medium with a touch of oil.',
        'Sauté any firm leftovers for 3-4 minutes until aromatic.',
        'Crack in egg or toss in protein and stir vigorously until cooked through.',
        'Season with whatever condiments are in your fridge door.',
      ],
      dormTip: 'A splash of water in the pan and covering with a plate steams everything evenly in half the time.',
    },
    {
      title: 'Crispy Microwave Quesadilla / Melt',
      prepTime: '5 mins',
      costPerServing: 1.15,
      calories: 390,
      protein: 19,
      carbs: 38,
      fat: 17,
      pantryItemsUsed: ingredients.slice(0, 2),
      ingredientsNeeded: [
        'Bread or tortilla',
        'Leftover fillings from pantry',
        'Cheese or condiments',
      ],
      steps: [
        'Layer cheese and fillings between bread or tortilla.',
        'Microwave for 45 seconds until cheese is melted.',
        'Optional: toast for 2 mins on dry pan to crisp the exterior.',
      ],
      dormTip: 'Putting a paper towel under the tortilla in the microwave absorbs moisture and prevents sogginess.',
    },
    {
      title: 'Pantry Savory Broth Bowl',
      prepTime: '8 mins',
      costPerServing: 0.95,
      calories: 320,
      protein: 15,
      carbs: 42,
      fat: 9,
      pantryItemsUsed: ingredients,
      ingredientsNeeded: [
        '2 cups hot water',
        'Bouillon cube, miso, or ramen spice',
        'Leftover protein and greens',
      ],
      steps: [
        'Boil water using electric kettle.',
        'Dissolve seasoning into a large dorm bowl.',
        'Drop in leftover ingredients; allow hot broth to warm them for 3 minutes.',
      ],
      dormTip: 'Drop a raw egg into boiling broth and cover with a plate for 4 minutes to perfectly poach it.',
    },
  ];
}

/**
 * AI Budget & Nutrition Health Coach Advice
 */
export async function getAiCoachAdvice(user: {
  name: string;
  dailyBudget: number;
  weeklyBudget: number;
  dailyCalorieGoal: number;
}, meals: Meal[]): Promise<CoachAdvice> {
  const prompt = `You are an empathetic, encouraging financial and nutrition mentor for a college student named ${user.name}.
Student Profile:
- Daily Budget: $${user.dailyBudget}
- Weekly Budget: $${user.weeklyBudget}
- Target Calories: ${user.dailyCalorieGoal} kcal
- Recent Meals Logged (${meals.length} total):
${meals.slice(0, 10).map((m) => `- ${m.date}: ${m.name} (${m.category}, $${m.cost}, ${m.calories} kcal, ${m.protein}g protein)`).join('\n')}

Analyze their spending pace, category balance (homemade vs restaurant/snacks), and nutrient density.
Return ONLY valid JSON with this exact structure:
{
  "statusRating": "On Track" | "Watch Out" | "Budget Alert",
  "weeklyBurnRate": "short phrase describing their spending velocity, e.g. Spending $11.40/day vs $13.50 target",
  "biggestSpendingTrap": "specific habit to adjust, e.g. $4.50 coffee/energy drinks or dining out on Wednesdays",
  "projectedWeekendSavings": number (projected savings if they follow advice, in USD),
  "actionSteps": [
    "step 1 with specific numbers",
    "step 2 with practical dorm tip",
    "step 3"
  ],
  "encouragement": "warm 1-2 sentence student motivational message"
}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        return JSON.parse(text);
      }
    } catch (err) {
      console.error('Gemini coach advice error:', err);
    }
  }

  // Fallback advice based on meals
  const totalSpent = meals.reduce((sum, m) => sum + (m.cost || 0), 0);
  const restaurantSpent = meals.filter((m) => m.category === 'restaurant').reduce((sum, m) => sum + (m.cost || 0), 0);
  const restaurantRatio = totalSpent > 0 ? restaurantSpent / totalSpent : 0;

  return {
    statusRating: restaurantRatio > 0.5 ? 'Watch Out' : 'On Track',
    weeklyBurnRate: `Averaging ~$${(totalSpent / Math.max(1, meals.length) * 3).toFixed(2)}/day across tracked meals`,
    biggestSpendingTrap: restaurantRatio > 0.4 ? 'Restaurant & takeout runs driving over 50% of your food expenses' : 'Impulse beverage and library snack purchases',
    projectedWeekendSavings: 28.50,
    actionSteps: [
      'Swap 1 restaurant lunch this week for an egg or tuna rice bowl to pocket ~$9 immediately.',
      'Buy rolled oats and bulk peanut butter from a budget supermarket—breakfast drops to under $0.80/day.',
      'Pack a reusable water bottle and brew cold brew in a mason jar instead of campus coffee cart stops.',
    ],
    encouragement: 'You are doing great balancing classes and nutrition! Small tweaks to weekday lunches will easily keep you within your weekly budget.',
  };
}
