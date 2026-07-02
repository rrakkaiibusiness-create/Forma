import type { Profile } from './types'

export const DEFAULT_PROFILE: Profile = {
  name: 'Андрій', age: 29, sex: 'male', height: 181, weight: 82, bodyFat: 18,
  experience: 'intermediate', goal: 'recomposition', trainingDays: 4, activity: 'moderate',
  steps: 8000, restrictions: '', budget: 'medium', meals: 4,
}

export const goalLabels = { cut: 'Зниження жиру', bulk: 'Набір маси', maintain: 'Підтримка', recomposition: 'Рекомпозиція' }
export const experienceLabels = { beginner: 'Початківець', intermediate: 'Середній', advanced: 'Досвідчений' }
export const activityLabels = { sedentary: 'Мало руху', light: 'Легка', moderate: 'Середня', active: 'Висока' }
export const budgetLabels = { low: 'Економний', medium: 'Середній', high: 'Вільний' }
