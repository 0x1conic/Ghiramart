import { CircleUserRound, Gift, Home, PackageCheck, Store } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/market', label: 'Market', icon: Store },
  { to: '/member/orders', label: 'Orders', icon: PackageCheck },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/account', label: 'Account', icon: CircleUserRound },
]

export function MobileBottomNav() {
  const { cart } = useCart()
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white px-2 pt-2 text-[var(--ink)] md:hidden" aria-label="Mobile navigation">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold ${isActive ? 'bg-[var(--mint)] text-[var(--green)]' : 'text-[var(--muted)]'}`}>
            <span className="relative"><Icon size={19} aria-hidden="true" />{label === 'Market' && cart.items.length > 0 && <span className="absolute -right-3 -top-2 grid min-w-4 place-items-center rounded-full bg-[var(--coral)] px-1 text-[9px] text-white">{cart.items.length}</span>}</span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
