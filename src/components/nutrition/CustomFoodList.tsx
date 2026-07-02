import { Pencil, Trash2 } from 'lucide-react'
import type { CustomFood } from '../../lib/types'
import { foodCategoryLabels } from '../../lib/availableFoods'
import { formatFoodAmount, customFoodToFoodItem } from '../../lib/foodDatabase'
import { Card, CardHeader } from '../ui/Card'

export function CustomFoodList({ foods, onEdit, onDelete }: { foods: CustomFood[]; onEdit: (food: CustomFood) => void; onDelete: (id: string) => void }) {
  return <Card>
    <CardHeader eyebrow={`${foods.length} збережено`} title="Мої продукти"/>
    <div className="space-y-2 p-4 sm:p-5">{foods.length ? foods.map(food => <article key={food.id} className="rounded-2xl border border-white/[.07] bg-white/[.025] p-3.5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-white">{food.name}</h3><p className="mt-1 text-[11px] text-zinc-500">{foodCategoryLabels[food.category]} · порція {formatFoodAmount(customFoodToFoodItem(food), food.defaultServingG)}</p></div><div className="flex shrink-0 gap-1"><button type="button" aria-label={`Редагувати ${food.name}`} onClick={() => onEdit(food)} className="grid size-9 place-items-center rounded-xl text-zinc-500 hover:bg-white/[.06] hover:text-white"><Pencil size={15}/></button><button type="button" aria-label={`Видалити ${food.name}`} onClick={() => onDelete(food.id)} className="grid size-9 place-items-center rounded-xl text-zinc-500 hover:bg-rose-300/10 hover:text-rose-300"><Trash2 size={15}/></button></div></div><div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px]"><span className="text-white">{food.caloriesPer100g} ккал</span><span className="text-rose-300">Б {food.proteinPer100g}</span><span className="text-amber-300">Ж {food.fatPer100g}</span><span className="text-sky-300">В {food.carbsPer100g}</span>{food.fiberPer100g !== undefined && <span className="text-emerald-300">Кл {food.fiberPer100g}</span>}</div></article>) : <p className="py-8 text-center text-xs leading-relaxed text-zinc-600">Ще немає власних продуктів. Додай дані з етикетки — продукт одразу потрапить у домашній список.</p>}</div>
  </Card>
}
