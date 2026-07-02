import type { QualityCriteria } from './types'

export const qualityWeights: Record<keyof QualityCriteria, number> = {
  proteinTargetReached: 20, vegetablesIncluded: 15, fruitsIncluded: 10, fiberEnough: 15,
  healthyFatsIncluded: 10, ultraProcessedLow: 15, sugarNotHigh: 10, varietyGood: 5,
}
export const qualityLabels: Record<keyof QualityCriteria, string> = {
  proteinTargetReached: 'Білок у цілі', vegetablesIncluded: 'Овочі щодня', fruitsIncluded: 'Фрукти', fiberEnough: 'Достатньо клітковини',
  healthyFatsIncluded: 'Корисні жири', ultraProcessedLow: 'Мінімум ультраобробленого', sugarNotHigh: 'Цукор під контролем', varietyGood: 'Різноманіття продуктів',
}
export const defaultQuality: QualityCriteria = { proteinTargetReached: true, vegetablesIncluded: true, fruitsIncluded: true, fiberEnough: false, healthyFatsIncluded: true, ultraProcessedLow: true, sugarNotHigh: true, varietyGood: true }
export function qualityScore(criteria: QualityCriteria) {
  const positive = (Object.keys(criteria) as (keyof QualityCriteria)[]).reduce((sum, key) => sum + (criteria[key] ? qualityWeights[key] : 0), 0)
  // Matching protein or calories cannot compensate for a diet dominated by UPF or added sugar.
  const ultraProcessedPenalty = criteria.ultraProcessedLow ? 0 : 20
  const highSugarPenalty = criteria.sugarNotHigh ? 0 : 10
  const lowPlantFoodPenalty = !criteria.vegetablesIncluded && !criteria.fiberEnough ? 5 : 0
  return Math.max(0, Math.min(100, positive - ultraProcessedPenalty - highSugarPenalty - lowPlantFoodPenalty))
}
