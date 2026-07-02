import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { CustomFood, CustomFoodDraft, FoodCategory, FoodUnit } from '../../lib/types'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'

const categories: Array<[FoodCategory, string]> = [['protein', 'Білок'], ['carbs', 'Вуглеводи'], ['fats', 'Жири'], ['vegetables', 'Овочі'], ['fruits', 'Фрукти'], ['dairy', 'Молочне'], ['mixed', 'Змішане'], ['supplement', 'Добавка']]
const units: Array<[FoodUnit, string]> = [['g', 'г'], ['piece', 'шт'], ['dry_g', 'сухий продукт'], ['cooked_g', 'готовий продукт']]
const emptyDraft: CustomFoodDraft = { name: '', category: 'mixed', caloriesPer100g: 0, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 0, fiberPer100g: undefined, defaultServingG: 100, unit: 'g' }
const numericKeys = ['caloriesPer100g', 'proteinPer100g', 'fatPer100g', 'carbsPer100g', 'defaultServingG'] as const

export function CustomFoodForm({ editing, onSave, onCancel }: { editing: CustomFood | null; onSave: (draft: CustomFoodDraft, id?: string) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<CustomFoodDraft>(emptyDraft)
  const [error, setError] = useState('')
  useEffect(() => { setDraft(editing ? { name: editing.name, category: editing.category, caloriesPer100g: editing.caloriesPer100g, proteinPer100g: editing.proteinPer100g, fatPer100g: editing.fatPer100g, carbsPer100g: editing.carbsPer100g, fiberPer100g: editing.fiberPer100g, defaultServingG: editing.defaultServingG, unit: editing.unit } : emptyDraft); setError('') }, [editing])
  const macroCalories = draft.proteinPer100g * 4 + draft.carbsPer100g * 4 + draft.fatPer100g * 9
  const discrepancy = useMemo(() => Math.abs(draft.caloriesPer100g - macroCalories), [draft.caloriesPer100g, macroCalories])
  const showWarning = discrepancy > 20 && discrepancy / Math.max(draft.caloriesPer100g, macroCalories, 1) > 0.15
  const setNumber = (key: typeof numericKeys[number], value: string) => setDraft(current => ({ ...current, [key]: value === '' ? 0 : Number(value) }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.name.trim()) return setError('Вкажи назву продукту.')
    if (numericKeys.some(key => !Number.isFinite(draft[key]) || draft[key] < 0) || (draft.fiberPer100g !== undefined && (!Number.isFinite(draft.fiberPer100g) || draft.fiberPer100g < 0))) return setError('КБЖУ та порція не можуть бути відʼємними.')
    if (draft.defaultServingG <= 0) return setError('Порція має бути більшою за 0 г.')
    setError('')
    onSave({ ...draft, name: draft.name.trim(), fiberPer100g: draft.fiberPer100g === undefined ? undefined : Number(draft.fiberPer100g) }, editing?.id)
    if (!editing) setDraft(emptyDraft)
  }
  const fieldClass = 'h-11 w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 text-sm text-white outline-none focus:border-lime/60'
  return <Card>
    <CardHeader eyebrow="Власна етикетка" title={editing ? 'Редагувати продукт' : 'Створити свій продукт'}/>
    <form onSubmit={submit} className="space-y-4 p-4 sm:p-5">
      <p className="rounded-xl bg-lime/[.05] px-3 py-2 text-xs text-lime/80">Вводь значення з етикетки продукту на 100 г.</p>
      <div className="grid gap-3 sm:grid-cols-2"><label className="block sm:col-span-2"><span className="mb-1.5 block text-xs text-zinc-400">Назва продукту</span><input aria-label="Назва власного продукту" maxLength={80} value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} className={fieldClass} placeholder="Напр. сир мого бренду"/></label><label><span className="mb-1.5 block text-xs text-zinc-400">Категорія</span><select aria-label="Категорія власного продукту" value={draft.category} onChange={event => setDraft(current => ({ ...current, category: event.target.value as FoodCategory }))} className={fieldClass}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span className="mb-1.5 block text-xs text-zinc-400">Одиниця</span><select aria-label="Одиниця власного продукту" value={draft.unit} onChange={event => setDraft(current => ({ ...current, unit: event.target.value as FoodUnit }))} className={fieldClass}>{units.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{([['caloriesPer100g', 'Ккал / 100 г'], ['proteinPer100g', 'Білки'], ['fatPer100g', 'Жири'], ['carbsPer100g', 'Вуглеводи']] as const).map(([key, label]) => <label key={key}><span className="mb-1.5 block text-xs text-zinc-400">{label}</span><input aria-label={label} type="number" min="0" step="0.1" value={draft[key]} onChange={event => setNumber(key, event.target.value)} className={fieldClass}/></label>)}<label><span className="mb-1.5 block text-xs text-zinc-400">Клітковина</span><input aria-label="Клітковина" type="number" min="0" step="0.1" value={draft.fiberPer100g ?? ''} onChange={event => setDraft(current => ({ ...current, fiberPer100g: event.target.value === '' ? undefined : Number(event.target.value) }))} className={fieldClass} placeholder="Необовʼязково"/></label><label><span className="mb-1.5 block text-xs text-zinc-400">Порція, г</span><input aria-label="Дефолтна порція" type="number" min="1" step="1" value={draft.defaultServingG} onChange={event => setNumber('defaultServingG', event.target.value)} className={fieldClass}/></label></div>
      {showWarning && <p role="status" className="rounded-xl border border-amber-300/15 bg-amber-300/[.05] px-3 py-2 text-xs text-amber-200">Перевір етикетку: формула Б×4 + В×4 + Ж×9 дає ≈ {Math.round(macroCalories)} ккал. Зберегти все одно можна — виробники округляють значення.</p>}
      {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
      <div className="flex flex-col gap-2 sm:flex-row"><Button type="submit" className="sm:flex-1">{editing ? 'Зберегти зміни' : 'Додати продукт'}</Button>{editing && <Button type="button" variant="secondary" onClick={onCancel}>Скасувати</Button>}</div>
    </form>
  </Card>
}
