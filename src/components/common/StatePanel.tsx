import { AlertTriangle, CheckCircle2, PackageOpen, SearchX, SignalZero } from 'lucide-react'
import type { ReactNode } from 'react'

const icons = {
  empty: PackageOpen,
  results: SearchX,
  network: SignalZero,
  error: AlertTriangle,
  success: CheckCircle2,
}

export function StatePanel({ kind, eyebrow, title, description, action }: { kind: keyof typeof icons; eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  const Icon = icons[kind]
  return (
    <section className="surface-card flex min-h-56 flex-col justify-between border-t-8 border-[var(--accent,var(--blue))]" aria-live="polite">
      <div>
        <div className="mb-5 flex items-center justify-between">
          <span className="eyebrow text-[var(--green)]">{eyebrow}</span>
          <Icon aria-hidden="true" size={22} />
        </div>
        <h2 className="font-brand text-xl font-bold leading-tight">{title}</h2>
        {description && <p className="mt-3 text-sm text-[var(--muted)]">{description}</p>}
      </div>
      {action && <div className="mt-6">{action}</div>}
    </section>
  )
}
