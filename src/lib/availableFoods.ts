import type { AvailableFood, AvailableFoodCategory, CustomFood, QualityCriteria } from './types'
import { getFoodItem, type FoodItem } from './foodDatabase'

export const foodCategoryLabels: Record<AvailableFoodCategory, string> = {
  protein: 'Білок', carbs: 'Вуглеводи', vegetables: 'Овочі', fruits: 'Фрукти', fats: 'Жири', dairy: 'Молочні', mixed: 'Змішані', supplement: 'Добавки', other: 'Інше',
}

type FoodDefinition = [canonical: string, name: string, category: AvailableFoodCategory, aliases: string[], foodId?: string]
const definitions: FoodDefinition[] = [
  ['eggs', 'Яйця', 'protein', ['яйця', 'яйце'], 'egg_whole_raw'],
  ['cottage-cheese-5', 'Творог 5%', 'dairy', ['творог', 'творог 5%', 'кисломолочний сир'], 'cottage_cheese_5'],
  ['chicken-cooked', 'Куряча грудка готова', 'protein', ['курка', 'курка готова', 'куряча грудка готова'], 'chicken_breast_cooked'],
  ['chicken-raw', 'Куряча грудка сира', 'protein', ['курка сира', 'куряча грудка сира'], 'chicken_breast_raw'],
  ['turkey-cooked', 'Грудка індички готова', 'protein', ['індичка', 'індичка готова'], 'turkey_breast_cooked'],
  ['greek-yogurt-0', 'Грецький йогурт 0%', 'dairy', ['йогурт', 'грецький йогурт', 'грецький йогурт 0%'], 'greek_yogurt_nonfat'],
  ['yogurt-plain-2', 'Йогурт звичайний 2%', 'dairy', ['звичайний йогурт', 'йогурт 2%'], 'yogurt_plain_2'],
  ['protein-yogurt', 'Протеїновий йогурт', 'dairy', ['протеїновий йогурт'], 'protein_yogurt_plain'],
  ['fish-tuna', 'Тунець у власному соку', 'protein', ['риба', 'тунець'], 'tuna_canned_water'],
  ['meat-beef', 'Яловичина пісна готова', 'protein', ['мʼясо', 'яловичина'], 'beef_lean_cooked'],
  ['lentils-cooked', 'Сочевиця готова', 'mixed', ['бобові', 'сочевиця'], 'lentils_cooked'],
  ['rice-dry', 'Рис білий сухий', 'carbs', ['рис', 'рис сухий'], 'rice_white_dry'],
  ['rice-cooked', 'Рис білий готовий', 'carbs', ['рис готовий'], 'rice_white_cooked'],
  ['buckwheat-dry', 'Гречка суха', 'carbs', ['гречка', 'гречка суха'], 'buckwheat_dry'],
  ['buckwheat-cooked', 'Гречка готова', 'carbs', ['гречка готова'], 'buckwheat_cooked'],
  ['pasta-dry', 'Макарони сухі', 'carbs', ['макарони', 'макарони сухі', 'паста суха'], 'pasta_dry'],
  ['pasta-cooked', 'Макарони готові', 'carbs', ['макарони готові', 'паста готова'], 'pasta_cooked'],
  ['oats-dry', 'Вівсяні пластівці сухі', 'carbs', ['вівсянка', 'вівсяні пластівці'], 'oats_dry'],
  ['potato-boiled', 'Картопля варена', 'carbs', ['картопля', 'картопля варена'], 'potato_boiled'],
  ['bread-whole', 'Хліб цільнозерновий', 'carbs', ['хліб', 'цільнозерновий хліб'], 'bread_whole_wheat'],
  ['vegetables', 'Овочі', 'vegetables', ['овочі', 'салат', 'помідори', 'огірки'], 'mixed_vegetables'],
  ['bananas', 'Банан', 'fruits', ['банан', 'банани'], 'banana_raw'],
  ['fruit-apple', 'Яблуко', 'fruits', ['фрукти', 'яблуко', 'яблука'], 'apple_raw'],
  ['berries', 'Ягоди', 'fruits', ['ягоди'], 'berries_mixed'],
  ['oil-olive', 'Оливкова олія', 'fats', ['олія', 'оливкова олія'], 'olive_oil'],
  ['nuts-walnuts', 'Волоські горіхи', 'fats', ['горіхи', 'волоські горіхи'], 'walnuts'],
  ['avocado', 'Авокадо', 'fats', ['авокадо'], 'avocado_raw'],
]

const normalize = (name: string) => name.trim().toLocaleLowerCase('uk-UA').replace(/[’']/g, 'ʼ').replace(/\s+/g, ' ')
const slug = (name: string) => normalize(name).replace(/[^a-zа-яіїєґ0-9]+/giu, '-').replace(/^-|-$/g, '')
const toAvailableFood = (definition: FoodDefinition): AvailableFood => ({ id: definition[0], canonical: definition[0], name: definition[1], category: definition[2], foodId: definition[4] })

export const POPULAR_FOODS: AvailableFood[] = ['eggs', 'cottage-cheese-5', 'chicken-cooked', 'chicken-raw', 'rice-dry', 'rice-cooked', 'buckwheat-dry', 'buckwheat-cooked', 'pasta-dry', 'pasta-cooked', 'greek-yogurt-0', 'yogurt-plain-2', 'protein-yogurt', 'bananas', 'vegetables', 'oats-dry', 'potato-boiled', 'nuts-walnuts', 'oil-olive'].map(canonical => toAvailableFood(definitions.find(item => item[0] === canonical)!))
export const BASIC_FOODS = POPULAR_FOODS.filter(food => ['eggs', 'cottage-cheese-5', 'chicken-cooked', 'rice-dry', 'buckwheat-dry', 'greek-yogurt-0', 'bananas', 'vegetables', 'nuts-walnuts'].includes(food.canonical))

export function createAvailableFood(name: string, selectedCategory?: AvailableFoodCategory): AvailableFood | null {
  const normalized = normalize(name).slice(0, 60)
  if (!normalized) return null
  const definition = definitions.find(item => item[3].some(alias => normalized === alias)) ?? definitions.find(item => item[3].some(alias => normalized.includes(alias)))
  if (definition) return toAvailableFood(definition)
  const canonical = slug(normalized)
  return { id: canonical || `food-${Date.now()}`, canonical: canonical || 'custom', name: name.trim().slice(0, 60), category: selectedCategory && selectedCategory !== 'other' ? selectedCategory : 'other' }
}

const legacyFoodIds: Record<string, string> = {
  chicken: 'chicken_breast_cooked', turkey: 'turkey_breast_cooked', yogurt: 'greek_yogurt_nonfat', 'cottage-cheese': 'cottage_cheese_5', fish: 'tuna_canned_water', meat: 'beef_lean_cooked', legumes: 'lentils_cooked', rice: 'rice_white_dry', buckwheat: 'buckwheat_dry', oats: 'oats_dry', potatoes: 'potato_boiled', pasta: 'pasta_dry', bread: 'bread_whole_wheat', vegetables: 'mixed_vegetables', bananas: 'banana_raw', fruit: 'apple_raw', oil: 'olive_oil', nuts: 'walnuts', eggs: 'egg_whole_raw',
}
export const customFoodToAvailableFood = (food: CustomFood): AvailableFood => ({ id: `available-${food.id}`, canonical: food.id, name: food.name, category: food.category, foodId: food.id })

export function resolveAvailableFood(food: AvailableFood, customFoods: CustomFood[] = []): FoodItem | undefined {
  return getFoodItem(food.foodId ?? legacyFoodIds[food.canonical] ?? '', customFoods)
}

const hasProtein = (foods: AvailableFood[], customFoods: CustomFood[]) => foods.some(food => ['protein', 'dairy', 'mixed'].includes(resolveAvailableFood(food, customFoods)?.category ?? food.category))
const hasCategory = (foods: AvailableFood[], category: AvailableFoodCategory, customFoods: CustomFood[]) => foods.some(food => (resolveAvailableFood(food, customFoods)?.category ?? food.category) === category)

export function pantryMissingQualityKeys(foods: AvailableFood[], customFoods: CustomFood[] = []): Array<keyof QualityCriteria> {
  if (!foods.length) return []
  const missing: Array<keyof QualityCriteria> = []
  if (!hasProtein(foods, customFoods)) missing.push('proteinTargetReached')
  if (!hasCategory(foods, 'vegetables', customFoods)) missing.push('vegetablesIncluded', 'fiberEnough')
  if (!hasCategory(foods, 'fruits', customFoods)) missing.push('fruitsIncluded')
  if (!hasCategory(foods, 'fats', customFoods)) missing.push('healthyFatsIncluded')
  if (new Set(foods.map(food => food.foodId ?? food.canonical)).size < 6) missing.push('varietyGood')
  return [...new Set(missing)]
}

export function applyPantryQuality(criteria: QualityCriteria, foods: AvailableFood[], customFoods: CustomFood[] = []): QualityCriteria {
  if (!foods.length) return criteria
  const result = { ...criteria }
  pantryMissingQualityKeys(foods, customFoods).forEach(key => { result[key] = false })
  if (hasProtein(foods, customFoods)) result.proteinTargetReached = true
  if (hasCategory(foods, 'vegetables', customFoods)) result.vegetablesIncluded = true
  if (hasCategory(foods, 'fruits', customFoods)) result.fruitsIncluded = true
  if (hasCategory(foods, 'fats', customFoods)) result.healthyFatsIncluded = true
  result.fiberEnough = hasCategory(foods, 'vegetables', customFoods) && (hasCategory(foods, 'fruits', customFoods) || foods.some(food => ['oats_dry', 'buckwheat_dry', 'lentils_cooked'].includes(resolveAvailableFood(food, customFoods)?.id ?? '')))
  result.varietyGood = new Set(foods.map(food => food.foodId ?? food.canonical)).size >= 6
  return result
}
