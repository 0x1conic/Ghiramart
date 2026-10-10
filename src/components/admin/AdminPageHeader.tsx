import type { ReactNode } from 'react'

export function AdminPageHeader({ section, title, subtitle, action }: { section: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <>
      <header className="flex h-[76px] items-center justify-between bg-white px-6 lg:px-10"><h1 className="font-brand text-xl font-bold">{section}</h1><span className="text-xs text-[var(--muted)]">Pokhara • Live now</span></header>
      <div className="flex flex-col gap-5 px-6 pt-8 lg:flex-row lg:items-start lg:justify-between lg:px-10"><div><h2 className="section-title text-3xl lg:text-[2.5rem]">{title}</h2>{subtitle && <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>}</div>{action}</div>
    </>
  )
}
