import type { ReactNode } from 'react'
import type { Page } from '../../lib/types'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
export function AppShell({ children, page, onChange, menuOpen, setMenuOpen, onCheckin }: { children: ReactNode; page: Page; onChange: (p: Page) => void; menuOpen: boolean; setMenuOpen: (v: boolean) => void; onCheckin: () => void }) { return <div className="min-h-screen bg-ink text-zinc-100"><Sidebar page={page} onChange={onChange} open={menuOpen} onClose={() => setMenuOpen(false)}/><div className="lg:pl-64"><Header page={page} onMenu={() => setMenuOpen(true)} onCheckin={onCheckin}/><main className="mx-auto max-w-[1500px] p-4 sm:p-7">{children}</main></div></div> }
