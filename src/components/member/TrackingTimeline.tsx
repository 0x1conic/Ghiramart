import { Check, Circle } from 'lucide-react'
import type { OrderStatus } from '../../types'

const steps: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'Ordered' }, { value: 'packing', label: 'Packing' }, { value: 'rider-pickup', label: 'Rider pickup' }, { value: 'delivered', label: 'Home' },
]

export function TrackingTimeline({ status }: { status: OrderStatus }) {
  const active = Math.max(0, steps.findIndex((step) => step.value === status))
  return (
    <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Order progress">
      {steps.map((step, index) => {
        const complete = index < active
        const current = index === active
        return <li key={step.value} className="text-[10px] font-bold uppercase"><span className={`mb-2 grid size-5 place-items-center rounded-full ${complete ? 'bg-[var(--lime)] text-[var(--ink)]' : current ? 'bg-white text-[var(--green)]' : 'border border-white/70'}`}>{complete ? <Check size={12} /> : <Circle size={8} fill={current ? 'currentColor' : 'none'} />}</span>{step.label}</li>
      })}
    </ol>
  )
}
