import type { ButtonHTMLAttributes, ReactNode } from 'react'
export function Button({ children, className = '', variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' }) {
  const styles = { primary: 'bg-lime text-ink hover:bg-[#c8f255]', secondary: 'bg-white/[.06] text-white border border-white/10 hover:bg-white/10', ghost: 'text-zinc-400 hover:text-white hover:bg-white/5' }
  return <button className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-40 ${styles[variant]} ${className}`} {...props}>{children}</button>
}
