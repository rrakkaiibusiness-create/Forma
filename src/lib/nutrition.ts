import type { NutritionPlan, Profile } from './types'

const activityMultiplier = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }

const roundToTen = (value: number) => Math.round(value / 10) * 10
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function calculateNutrition(profile: Profile): NutritionPlan {
  const sexOffset = profile.sex === 'male' ? 5 : -161
  const bmr = Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age + sexOffset)
  const tdee = Math.round(bmr * activityMultiplier[profile.activity])
  const goalDelta = {
    cut: -clamp(tdee * 0.15, 250, 500),
    bulk: clamp(tdee * 0.08, 150, 300),
    maintain: 0,
    recomposition: -clamp(tdee * 0.05, 100, 200),
  }[profile.goal]
  const raw = roundToTen(tdee + goalDelta)
  const floor = profile.sex === 'male' ? 1700 : 1400
  const calories = Math.max(raw, floor)

  // Actual body weight makes protein, fat and water absurdly high for obesity.
  // BMI 27 is used only as a practical upper reference for macro calculations.
  const heightM = profile.height / 100
  const bmi = profile.weight / (heightM * heightM)
  const referenceWeight = Math.min(profile.weight, 27 * heightM * heightM)
  const proteinFactor = profile.goal === 'cut' || profile.goal === 'recomposition' ? 2.1 : 1.8
  let protein = Math.round(referenceWeight * proteinFactor)
  const minimumProtein = Math.round(referenceWeight * 1.6)
  const minimumFat = Math.max(profile.sex === 'female' ? 40 : 45, Math.round(referenceWeight * 0.6))
  let fat = Math.max(minimumFat, Math.round(referenceWeight * (profile.goal === 'bulk' ? 0.9 : 0.8)))

  // Preserve at least 80 g of carbohydrates by trimming fat, then protein, if needed.
  const minimumCarbCalories = 80 * 4
  let remaining = calories - protein * 4 - fat * 9
  if (remaining < minimumCarbCalories) {
    fat = Math.max(minimumFat, Math.floor((calories - protein * 4 - minimumCarbCalories) / 9))
    remaining = calories - protein * 4 - fat * 9
  }
  if (remaining < minimumCarbCalories) {
    protein = Math.max(minimumProtein, Math.floor((calories - fat * 9 - minimumCarbCalories) / 4))
  }
  const carbs = Math.max(80, Math.round((calories - protein * 4 - fat * 9) / 4))

  let warning: string | undefined
  if (profile.goal === 'cut' && bmi < 18.5) {
    warning = 'Ціль «зниження жиру» не рекомендована за поточного співвідношення ваги й зросту. План не створює додатковий дефіцит — обговори ціль із фахівцем.'
  } else if (raw < floor) {
    warning = `Дефіцит зменшено: план обмежено мінімумом ${floor} ккал. Це орієнтир, а не медична рекомендація.`
  }

  return {
    bmr, tdee, calories, protein, fat, carbs,
    fiber: Math.round(clamp(calories / 80, 25, 35)),
    water: Math.round(clamp(referenceWeight * 0.035, 1.5, 4) * 10) / 10,
    warning,
  }
}
