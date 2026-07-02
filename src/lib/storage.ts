import type { AvailableFood, AvailableFoodCategory, NutritionPlan, Profile, ProgressLog, QualityCriteria } from './types'
import { DEFAULT_PROFILE } from './constants'
import { defaultQuality } from './foodQuality'
import { createAvailableFood } from './availableFoods'

const keys = { profile: 'forma.profile', logs: 'forma.logs', nutrition: 'forma.nutrition', quality: 'forma.quality', meals: 'forma.meals.variant', availableFoods: 'forma.availableFoods' }

function readUnknown(key: string): unknown {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* Storage can be unavailable or full. UI must keep working. */ }
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const finite = (value: unknown, fallback: number, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => typeof value === 'string' && allowed.includes(value as T) ? value as T : fallback

export function getProfile(): Profile | null {
  const raw = readUnknown(keys.profile)
  if (!isRecord(raw) || !['name', 'age', 'sex', 'height', 'weight', 'goal'].some(key => key in raw)) return null
  return {
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 60) : DEFAULT_PROFILE.name,
    age: finite(raw.age, DEFAULT_PROFILE.age, 16, 90),
    sex: oneOf(raw.sex, ['male', 'female'] as const, DEFAULT_PROFILE.sex),
    height: finite(raw.height, DEFAULT_PROFILE.height, 130, 230),
    weight: finite(raw.weight, DEFAULT_PROFILE.weight, 35, 300),
    bodyFat: finite(raw.bodyFat, DEFAULT_PROFILE.bodyFat, 3, 60),
    experience: oneOf(raw.experience, ['beginner', 'intermediate', 'advanced'] as const, DEFAULT_PROFILE.experience),
    goal: oneOf(raw.goal, ['cut', 'bulk', 'maintain', 'recomposition'] as const, DEFAULT_PROFILE.goal),
    trainingDays: Math.round(finite(raw.trainingDays, DEFAULT_PROFILE.trainingDays, 2, 6)),
    activity: oneOf(raw.activity, ['sedentary', 'light', 'moderate', 'active'] as const, DEFAULT_PROFILE.activity),
    steps: finite(raw.steps, DEFAULT_PROFILE.steps, 0, 50000),
    restrictions: typeof raw.restrictions === 'string' ? raw.restrictions.slice(0, 200) : '',
    budget: oneOf(raw.budget, ['low', 'medium', 'high'] as const, DEFAULT_PROFILE.budget),
    meals: 4,
  }
}

export const saveProfile = (profile: Profile) => write(keys.profile, { ...profile, meals: 4 })

function sanitizeLog(value: unknown): ProgressLog | null {
  if (!isRecord(value) || typeof value.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)) return null
  const weight = finite(value.weight, 0, 35, 300)
  if (!weight) return null
  return {
    id: typeof value.id === 'string' && value.id ? value.id : `migrated-${value.date}`,
    date: value.date,
    weight,
    sleep: finite(value.sleep, 7, 2, 14),
    hunger: finite(value.hunger, 3, 1, 5),
    energy: finite(value.energy, 3, 1, 5),
    mood: finite(value.mood, 3, 1, 5),
    squat: typeof value.squat === 'number' && value.squat > 0 ? finite(value.squat, 0, 0, 500) : undefined,
    bench: typeof value.bench === 'number' && value.bench > 0 ? finite(value.bench, 0, 0, 500) : undefined,
    deadlift: typeof value.deadlift === 'number' && value.deadlift > 0 ? finite(value.deadlift, 0, 0, 500) : undefined,
    dietDone: value.dietDone === true,
    workoutDone: value.workoutDone === true,
    note: typeof value.note === 'string' ? value.note.slice(0, 500) : '',
  }
}

export function getProgressLogs(): ProgressLog[] {
  const raw = readUnknown(keys.logs)
  if (!Array.isArray(raw)) return []
  return raw.map(sanitizeLog).filter((log): log is ProgressLog => Boolean(log)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 24)
}

export function saveProgressLog(log: ProgressLog) {
  const valid = sanitizeLog(log)
  if (!valid) return
  const withoutSameDate = getProgressLogs().filter(item => item.date !== valid.date)
  write(keys.logs, [valid, ...withoutSameDate].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 24))
}

export function getNutritionPlan(): NutritionPlan | null {
  const raw = readUnknown(keys.nutrition)
  if (!isRecord(raw)) return null
  const fields = ['bmr', 'tdee', 'calories', 'protein', 'fat', 'carbs', 'fiber', 'water'] as const
  if (!fields.every(key => typeof raw[key] === 'number' && Number.isFinite(raw[key]))) return null
  return raw as unknown as NutritionPlan
}
export const saveNutritionPlan = (plan: NutritionPlan) => write(keys.nutrition, plan)

export function getQuality(): QualityCriteria {
  const raw = readUnknown(keys.quality)
  if (!isRecord(raw)) return defaultQuality
  return Object.fromEntries((Object.keys(defaultQuality) as (keyof QualityCriteria)[]).map(key => [key, typeof raw[key] === 'boolean' ? raw[key] : defaultQuality[key]])) as unknown as QualityCriteria
}
export const saveQuality = (value: QualityCriteria) => write(keys.quality, value)

export function getMealVariant() {
  const value = readUnknown(keys.meals)
  return typeof value === 'number' && Number.isFinite(value) ? Math.abs(Math.trunc(value)) % 1000 : 0
}
export const saveMealVariant = (value: number) => write(keys.meals, Number.isFinite(value) ? Math.abs(Math.trunc(value)) % 1000 : 0)

const foodCategories: AvailableFoodCategory[] = ['protein', 'carbs', 'vegetables', 'fruits', 'fats', 'dairy', 'mixed', 'other']
export function getAvailableFoods(): AvailableFood[] {
  const raw = readUnknown(keys.availableFoods)
  if (!Array.isArray(raw)) return []
  const result: AvailableFood[] = []
  raw.forEach(item => {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string' || typeof item.canonical !== 'string') return
    if (!foodCategories.includes(item.category as AvailableFoodCategory)) return
    const migrated = typeof item.foodId !== 'string' ? createAvailableFood(item.name, item.category as AvailableFoodCategory) : null
    const sanitized: AvailableFood = migrated ?? { id: item.id.slice(0, 80), name: item.name.trim().slice(0, 60), canonical: item.canonical.slice(0, 80), category: item.category as AvailableFoodCategory, foodId: item.foodId as string }
    if (result.some(food => food.id === sanitized.id)) return
    result.push(sanitized)
  })
  return result.filter(food => food.name).slice(0, 50)
}
export const saveAvailableFoods = (foods: AvailableFood[]) => write(keys.availableFoods, foods.slice(0, 50))
