export type Goal = 'cut' | 'bulk' | 'maintain' | 'recomposition'
export type Sex = 'male' | 'female'
export type Experience = 'beginner' | 'intermediate' | 'advanced'
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active'
export type Budget = 'low' | 'medium' | 'high'
export type FoodUnit = 'g' | 'piece' | 'dry_g' | 'cooked_g'
export type FoodCategory = 'protein' | 'carbs' | 'fats' | 'vegetables' | 'fruits' | 'dairy' | 'mixed'
export type AvailableFoodCategory = FoodCategory | 'other'

export interface AvailableFood {
  id: string
  name: string
  category: AvailableFoodCategory
  canonical: string
  foodId?: string
}

export interface Profile {
  name: string; age: number; sex: Sex; height: number; weight: number; bodyFat: number;
  experience: Experience; goal: Goal; trainingDays: number; activity: Activity; steps: number;
  restrictions: string; budget: Budget; meals: number;
}

export interface NutritionPlan {
  bmr: number; tdee: number; calories: number; protein: number; fat: number; carbs: number;
  fiber: number; water: number; warning?: string;
}

export interface QualityCriteria {
  proteinTargetReached: boolean; vegetablesIncluded: boolean; fruitsIncluded: boolean; fiberEnough: boolean;
  healthyFatsIncluded: boolean; ultraProcessedLow: boolean; sugarNotHigh: boolean; varietyGood: boolean;
}

export interface MealFoodEntry { foodId: string; amountG: number }
export interface Meal { name: string; label: string; foods: string[]; items: MealFoodEntry[]; homeFoods?: string[]; calories: number; protein: number; fat: number; carbs: number; fiber: number; note: string }
export interface MealGenerationResult { meals: Meal[]; warnings: string[]; pantryActive: boolean }
export interface Exercise { name: string; sets: string; reps: string; effort: string; rest: string; note: string; progression: string }
export interface Workout { day: string; title: string; focus: string; exercises: Exercise[] }
export interface ProgressLog {
  id: string; date: string; weight: number; sleep: number; hunger: number; energy: number; mood: number;
  squat?: number; bench?: number; deadlift?: number; dietDone: boolean; workoutDone: boolean; note: string;
}
export type Page = 'dashboard' | 'profile' | 'nutrition' | 'training' | 'progress'
