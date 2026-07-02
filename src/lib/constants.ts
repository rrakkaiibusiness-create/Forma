import type { Profile } from './types'

export const DEFAULT_PROFILE: Profile = {
  name: 'Андрій', age: 29, sex: 'male', height: 181, weight: 82, bodyFat: 18,
  experience: 'intermediate', goal: 'recomposition', trainingDays: 4, activity: 'moderate',
  steps: 8000, restrictions: '', budget: 'medium', meals: 4,
  proteinSupplement: { enabled: false, type: 'whey_concentrate', servingG: 30, calories: 120, protein: 24, fat: 2, carbs: 2 },
}

export const proteinTypeLabels = { whey_concentrate: 'Whey Concentrate', whey_isolate: 'Whey Isolate', vegan: 'Vegan Protein', other: 'Інший' }

export const goalLabels = { cut: 'Зниження жиру', bulk: 'Набір маси', maintain: 'Підтримка', recomposition: 'Рекомпозиція' }
export const experienceLabels = { beginner: 'Початківець', intermediate: 'Середній', advanced: 'Досвідчений' }
export const activityLabels = { sedentary: 'Мало руху', light: 'Легка', moderate: 'Середня', active: 'Висока' }
export const budgetLabels = { low: 'Економний', medium: 'Середній', high: 'Вільний' }
