import type { AvailableFood, FoodCategory, Meal, MealFoodEntry, MealGenerationResult, NutritionPlan, Profile } from './types'
import { calculateDayMacros, calculateMealMacros, formatFoodAmount, getFoodItem, roundMacros, validateMacroConsistency } from './foodDatabase'
import { resolveAvailableFood } from './availableFoods'

type MealTemplate = { label: string; name: string; note: string; items: MealFoodEntry[] }
type SelectedEntry = MealFoodEntry & { home: boolean }

const standardMenus: MealTemplate[][] = [
  [
    { label: 'Сніданок', name: 'Йогурт, гречка й банан', note: 'Точний тестовий набір із сухою вагою гречки.', items: [{ foodId: 'greek_yogurt_nonfat', amountG: 275 }, { foodId: 'buckwheat_dry', amountG: 110 }, { foodId: 'banana_raw', amountG: 118 }, { foodId: 'walnuts', amountG: 25 }] },
    { label: 'Обід', name: 'Куряча грудка з рисом', note: 'Курка вказана у готовій вазі, рис — у сухій.', items: [{ foodId: 'chicken_breast_cooked', amountG: 200 }, { foodId: 'rice_white_dry', amountG: 120 }, { foodId: 'mixed_vegetables', amountG: 300 }, { foodId: 'olive_oil', amountG: 10 }] },
    { label: 'До / після тренування', name: 'Творог, паста й банан', note: 'Макарони рахуються за сухою вагою.', items: [{ foodId: 'cottage_cheese_5', amountG: 250 }, { foodId: 'pasta_dry', amountG: 80 }, { foodId: 'banana_raw', amountG: 118 }] },
    { label: 'Вечеря', name: 'Яйця, рис та овочі', note: '2 яйця = приблизно 100 г їстівної частини.', items: [{ foodId: 'egg_whole_raw', amountG: 100 }, { foodId: 'rice_white_dry', amountG: 110 }, { foodId: 'mixed_vegetables', amountG: 310 }, { foodId: 'walnuts', amountG: 25 }] },
  ],
  [
    { label: 'Сніданок', name: 'Яйця з вівсянкою', note: 'Вівсяні пластівці вказані у сухій вазі.', items: [{ foodId: 'egg_whole_raw', amountG: 100 }, { foodId: 'oats_dry', amountG: 80 }, { foodId: 'berries_mixed', amountG: 120 }, { foodId: 'greek_yogurt_nonfat', amountG: 150 }] },
    { label: 'Обід', name: 'Яловичина з гречкою', note: 'Яловичина готова, гречка суха.', items: [{ foodId: 'beef_lean_cooked', amountG: 160 }, { foodId: 'buckwheat_dry', amountG: 110 }, { foodId: 'mixed_vegetables', amountG: 300 }, { foodId: 'olive_oil', amountG: 10 }] },
    { label: 'До / після тренування', name: 'Йогурт, банан і хліб', note: 'Конкретно грецький йогурт 0%, не абстрактний «йогурт».', items: [{ foodId: 'greek_yogurt_nonfat', amountG: 300 }, { foodId: 'banana_raw', amountG: 118 }, { foodId: 'bread_whole_wheat', amountG: 100 }] },
    { label: 'Вечеря', name: 'Індичка з картоплею', note: 'Індичка й картопля вказані у готовій вазі.', items: [{ foodId: 'turkey_breast_cooked', amountG: 200 }, { foodId: 'potato_boiled', amountG: 400 }, { foodId: 'mixed_vegetables', amountG: 300 }, { foodId: 'walnuts', amountG: 25 }] },
  ],
]

const fallbackIds: Record<'protein' | 'carbs' | 'vegetables' | 'fruits' | 'fats', string> = { protein: 'chicken_breast_cooked', carbs: 'rice_white_dry', vegetables: 'mixed_vegetables', fruits: 'banana_raw', fats: 'walnuts' }
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const isProteinCategory = (category?: FoodCategory) => category === 'protein' || category === 'dairy' || category === 'mixed'

function scaledAmount(foodId: string, amountG: number, scale: number) {
  const food = getFoodItem(foodId)
  if (!food) return amountG
  if (food.unit === 'piece') return Math.max(food.defaultServingG, Math.round(amountG * scale / food.defaultServingG) * food.defaultServingG)
  return Math.max(5, Math.round(amountG * scale / 5) * 5)
}

function replaceEntryFood(entry: MealFoodEntry, nextFoodId: string): MealFoodEntry {
  const current = getFoodItem(entry.foodId), next = getFoodItem(nextFoodId)
  if (!current || !next) return entry
  const servings = entry.amountG / current.defaultServingG
  return { foodId: nextFoodId, amountG: Math.max(next.defaultServingG * 0.5, next.defaultServingG * servings) }
}

function adaptStandardItems(items: MealFoodEntry[], profile: Profile, mode: string) {
  const restrictions = profile.restrictions.toLocaleLowerCase('uk-UA')
  return items.map(entry => {
    const food = getFoodItem(entry.foodId)
    if (!food) return entry
    if ((mode === 'cheap' || profile.budget === 'low') && ['beef_lean_cooked', 'tuna_canned_water', 'turkey_breast_cooked'].includes(food.id)) return replaceEntryFood(entry, 'chicken_breast_cooked')
    if (/риб|тунец/.test(restrictions) && food.id === 'tuna_canned_water') return replaceEntryFood(entry, 'chicken_breast_cooked')
    if (/яйц/.test(restrictions) && food.id === 'egg_whole_raw') return replaceEntryFood(entry, 'chicken_breast_cooked')
    if (/ялович/.test(restrictions) && food.id === 'beef_lean_cooked') return replaceEntryFood(entry, 'chicken_breast_cooked')
    if (/лактоз|молоч/.test(restrictions) && food.category === 'dairy') return replaceEntryFood(entry, 'egg_whole_raw')
    return entry
  })
}

function buildMeal(template: Pick<MealTemplate, 'label' | 'name' | 'note'>, selected: SelectedEntry[]): Meal {
  const items = selected.map(({ foodId, amountG }) => ({ foodId, amountG }))
  const macros = roundMacros(calculateMealMacros(items))
  const foodLines = items.map(item => { const food = getFoodItem(item.foodId)!; return `${food.name} — ${formatFoodAmount(food, item.amountG)}` })
  return { ...template, items, foods: foodLines, homeFoods: foodLines.filter((_, index) => selected[index].home), ...macros }
}

function scaleStandardMenu(plan: NutritionPlan, profile: Profile, menu: MealTemplate[], mode: string) {
  const adapted = menu.map(meal => ({ ...meal, items: adaptStandardItems(meal.items, profile, mode) }))
  const baseCalories = calculateDayMacros(adapted).calories
  const dayScale = clamp(plan.calories / baseCalories, 0.45, 1.55)
  return adapted.map(meal => {
    const selected = meal.items.map(entry => {
      const food = getFoodItem(entry.foodId)
      const proteinBoost = mode === 'protein' && isProteinCategory(food?.category) ? 1.12 : 1
      const carbTrim = mode === 'protein' && food?.category === 'carbs' ? 0.93 : 1
      return { foodId: entry.foodId, amountG: scaledAmount(entry.foodId, entry.amountG, dayScale * proteinBoost * carbTrim), home: false }
    })
    return buildMeal(meal, selected)
  })
}

function foodMatchesRole(food: ReturnType<typeof resolveAvailableFood>, role: keyof typeof fallbackIds) {
  if (!food) return false
  if (role === 'protein') return isProteinCategory(food.category)
  return food.category === role
}

function pickPantryFood(foods: AvailableFood[], role: keyof typeof fallbackIds, preferredIds: string[], offset: number) {
  const candidates = foods.map(available => ({ available, food: resolveAvailableFood(available) })).filter(item => foodMatchesRole(item.food, role))
  const preferred = candidates.filter(item => preferredIds.includes(item.food!.id)).sort((a, b) => preferredIds.indexOf(a.food!.id) - preferredIds.indexOf(b.food!.id))
  const pool = preferred.length ? preferred : candidates
  if (!pool.length) return { food: getFoodItem(fallbackIds[role])!, home: false }
  return { food: pool[offset % pool.length].food!, home: true }
}

function pantryWarnings(foods: AvailableFood[]) {
  const resolved = foods.map(resolveAvailableFood).filter(Boolean)
  const warnings: string[] = []
  if (!resolved.some(food => isProteinCategory(food?.category))) warnings.push('Додай білковий продукт: курячу грудку, яйця, творог 5%, грецький йогурт 0%, рибу або мʼясо.')
  if (!resolved.some(food => food?.category === 'carbs')) warnings.push('Додай рис сухий/готовий, гречку суху/готову, картоплю, макарони або вівсянку.')
  if (!resolved.some(food => food?.category === 'vegetables') && !resolved.some(food => food?.category === 'fruits')) warnings.push('Додай овочі або фрукти — без них раціон втрачає клітковину й бали якості.')
  else if (!resolved.some(food => food?.category === 'vegetables')) warnings.push('Додай овочі, щоб закрити клітковину та різноманіття.')
  else if (!resolved.some(food => food?.category === 'fruits')) warnings.push('Додай фрукти або ягоди для різноманіття раціону.')
  if (!resolved.some(food => food?.category === 'fats')) warnings.push('Додай джерело корисних жирів: волоські горіхи, оливкову олію або авокадо.')
  const unresolved = foods.filter(food => !resolveAvailableFood(food))
  if (unresolved.length) warnings.push(`Без локальних БЖУ поки не використано: ${unresolved.map(food => food.name).join(', ')}.`)
  if (resolved.length < 4) warnings.push('Список дуже короткий: план доповнено базовими продуктами, яких може не бути вдома.')
  return warnings
}

function pantrySelections(availableFoods: AvailableFood[], variant: number) {
  const specs = [
    { label: 'Сніданок', name: 'Сніданок із домашніх продуктів', note: 'Усі значення розраховано з фактичної ваги.', protein: ['greek_yogurt_nonfat', 'cottage_cheese_5', 'egg_whole_raw'], carbs: ['oats_dry', 'buckwheat_dry', 'bread_whole_wheat'], produce: 'fruits' as const },
    { label: 'Обід', name: 'Обід із домашніх продуктів', note: 'Сухі й готові ваги не змішуються.', protein: ['chicken_breast_cooked', 'turkey_breast_cooked', 'beef_lean_cooked', 'tuna_canned_water'], carbs: ['rice_white_dry', 'buckwheat_dry', 'potato_boiled', 'pasta_dry'], produce: 'vegetables' as const },
    { label: 'До / після тренування', name: 'Прийом навколо тренування', note: 'БЖУ — сума конкретних продуктів.', protein: ['greek_yogurt_nonfat', 'cottage_cheese_5', 'egg_whole_raw', 'chicken_breast_cooked'], carbs: ['rice_white_dry', 'pasta_dry', 'bread_whole_wheat', 'oats_dry'], produce: 'fruits' as const },
    { label: 'Вечеря', name: 'Вечеря з домашніх продуктів', note: 'Кожна позиція має визначену форму продукту.', protein: ['egg_whole_raw', 'tuna_canned_water', 'chicken_breast_cooked', 'cottage_cheese_5'], carbs: ['rice_white_dry', 'buckwheat_dry', 'potato_boiled'], produce: 'vegetables' as const },
  ]
  return specs.map((spec, index) => {
    const protein = pickPantryFood(availableFoods, 'protein', spec.protein, variant + index)
    const carbs = pickPantryFood(availableFoods, 'carbs', spec.carbs, variant + index)
    const produce = pickPantryFood(availableFoods, spec.produce, [], variant + index)
    const fats = pickPantryFood(availableFoods, 'fats', ['walnuts', 'olive_oil', 'avocado_raw'], variant + index)
    const selectedFoods = [protein, carbs, produce, fats]
    const entries: SelectedEntry[] = selectedFoods.map(selection => ({ foodId: selection.food.id, amountG: selection.food.id === 'egg_whole_raw' ? 100 : selection.food.defaultServingG, home: selection.home }))
    return { spec, entries }
  })
}

function scalePantryMeals(plan: NutritionPlan, selections: ReturnType<typeof pantrySelections>, mode: string) {
  const baseMeals = selections.map(selection => ({ items: selection.entries }))
  const baseCalories = calculateDayMacros(baseMeals).calories
  const dayScale = clamp(plan.calories / baseCalories, 0.45, 1.55)
  return selections.map(({ spec, entries }) => {
    const scaled = entries.map(entry => {
      const food = getFoodItem(entry.foodId)!
      const proteinBoost = mode === 'protein' && isProteinCategory(food.category) ? 1.12 : 1
      const carbTrim = mode === 'protein' && food.category === 'carbs' ? 0.93 : 1
      return { ...entry, amountG: scaledAmount(entry.foodId, entry.amountG, dayScale * proteinBoost * carbTrim) }
    })
    const proteinName = getFoodItem(scaled[0].foodId)!.name, carbName = getFoodItem(scaled[1].foodId)!.name
    return buildMeal({ ...spec, name: `${proteinName} + ${carbName}` }, scaled)
  })
}

function addPlanWarnings(meals: Meal[], targetCalories: number, warnings: string[]) {
  const total = calculateDayMacros(meals)
  if (Math.abs(total.calories - targetCalories) / targetCalories > 0.1) warnings.push(`Фактичний план дає ${Math.round(total.calories)} ккал проти цілі ${targetCalories} ккал. Додай більше базових продуктів або зміни порції.`)
  meals.forEach(meal => {
    const validation = validateMacroConsistency(meal)
    if (!validation.isValid) warnings.push(`${meal.label}: калорії USDA відрізняються від формули 4/9/4 на ${validation.diffPercent.toFixed(1)}%.`)
  })
  return [...new Set(warnings)]
}

export function generateMealPlan(plan: NutritionPlan, profile: Profile, variant = 0, mode = '', availableFoods: AvailableFood[] = [], usePantry = availableFoods.length > 0): MealGenerationResult {
  const safeVariant = Number.isFinite(variant) ? Math.abs(Math.trunc(variant)) : 0
  if (!usePantry || !availableFoods.length) {
    const menu = standardMenus[safeVariant % standardMenus.length]
    const meals = scaleStandardMenu(plan, profile, menu, mode)
    const totals = calculateDayMacros(meals)
    const warnings: string[] = []
    if (totals.protein < plan.protein * 0.85) warnings.push(`У фактичному плані лише ${Math.round(totals.protein)} г білка проти цілі ${plan.protein} г. Збільш білкові порції.`)
    if (totals.fat > plan.fat * 1.35) warnings.push(`У фактичному плані ${Math.round(totals.fat)} г жиру проти цілі ${plan.fat} г. Зменш горіхи, олію або жирні білкові продукти.`)
    return { meals, warnings: addPlanWarnings(meals, plan.calories, warnings), pantryActive: false }
  }
  const meals = scalePantryMeals(plan, pantrySelections(availableFoods, safeVariant), mode)
  const totals = calculateDayMacros(meals)
  const warnings = pantryWarnings(availableFoods)
  if (totals.protein < plan.protein * 0.85) warnings.push(`У фактичному плані лише ${Math.round(totals.protein)} г білка проти цілі ${plan.protein} г. Додай курячу грудку, творог 5% або грецький йогурт 0%.`)
  if (totals.fat > plan.fat * 1.35) warnings.push(`У фактичному плані ${Math.round(totals.fat)} г жиру проти цілі ${plan.fat} г. Зменш яйця, горіхи або олію.`)
  return { meals, warnings: addPlanWarnings(meals, plan.calories, warnings), pantryActive: true }
}

export function generateMeals(plan: NutritionPlan, profile: Profile, variant = 0, mode = ''): Meal[] {
  return generateMealPlan(plan, profile, variant, mode).meals
}
