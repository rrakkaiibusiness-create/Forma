import { Check, Info, LockKeyhole, X } from 'lucide-react'
import { qualityLabels, qualityScore, qualityWeights } from '../../lib/foodQuality'
import type { QualityCriteria } from '../../lib/types'
import { Card, CardHeader } from '../ui/Card'

export function FoodQualityScore({ criteria, onChange, compact = false, disabledKeys = [] }: { criteria: QualityCriteria; onChange: (value: QualityCriteria) => void; compact?: boolean; disabledKeys?: Array<keyof QualityCriteria> }) {
  const score = qualityScore(criteria)
  const missing = (Object.keys(criteria) as (keyof QualityCriteria)[]).filter(key => !criteria[key])
  return <Card>
    <CardHeader eyebrow="Якість раціону" title={`${score}/100 · ${score >= 90 ? 'Сильний день' : score >= 70 ? 'Добра база' : 'Є що підтягнути'}`} action={<div className="relative size-12 rounded-full" style={{ background: `conic-gradient(#d8ff72 ${score}%, #2b2f2c 0)` }}><div className="absolute inset-[4px] grid place-items-center rounded-full bg-[#141715] text-xs font-bold">{score}</div></div>}/>
    <div className="p-5">
      {!compact && <div className="grid gap-2 sm:grid-cols-2">{(Object.keys(criteria) as (keyof QualityCriteria)[]).map(key => { const locked = disabledKeys.includes(key); return <button key={key} disabled={locked} title={locked ? 'Цього типу продуктів немає в домашньому списку' : undefined} onClick={() => onChange({ ...criteria, [key]: !criteria[key] })} className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${criteria[key] ? 'border-lime/10 bg-lime/[.05]' : 'border-white/[.07] bg-white/[.02]'} ${locked ? 'cursor-not-allowed opacity-65' : ''}`}><span className="flex items-center gap-2.5 text-xs text-zinc-300"><span className={`grid size-5 place-items-center rounded-md ${criteria[key] ? 'bg-lime text-ink' : 'bg-white/[.07] text-zinc-500'}`}>{locked ? <LockKeyhole size={11}/> : criteria[key] ? <Check size={12}/> : <X size={12}/>}</span>{qualityLabels[key]}</span><span className="text-[11px] font-semibold text-zinc-600">+{qualityWeights[key]}</span></button> })}</div>}
      <div className={`${compact ? '' : 'mt-4'} rounded-xl bg-white/[.035] p-3.5`}><p className="flex items-center gap-2 text-xs font-semibold text-white"><Info size={14} className="text-lime"/>Короткий висновок</p><p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{missing.length ? `КБЖУ можуть бути в нормі, але варто покращити: ${missing.map(key => qualityLabels[key].toLowerCase()).join(', ')}.` : 'Раціон збалансований: цілі КБЖУ й ключові маркери якості закриті.'}</p></div>
    </div>
  </Card>
}
