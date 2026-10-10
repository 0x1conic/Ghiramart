import { Clock3, Leaf, ShieldCheck, Truck } from 'lucide-react'

const features = [
  { icon: Clock3, title: 'Fresh in 30', detail: 'Fast Pokhara delivery' },
  { icon: Leaf, title: 'Picked today', detail: 'Freshness you can see' },
  { icon: ShieldCheck, title: 'Quality checked', detail: 'Every pantry hero' },
  { icon: Truck, title: 'Careful delivery', detail: 'From market to home' },
]

export function CommerceFeatures({ dark = false }: { dark?: boolean }) {
  return <div className={`grid gap-px overflow-hidden rounded-[28px] border ${dark ? 'border-white/10 bg-white/10 text-white' : 'border-black/8 bg-black/8'} sm:grid-cols-2 xl:grid-cols-4`}>{features.map(({ icon: Icon, title, detail }) => <div key={title} className={`${dark ? 'bg-[var(--ink)]' : 'bg-white'} flex items-center gap-4 p-5`}><span className={`grid size-11 shrink-0 place-items-center rounded-full ${dark ? 'bg-[var(--lime)] text-[var(--ink)]' : 'bg-[var(--mint)] text-[var(--green)]'}`}><Icon size={19} /></span><div><strong className="font-brand text-sm">{title}</strong><p className={`mt-1 text-xs ${dark ? 'text-white/55' : 'text-[var(--muted)]'}`}>{detail}</p></div></div>)}</div>
}
