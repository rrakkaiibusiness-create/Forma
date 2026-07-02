import { Activity, Dumbbell, Ruler, Scale } from 'lucide-react'
import { experienceLabels, goalLabels } from '../../lib/constants'
import type { Profile } from '../../lib/types'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
export function ProfileSummary({ profile }: { profile: Profile }) { const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1); return <Card className="p-5"><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-full bg-lime text-lg font-bold text-ink">{profile.name.slice(0,1).toUpperCase()}</div><div><h2 className="font-semibold text-white">{profile.name}</h2><div className="mt-1 flex gap-2"><Badge tone="good">{goalLabels[profile.goal]}</Badge><Badge>{experienceLabels[profile.experience]}</Badge></div></div></div><div className="mt-6 grid grid-cols-2 gap-3 text-sm">
  <div className="rounded-xl bg-white/[.04] p-3"><Scale size={16} className="mb-2 text-zinc-500"/><b className="text-white">{profile.weight} кг</b><p className="text-xs text-zinc-500">поточна вага</p></div>
  <div className="rounded-xl bg-white/[.04] p-3"><Ruler size={16} className="mb-2 text-zinc-500"/><b className="text-white">{bmi}</b><p className="text-xs text-zinc-500">ІМТ, орієнтир</p></div>
  <div className="rounded-xl bg-white/[.04] p-3"><Dumbbell size={16} className="mb-2 text-zinc-500"/><b className="text-white">{profile.trainingDays}× / тиж.</b><p className="text-xs text-zinc-500">тренування</p></div>
  <div className="rounded-xl bg-white/[.04] p-3"><Activity size={16} className="mb-2 text-zinc-500"/><b className="text-white">{profile.steps.toLocaleString('uk-UA')}</b><p className="text-xs text-zinc-500">кроків / день</p></div>
  </div></Card> }
