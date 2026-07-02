import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { ProgressLog } from '../../lib/types'
import { todayLocalDate } from '../../lib/checkIn'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

const freshForm = (weight: number) => ({ weight, sleep: 7, hunger: 3, energy: 3, mood: 3, squat: 0, bench: 0, deadlift: 0, dietDone: true, workoutDone: true, note: '' })

export function WeeklyCheckIn({ open, onClose, currentWeight, onSave }: { open: boolean; onClose: () => void; currentWeight: number; onSave: (log: ProgressLog) => void }) {
  const [form, setForm] = useState(() => freshForm(currentWeight))
  useEffect(() => { if (open) setForm(freshForm(currentWeight)) }, [open, currentWeight])

  if (!open) return null
  const set = (key: keyof typeof form, value: number | boolean | string) => setForm({ ...form, [key]: value })
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSave({
      ...form,
      id: crypto.randomUUID(),
      date: todayLocalDate(),
      squat: form.squat > 0 ? form.squat : undefined,
      bench: form.bench > 0 ? form.bench : undefined,
      deadlift: form.deadlift > 0 ? form.deadlift : undefined,
    })
    onClose()
  }

  return <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-5">
    <form role="dialog" aria-modal="true" aria-labelledby="checkin-title" onSubmit={submit} className="max-h-[92dvh] w-full max-w-2xl overscroll-contain overflow-auto rounded-t-3xl border border-white/10 bg-[#141715] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-3xl">
      <div className="mb-5 flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.15em] text-lime">Weekly check-in</p><h2 id="checkin-title" className="mt-1 text-xl font-semibold text-white">Як минув тиждень?</h2></div><button type="button" aria-label="Закрити check-in" onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:bg-white/5"><X size={20}/></button></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Вага, кг" type="number" min={35} max={300} step="0.1" value={form.weight} onChange={e => set('weight', +e.target.value)} required/>
        <Input label="Сон, год" type="number" step="0.5" min={2} max={14} value={form.sleep} onChange={e => set('sleep', +e.target.value)} required/>
        {(['hunger','energy','mood'] as const).map(key => <label key={key} className="block"><span className="mb-2 flex justify-between text-sm text-zinc-300"><span>{{ hunger:'Голод', energy:'Енергія', mood:'Самопочуття' }[key]}</span><b className="text-lime">{form[key]}/5</b></span><input aria-label={{ hunger:'Голод', energy:'Енергія', mood:'Самопочуття' }[key]} className="w-full" type="range" min="1" max="5" value={form[key]} onChange={e => set(key, +e.target.value)}/></label>)}
        <Input label="Жим лежачи, кг" type="number" min={0} max={500} value={form.bench} onChange={e => set('bench', +e.target.value)}/>
        <Input label="Присідання, кг" type="number" min={0} max={500} value={form.squat} onChange={e => set('squat', +e.target.value)}/>
        <Input label="Станова тяга, кг" type="number" min={0} max={500} value={form.deadlift} onChange={e => set('deadlift', +e.target.value)}/>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">{([['dietDone','Раціон виконано'],['workoutDone','Тренування виконано']] as const).map(([key,label]) => <button type="button" aria-pressed={form[key]} key={key} onClick={() => set(key,!form[key])} className={`rounded-xl border p-3 text-sm ${form[key] ? 'border-lime/20 bg-lime/[.06] text-lime' : 'border-white/10 text-zinc-500'}`}>{label}</button>)}</div>
      <textarea maxLength={500} className="mt-4 min-h-20 w-full rounded-xl border border-white/10 bg-white/[.04] p-3 text-sm text-white outline-none focus:border-lime/50" placeholder="Коротка нотатка…" value={form.note} onChange={e => set('note', e.target.value)}/>
      <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Скасувати</Button><Button type="submit">Зберегти check-in</Button></div>
    </form>
  </div>
}
