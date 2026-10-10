import { RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatePanel } from '../../components/common/StatePanel'
import { PageTransition } from '../../components/motion/MotionPrimitives'

export function StatesPage() {
  return <PageTransition className="page-shell bg-[var(--cream)]"><div className="content-wrap py-8"><span className="eyebrow text-[var(--green)]">Griha Mart / Shopping help</span><h1 className="section-title mt-5 max-w-3xl uppercase">A little help.<br />Along the way.</h1><p className="mt-4 text-[var(--muted)]">From finding your favourites to checking out, here’s what you might see along the way.</p><div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    <section className="surface-card min-h-56 border-t-8 border-[var(--blue)]"><span className="eyebrow text-[var(--blue)]">Loading</span><h2 className="font-brand mt-5 text-xl font-bold">Fetching today’s market…</h2><div className="mt-7 space-y-3"><div className="skeleton h-4 rounded-full" /><div className="skeleton h-4 w-2/3 rounded-full" /><div className="skeleton h-14 rounded-2xl" /></div></section>
    <StatePanel kind="empty" eyebrow="Empty cart" title="Your basket is ready for its first hero." action={<Link className="text-sm font-bold text-[var(--lime)]" to="/market">Return to market →</Link>} />
    <StatePanel kind="results" eyebrow="No results" title="Nothing matched that craving." action={<Link className="text-sm font-bold text-[var(--blue)]" to="/market">Clear filters →</Link>} />
    <StatePanel kind="empty" eyebrow="Out of stock" title="This pantry hero will return soon." action={<button className="text-sm font-bold text-[var(--blue)]">Notify me →</button>} />
    <StatePanel kind="error" eyebrow="Payment failed" title="Payment didn’t go through. Nothing was charged." action={<Link className="text-sm font-bold text-[var(--blue)]" to="/checkout">Try again • change method</Link>} />
    <StatePanel kind="network" eyebrow="Network error" title="Pokhara signal took a tea break." action={<button className="inline-flex items-center gap-2 text-sm font-bold text-[var(--blue)]"><RefreshCw size={15} /> Retry connection</button>} />
    <StatePanel kind="success" eyebrow="Success" title="Your changes are safely home." description="You can carry on shopping." />
  </div></div></PageTransition>
}
