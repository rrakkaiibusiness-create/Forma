import type { CustomFood, FoodCategory, FoodUnit, MealFoodEntry, ProteinSupplement } from './types'
import { proteinTypeLabels } from './constants'

export type { FoodCategory, FoodUnit, MealFoodEntry }

export type FoodItem = {
  id: string
  name: string
  category: FoodCategory
  unit: FoodUnit
  caloriesPer100g: number
  proteinPer100g: number
  fatPer100g: number
  carbsPer100g: number
  fiberPer100g?: number
  defaultServingG: number
  source: string
  note?: string
}

export type MacroTotals = { calories: number; protein: number; fat: number; carbs: number; fiber: number }
export const PROTEIN_SUPPLEMENT_ID = 'user_protein_supplement'

export function createProteinSupplementFood(supplement: ProteinSupplement): FoodItem {
  const servingG = Math.max(1, supplement.servingG)
  const per100 = (value: number) => Math.max(0, value) * 100 / servingG
  return {
    id: PROTEIN_SUPPLEMENT_ID,
    name: proteinTypeLabels[supplement.type],
    category: 'protein',
    unit: 'g',
    caloriesPer100g: per100(supplement.calories),
    proteinPer100g: per100(supplement.protein),
    fatPer100g: per100(supplement.fat),
    carbsPer100g: per100(supplement.carbs),
    fiberPer100g: 0,
    defaultServingG: servingG,
    source: 'Етикетка протеїну з профілю користувача',
    note: 'Добавка до раціону, а не заміна повноцінного прийому їжі.',
  }
}

export const FOOD_DATABASE: FoodItem[] = [
  { id: 'chicken_breast_cooked', name: 'Куряча грудка готова', category: 'protein', unit: 'cooked_g', caloriesPer100g: 165, proteinPer100g: 31, fatPer100g: 3.6, carbsPer100g: 0, fiberPer100g: 0, defaultServingG: 150, source: 'USDA FoodData Central, chicken breast cooked roasted, FDC ID 171477', note: 'Готова вага без шкіри. Не плутати із сирою вагою.' },
  { id: 'chicken_breast_raw', name: 'Куряча грудка сира', category: 'protein', unit: 'g', caloriesPer100g: 120, proteinPer100g: 23, fatPer100g: 2.6, carbsPer100g: 0, fiberPer100g: 0, defaultServingG: 200, source: 'USDA-based estimate for raw chicken breast', note: 'Після приготування вага зменшується через втрату води.' },
  { id: 'turkey_breast_cooked', name: 'Грудка індички готова', category: 'protein', unit: 'cooked_g', caloriesPer100g: 135, proteinPer100g: 29, fatPer100g: 1.6, carbsPer100g: 0, fiberPer100g: 0, defaultServingG: 170, source: 'USDA FoodData Central / SR Legacy, turkey breast meat cooked roasted' },
  { id: 'beef_lean_cooked', name: 'Яловичина пісна готова', category: 'protein', unit: 'cooked_g', caloriesPer100g: 217, proteinPer100g: 26.1, fatPer100g: 11.8, carbsPer100g: 0, fiberPer100g: 0, defaultServingG: 160, source: 'USDA FoodData Central / SR Legacy, beef composite lean cooked' },
  { id: 'tuna_canned_water', name: 'Тунець у власному соку', category: 'protein', unit: 'g', caloriesPer100g: 116, proteinPer100g: 25.5, fatPer100g: 0.8, carbsPer100g: 0, fiberPer100g: 0, defaultServingG: 150, source: 'USDA FoodData Central / SR Legacy, tuna light canned in water drained' },
  { id: 'egg_whole_raw', name: 'Яйце', category: 'protein', unit: 'piece', caloriesPer100g: 143, proteinPer100g: 12.6, fatPer100g: 9.5, carbsPer100g: 0.7, fiberPer100g: 0, defaultServingG: 50, source: 'USDA FoodData Central, egg whole raw fresh', note: '1 велике яйце ≈ 50 г.' },
  { id: 'lentils_cooked', name: 'Сочевиця готова', category: 'mixed', unit: 'cooked_g', caloriesPer100g: 116, proteinPer100g: 9, fatPer100g: 0.4, carbsPer100g: 20.1, fiberPer100g: 7.9, defaultServingG: 220, source: 'USDA FoodData Central / SR Legacy, lentils mature seeds cooked boiled' },

  { id: 'rice_white_dry', name: 'Рис білий сухий', category: 'carbs', unit: 'dry_g', caloriesPer100g: 374, proteinPer100g: 7.5, fatPer100g: 1, carbsPer100g: 79, fiberPer100g: 1.8, defaultServingG: 100, source: 'USDA-based data, white long-grain rice dry', note: 'Суха вага. Не плутати з готовим рисом.' },
  { id: 'rice_white_cooked', name: 'Рис білий готовий', category: 'carbs', unit: 'cooked_g', caloriesPer100g: 130, proteinPer100g: 2.7, fatPer100g: 0.3, carbsPer100g: 28, fiberPer100g: 0.4, defaultServingG: 250, source: 'USDA-based data, cooked white rice', note: 'Готовий рис містить багато води.' },
  { id: 'buckwheat_dry', name: 'Гречка суха', category: 'carbs', unit: 'dry_g', caloriesPer100g: 346, proteinPer100g: 11.7, fatPer100g: 2.7, carbsPer100g: 75, fiberPer100g: 10, defaultServingG: 100, source: 'USDA-based data, buckwheat groats roasted dry', note: 'Суха вага.' },
  { id: 'buckwheat_cooked', name: 'Гречка готова', category: 'carbs', unit: 'cooked_g', caloriesPer100g: 92, proteinPer100g: 3.4, fatPer100g: 0.6, carbsPer100g: 19.9, fiberPer100g: 2.7, defaultServingG: 250, source: 'USDA FoodData Central / SR Legacy, buckwheat groats cooked roasted', note: 'Готова вага з водою.' },
  { id: 'pasta_dry', name: 'Макарони сухі', category: 'carbs', unit: 'dry_g', caloriesPer100g: 371, proteinPer100g: 13, fatPer100g: 1.5, carbsPer100g: 75, fiberPer100g: 3.2, defaultServingG: 100, source: 'USDA FoodData Central, pasta dry enriched, FDC ID 169736', note: 'Суха вага.' },
  { id: 'pasta_cooked', name: 'Макарони готові', category: 'carbs', unit: 'cooked_g', caloriesPer100g: 158, proteinPer100g: 5.8, fatPer100g: 0.9, carbsPer100g: 30.9, fiberPer100g: 1.8, defaultServingG: 250, source: 'USDA FoodData Central / SR Legacy, spaghetti cooked enriched', note: 'Готова вага з водою.' },
  { id: 'oats_dry', name: 'Вівсяні пластівці сухі', category: 'carbs', unit: 'dry_g', caloriesPer100g: 379, proteinPer100g: 13.2, fatPer100g: 6.5, carbsPer100g: 67.7, fiberPer100g: 10.1, defaultServingG: 70, source: 'USDA FoodData Central / SR Legacy, oats regular and quick dry' },
  { id: 'potato_boiled', name: 'Картопля варена', category: 'carbs', unit: 'cooked_g', caloriesPer100g: 87, proteinPer100g: 1.9, fatPer100g: 0.1, carbsPer100g: 20.1, fiberPer100g: 1.8, defaultServingG: 300, source: 'USDA FoodData Central / SR Legacy, potatoes boiled cooked in skin flesh' },
  { id: 'bread_whole_wheat', name: 'Хліб цільнозерновий', category: 'carbs', unit: 'g', caloriesPer100g: 247, proteinPer100g: 13, fatPer100g: 4.2, carbsPer100g: 41.4, fiberPer100g: 7, defaultServingG: 80, source: 'USDA FoodData Central / Foundation, bread whole-wheat commercially prepared' },

  { id: 'greek_yogurt_nonfat', name: 'Грецький йогурт 0%', category: 'dairy', unit: 'g', caloriesPer100g: 59, proteinPer100g: 10, fatPer100g: 0.4, carbsPer100g: 3.6, fiberPer100g: 0, defaultServingG: 250, source: 'USDA-based data, plain nonfat Greek yogurt', note: 'Бренди можуть відрізнятися.' },
  { id: 'yogurt_plain_2', name: 'Йогурт звичайний 2%', category: 'dairy', unit: 'g', caloriesPer100g: 63, proteinPer100g: 5.3, fatPer100g: 1.6, carbsPer100g: 7, fiberPer100g: 0, defaultServingG: 250, source: 'USDA FoodData Central / SR Legacy, yogurt plain low fat' },
  { id: 'protein_yogurt_plain', name: 'Протеїновий йогурт', category: 'dairy', unit: 'g', caloriesPer100g: 70, proteinPer100g: 10, fatPer100g: 1.5, carbsPer100g: 4, fiberPer100g: 0, defaultServingG: 250, source: 'Average branded high-protein yogurt label data', note: 'Значення суттєво залежать від бренду; звір етикетку.' },
  { id: 'cottage_cheese_5', name: 'Творог 5%', category: 'dairy', unit: 'g', caloriesPer100g: 120, proteinPer100g: 17, fatPer100g: 5, carbsPer100g: 3, fiberPer100g: 0, defaultServingG: 200, source: 'Average dairy nutrition estimate', note: 'Залежить від бренду й жирності.' },

  { id: 'banana_raw', name: 'Банан', category: 'fruits', unit: 'piece', caloriesPer100g: 89, proteinPer100g: 1.1, fatPer100g: 0.3, carbsPer100g: 22.8, fiberPer100g: 2.6, defaultServingG: 118, source: 'USDA FoodData Central, bananas raw', note: '1 середній банан ≈ 118 г.' },
  { id: 'apple_raw', name: 'Яблуко', category: 'fruits', unit: 'piece', caloriesPer100g: 52, proteinPer100g: 0.3, fatPer100g: 0.2, carbsPer100g: 13.8, fiberPer100g: 2.4, defaultServingG: 182, source: 'USDA FoodData Central / SR Legacy, apples raw with skin' },
  { id: 'berries_mixed', name: 'Ягоди', category: 'fruits', unit: 'g', caloriesPer100g: 50, proteinPer100g: 0.8, fatPer100g: 0.4, carbsPer100g: 12, fiberPer100g: 4, defaultServingG: 120, source: 'USDA-based generic average for mixed berries' },
  { id: 'mixed_vegetables', name: 'Овочі', category: 'vegetables', unit: 'g', caloriesPer100g: 30, proteinPer100g: 1.5, fatPer100g: 0.3, carbsPer100g: 6, fiberPer100g: 2.5, defaultServingG: 300, source: 'Generic USDA-based average for mixed non-starchy vegetables', note: 'Картопля сюди не входить.' },

  { id: 'walnuts', name: 'Волоські горіхи', category: 'fats', unit: 'g', caloriesPer100g: 654, proteinPer100g: 15.2, fatPer100g: 65.2, carbsPer100g: 13.7, fiberPer100g: 6.7, defaultServingG: 25, source: 'USDA-based data, walnuts', note: '25 г ≈ 164 ккал і ≈ 16 г жиру.' },
  { id: 'olive_oil', name: 'Оливкова олія', category: 'fats', unit: 'g', caloriesPer100g: 884, proteinPer100g: 0, fatPer100g: 100, carbsPer100g: 0, fiberPer100g: 0, defaultServingG: 10, source: 'USDA FoodData Central / SR Legacy, oil olive salad or cooking' },
  { id: 'avocado_raw', name: 'Авокадо', category: 'fats', unit: 'g', caloriesPer100g: 160, proteinPer100g: 2, fatPer100g: 14.7, carbsPer100g: 8.5, fiberPer100g: 6.7, defaultServingG: 70, source: 'USDA FoodData Central / SR Legacy, avocados raw all commercial varieties' },
]

export const customFoodToFoodItem = (food: CustomFood): FoodItem => ({ ...food, source: 'Етикетка користувача' })
export const getAllFoods = (customFoods: CustomFood[] = []): FoodItem[] => [...FOOD_DATABASE, ...customFoods.map(customFoodToFoodItem)]
export const getFoodItem = (foodId: string, customFoods: CustomFood[] = []) => getAllFoods(customFoods).find(food => food.id === foodId)
export const resolveFoodItem = (foodId: string, extraFoods: FoodItem[] = []) => extraFoods.find(food => food.id === foodId) ?? getFoodItem(foodId)

export function calculateFoodMacros(food: FoodItem | CustomFood, amountG: number): MacroTotals {
  const factor = Math.max(0, Number.isFinite(amountG) ? amountG : 0) / 100
  return { calories: food.caloriesPer100g * factor, protein: food.proteinPer100g * factor, fat: food.fatPer100g * factor, carbs: food.carbsPer100g * factor, fiber: (food.fiberPer100g ?? 0) * factor }
}

const emptyMacros = (): MacroTotals => ({ calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 })
const addMacros = (total: MacroTotals, value: MacroTotals): MacroTotals => ({ calories: total.calories + value.calories, protein: total.protein + value.protein, fat: total.fat + value.fat, carbs: total.carbs + value.carbs, fiber: total.fiber + value.fiber })

export function calculateMealMacros(items: MealFoodEntry[], extraFoods: FoodItem[] = []) {
  return items.reduce((total, item) => {
    const food = resolveFoodItem(item.foodId, extraFoods)
    return food ? addMacros(total, calculateFoodMacros(food, item.amountG)) : total
  }, emptyMacros())
}

export function calculateDayMacros(meals: { items: MealFoodEntry[] }[], extraFoods: FoodItem[] = []) {
  return meals.reduce((total, meal) => addMacros(total, calculateMealMacros(meal.items, extraFoods)), emptyMacros())
}

export function validateMacroConsistency(macros: Pick<MacroTotals, 'calories' | 'protein' | 'fat' | 'carbs'>) {
  const caloriesFromMacros = macros.protein * 4 + macros.carbs * 4 + macros.fat * 9
  const diff = Math.abs(macros.calories - caloriesFromMacros)
  const diffPercent = macros.calories > 0 ? (diff / macros.calories) * 100 : 0
  return { caloriesFromMacros, diff, diffPercent, isValid: diffPercent < 15 }
}

const rounded = (value: number) => Math.round(value * 10) / 10
export function roundMacros(macros: MacroTotals): MacroTotals {
  return { calories: Math.round(macros.calories), protein: rounded(macros.protein), fat: rounded(macros.fat), carbs: rounded(macros.carbs), fiber: rounded(macros.fiber) }
}

export function formatFoodAmount(food: FoodItem, amountG: number) {
  const grams = Math.round(amountG)
  if (food.unit === 'piece') {
    const pieces = Math.round((amountG / food.defaultServingG) * 10) / 10
    return `${pieces} шт / ${grams} г`
  }
  if (food.unit === 'dry_g') return `${grams} г сухого продукту`
  if (food.unit === 'cooked_g') return `${grams} г готового продукту`
  return `${grams} г`
}
