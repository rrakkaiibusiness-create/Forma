import { Save } from 'lucide-react'
import { activityLabels, budgetLabels, experienceLabels, goalLabels } from '../../lib/constants'
import type { Profile } from '../../lib/types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export function ProfileForm({ value, onChange, onSave }: { value: Profile; onChange: (v: Profile) => void; onSave: () => void }) {
  const set = <K extends keyof Profile>(key: K, next: Profile[K]) => onChange({ ...value, [key]: next })
  return <form onSubmit={e => { e.preventDefault(); onSave() }} className="space-y-7">
    <section><h3 className="mb-4 text-sm font-semibold text-white">Основне</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Input label="Імʼя" value={value.name} onChange={e => set('name', e.target.value)} required/>
      <Input label="Вік" type="number" min={16} max={90} value={value.age} onChange={e => set('age', +e.target.value)} required/>
      <Select label="Стать" value={value.sex} onChange={e => set('sex', e.target.value as Profile['sex'])}><option value="male">Чоловіча</option><option value="female">Жіноча</option></Select>
      <Input label="Зріст, см" type="number" min={130} max={230} value={value.height} onChange={e => set('height', +e.target.value)} required/>
      <Input label="Вага, кг" type="number" min={35} max={300} step="0.1" value={value.weight} onChange={e => set('weight', +e.target.value)} required/>
      <Input label="Жир, приблизно %" type="number" min={3} max={60} value={value.bodyFat} onChange={e => set('bodyFat', +e.target.value)} />
    </div></section>
    <section><h3 className="mb-4 text-sm font-semibold text-white">Ціль і навантаження</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Select label="Ціль" value={value.goal} onChange={e => set('goal', e.target.value as Profile['goal'])}>{Object.entries(goalLabels).map(([v,l]) => <option value={v} key={v}>{l}</option>)}</Select>
      <Select label="Досвід у залі" value={value.experience} onChange={e => set('experience', e.target.value as Profile['experience'])}>{Object.entries(experienceLabels).map(([v,l]) => <option value={v} key={v}>{l}</option>)}</Select>
      <Select label="Тренувань на тиждень" value={value.trainingDays} onChange={e => set('trainingDays', +e.target.value)}>{[2,3,4,5,6].map(v => <option key={v}>{v}</option>)}</Select>
      <Select label="Побутова активність" value={value.activity} onChange={e => set('activity', e.target.value as Profile['activity'])}>{Object.entries(activityLabels).map(([v,l]) => <option value={v} key={v}>{l}</option>)}</Select>
      <Input label="Кроків у середньому" type="number" min={0} step={500} value={value.steps} onChange={e => set('steps', +e.target.value)} />
      <Select label="Прийомів їжі" value={4} disabled><option value={4}>4 — формат MVP</option></Select>
    </div></section>
    <section><h3 className="mb-4 text-sm font-semibold text-white">Побажання</h3><div className="grid gap-4 sm:grid-cols-2">
      <Input label="Обмеження в продуктах" placeholder="Напр. без лактози, не їм рибу" value={value.restrictions} onChange={e => set('restrictions', e.target.value)}/>
      <Select label="Бюджет" value={value.budget} onChange={e => set('budget', e.target.value as Profile['budget'])}>{Object.entries(budgetLabels).map(([v,l]) => <option value={v} key={v}>{l}</option>)}</Select>
    </div></section>
    <div className="flex justify-end border-t border-white/[.07] pt-5"><Button type="submit"><Save size={16}/>Зберегти й перерахувати</Button></div>
  </form>
}
