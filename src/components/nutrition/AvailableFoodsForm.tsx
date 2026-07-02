import { Check, PackageOpen, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { AvailableFood, AvailableFoodCategory, CustomFood } from '../../lib/types'
import { BASIC_FOODS, createAvailableFood, customFoodToAvailableFood, foodCategoryLabels, POPULAR_FOODS } from '../../lib/availableFoods'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'

export function AvailableFoodsForm({ foods, customFoods, onChange, onGenerate, pantryActive }: { foods: AvailableFood[]; customFoods: CustomFood[]; onChange: (foods: AvailableFood[]) => void; onGenerate: () => void; pantryActive: boolean }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<AvailableFoodCategory>('other')
  const add = (food: AvailableFood | null) => {
    if (!food || foods.some(item => item.id === food.id)) return
    onChange([...foods, food])
  }
  const remove = (id: string) => onChange(foods.filter(food => food.id !== id))
  const submit = (event: FormEvent) => { event.preventDefault(); add(createAvailableFood(name, category)); setName(''); setCategory('other') }
  const togglePopular = (food: AvailableFood) => foods.some(item => item.id === food.id) ? remove(food.id) : add(food)
  const addBasics = () => onChange([...foods, ...BASIC_FOODS.filter(base => !foods.some(food => food.id === base.id))])

  return <Card>
    <CardHeader eyebrow="Домашній список" title="Продукти, які реально є вдома" action={pantryActive ? <span className="inline-flex items-center gap-1.5 rounded-lg bg-lime/10 px-2.5 py-1 text-[11px] font-semibold text-lime"><Check size={12}/>План активний</span> : undefined}/>
    <div className="space-y-5 p-4 sm:p-5">
      <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_auto]">
        <input aria-label="Назва продукту" value={name} maxLength={60} onChange={event => setName(event.target.value)} placeholder="Напр. курка або авокадо" className="h-11 min-w-0 rounded-xl border border-white/10 bg-white/[.04] px-3.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime/60"/>
        <select aria-label="Категорія продукту" value={category} onChange={event => setCategory(event.target.value as AvailableFoodCategory)} className="h-11 rounded-xl border border-white/10 bg-[#1a1e1b] px-3 text-sm text-white outline-none focus:border-lime/60">{(Object.keys(foodCategoryLabels) as AvailableFoodCategory[]).map(key => <option key={key} value={key}>{foodCategoryLabels[key]}</option>)}</select>
        <Button type="submit" disabled={!name.trim()} className="h-11 px-4"><Plus size={16}/>Додати</Button>
      </form>

      <div><p className="mb-2 text-xs font-medium text-zinc-500">Швидкий вибір</p><div className="flex flex-wrap gap-2">{POPULAR_FOODS.map(food => { const selected = foods.some(item => item.id === food.id); return <button type="button" aria-pressed={selected} key={food.id} onClick={() => togglePopular(food)} className={`rounded-xl border px-3 py-2 text-xs transition ${selected ? 'border-lime/25 bg-lime/[.08] text-lime' : 'border-white/[.08] bg-white/[.025] text-zinc-400 hover:text-white'}`}>{selected && <Check size={12} className="mr-1.5 inline"/>}{food.name}</button> })}</div></div>

      {customFoods.length > 0 && <div><p className="mb-2 text-xs font-medium text-zinc-500">Мої продукти</p><div className="flex flex-wrap gap-2">{customFoods.map(item => { const food = customFoodToAvailableFood(item); const selected = foods.some(current => current.foodId === item.id); return <button type="button" aria-pressed={selected} key={item.id} onClick={() => selected ? onChange(foods.filter(current => current.foodId !== item.id)) : add(food)} className={`rounded-xl border px-3 py-2 text-xs transition ${selected ? 'border-lime/25 bg-lime/[.08] text-lime' : 'border-white/[.08] bg-white/[.025] text-zinc-400 hover:text-white'}`}>{selected && <Check size={12} className="mr-1.5 inline"/>}{item.name}</button> })}</div></div>}

      <div className="rounded-2xl bg-white/[.025] p-3.5"><div className="mb-3 flex items-center justify-between"><p className="flex items-center gap-2 text-xs font-semibold text-white"><PackageOpen size={15} className="text-lime"/>Зараз вдома · {foods.length}</p>{foods.length > 0 && <button type="button" onClick={() => onChange([])} className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-rose-300"><Trash2 size={13}/>Очистити список</button>}</div>{foods.length ? <div className="flex flex-wrap gap-2">{foods.map(food => <span key={food.id} className="inline-flex items-center gap-2 rounded-xl border border-white/[.08] bg-[#181b19] py-1.5 pl-3 pr-1.5 text-xs text-zinc-300"><span>{food.name}</span><span className="text-[10px] text-zinc-600">{foodCategoryLabels[food.category]}</span><button type="button" aria-label={`Видалити ${food.name}`} onClick={() => remove(food.id)} className="grid size-6 place-items-center rounded-lg text-zinc-600 hover:bg-white/[.06] hover:text-white"><X size={13}/></button></span>)}</div> : <p className="py-2 text-xs text-zinc-600">Список порожній — поки працює стандартна генерація Forma.</p>}</div>

      <div className="flex flex-col gap-2 sm:flex-row"><Button type="button" onClick={onGenerate} disabled={!foods.length} className="sm:flex-1"><Sparkles size={15}/>Скласти з того, що є</Button><Button type="button" variant="secondary" onClick={addBasics} className="sm:flex-1">Додати базові продукти</Button></div>
    </div>
  </Card>
}
