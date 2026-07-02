import { useEffect, useMemo, useState } from 'react'
import { Beef, Droplets, Flame, Leaf, Wheat } from 'lucide-react'
import type { AvailableFood, NutritionPlan, Profile, QualityCriteria } from '../lib/types'
import { pantryMissingQualityKeys } from '../lib/availableFoods'
import { generateMealPlan } from '../lib/meals'
import { getMealVariant, saveMealVariant } from '../lib/storage'
import { AvailableFoodsForm } from '../components/nutrition/AvailableFoodsForm'
import { FoodQualityScore } from '../components/nutrition/FoodQualityScore'
import { MacroCard } from '../components/nutrition/MacroCard'
import { MealPlan } from '../components/nutrition/MealPlan'

export function NutritionPage({ profile, plan, quality, onQuality, availableFoods, onAvailableFoods }: { profile: Profile; plan: NutritionPlan; quality: QualityCriteria; onQuality: (value: QualityCriteria) => void; availableFoods: AvailableFood[]; onAvailableFoods: (foods: AvailableFood[]) => void }) {
  const [variant, setVariant] = useState(getMealVariant())
  const [mode, setMode] = useState('')
  const [usePantry, setUsePantry] = useState(availableFoods.length > 0)
  useEffect(() => setUsePantry(availableFoods.length > 0), [availableFoods.length])

  const handleMode = (next: string) => {
    if (next === 'regenerate' || next === 'simple') {
      const updated = variant + 1
      setVariant(updated)
      saveMealVariant(updated)
    }
    setMode(next)
  }
  const generateFromPantry = () => {
    setUsePantry(true)
    setMode('')
    setVariant(0)
    saveMealVariant(0)
  }
  const result = useMemo(() => generateMealPlan(plan, profile, variant, mode, availableFoods, usePantry), [plan, profile, variant, mode, availableFoods, usePantry])
  const actualProtein = result.meals.reduce((total, meal) => total + meal.protein, 0)
  const actualFiber = result.meals.reduce((total, meal) => total + meal.fiber, 0)
  const calculatedQuality = { ...quality, proteinTargetReached: actualProtein >= plan.protein * 0.85, fiberEnough: actualFiber >= plan.fiber * 0.8 }
  const actualMissing: Array<keyof QualityCriteria> = [...(actualProtein < plan.protein * 0.85 ? ['proteinTargetReached' as const] : []), ...(actualFiber < plan.fiber * 0.8 ? ['fiberEnough' as const] : [])]
  const lockedQualityKeys = [...new Set([...(result.pantryActive ? pantryMissingQualityKeys(availableFoods) : []), ...actualMissing])]

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><MacroCard label="Ціль калорій" value={plan.calories} unit="ккал" target={`BMR ${plan.bmr} · TDEE ${plan.tdee}`} icon={Flame}/><MacroCard label="Ціль білка" value={plan.protein} unit="г" icon={Beef} accent="text-rose-300"/><MacroCard label="Ціль жирів" value={plan.fat} unit="г" icon={Droplets} accent="text-amber-300"/><MacroCard label="Ціль вуглеводів" value={plan.carbs} unit="г" icon={Wheat} accent="text-sky-300"/><MacroCard label="Ціль клітковини" value={plan.fiber} unit="г" target={`Вода ≈ ${plan.water} л`} icon={Leaf}/></div>
    {plan.warning && <div className="rounded-xl border border-amber-300/15 bg-amber-300/[.06] px-4 py-3 text-xs text-amber-200">{plan.warning}</div>}
    <AvailableFoodsForm foods={availableFoods} onChange={onAvailableFoods} onGenerate={generateFromPantry} pantryActive={result.pantryActive}/>
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,.7fr)]"><MealPlan meals={result.meals} warnings={result.warnings} pantryActive={result.pantryActive} targetCalories={plan.calories} onMode={handleMode}/><FoodQualityScore criteria={calculatedQuality} onChange={onQuality} disabledKeys={lockedQualityKeys}/></div>
    <p className="text-center text-[11px] text-zinc-600">Це орієнтовний план для здорової дорослої людини, не медична рекомендація.</p>
  </div>
}
