import { Activity, Apple, Dumbbell, LayoutDashboard, UserRound, X } from 'lucide-react'
import type { Page } from '../../lib/types'

const items = [
  { id: 'dashboard' as Page, label: 'Огляд', icon: LayoutDashboard }, { id: 'profile' as Page, label: 'Профіль', icon: UserRound },
  { id: 'nutrition' as Page, label: 'Харчування', icon: Apple }, { id: 'training' as Page, label: 'Тренування', icon: Dumbbell }, { id: 'progress' as Page, label: 'Прогрес', icon: Activity },
]
export function Sidebar({ page, onChange, open, onClose }: { page: Page; onChange: (p: Page) => void; open: boolean; onClose: () => void }) {
  return <><div className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden ${open ? 'block' : 'hidden'}`} onClick={onClose}/><aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[.07] bg-[#0b0d0c] p-4 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="mb-7 flex h-12 items-center justify-between px-2"><button onClick={() => onChange('dashboard')} className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-lime text-sm font-black text-ink">F</span><span className="text-lg font-bold tracking-tight">Forma</span></button><button className="text-zinc-400 lg:hidden" onClick={onClose}><X size={20}/></button></div>
    <nav className="space-y-1">{items.map(item => <button key={item.id} onClick={() => { onChange(item.id); onClose() }} className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${page === item.id ? 'bg-white/[.08] text-white' : 'text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200'}`}><item.icon size={18} className={page === item.id ? 'text-lime' : ''}/>{item.label}</button>)}</nav>
    <div className="mt-auto rounded-2xl border border-white/[.07] bg-white/[.03] p-4"><p className="text-xs font-semibold text-white">Приватний простір</p><p className="mt-1 text-xs leading-relaxed text-zinc-500">Дані зберігаються лише у цьому браузері.</p><div className="mt-3 flex items-center gap-2 text-xs text-lime"><span className="size-1.5 rounded-full bg-lime"/>Локально збережено</div></div>
  </aside></>
}
