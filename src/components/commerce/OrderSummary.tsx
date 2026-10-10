import { ArrowRight, LockKeyhole, Tag, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Cart } from '../../types'

export function OrderSummary({ cart, checkout = false }: { cart: Cart; checkout?: boolean }) {
  return (
    <aside className="flex min-h-[360px] flex-col justify-between rounded-[38px] bg-[var(--black)] p-8 text-white">
      <div>
        <div className="flex items-center justify-between"><span className="eyebrow text-[var(--amber)]">Order summary</span><LockKeyhole size={16} className="text-white/45" /></div>
        <p className="font-display mt-8 text-6xl leading-[.9]">NPR<br />{cart.total.toLocaleString()}</p>
        <dl className="mt-10 grid grid-cols-2 gap-y-1 text-sm text-white/75">
          <dt>Subtotal</dt><dd className="text-right">{cart.subtotal.toLocaleString()}</dd>
          <dt>Delivery estimate</dt><dd className="text-right">{cart.delivery}</dd>
          <dt>Member credit</dt><dd className="text-right">− {Math.abs(cart.memberCredit)}</dd>
        </dl>
        <form className="mt-7 flex rounded-full bg-white/8 p-1" onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="promo-code">Promo code</label><Tag className="ml-3 self-center text-white/45" size={15} /><input id="promo-code" className="min-w-0 flex-1 bg-transparent px-3 text-xs text-white outline-none placeholder:text-white/40" placeholder="Promo code" /><button className="rounded-full bg-white px-4 py-2 text-[10px] font-extrabold uppercase text-[var(--ink)]">Apply</button></form>
        <p className="mt-5 flex items-center gap-2 text-xs text-white/55"><Truck size={14} /> Booking only · delivery is not scheduled</p>
      </div>
      {!checkout && <Link className="pill-button btn-amber mt-8 w-full" to="/checkout">Checkout securely <ArrowRight size={15} /></Link>}
    </aside>
  )
}
