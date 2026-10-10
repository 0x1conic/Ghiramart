import { NavLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useIdentity } from '../../services/profileService'
import { BrandMark } from '../common/BrandMark'

const links = [['/market', 'All groceries'], ['/rewards', 'Offers'], ['/member/orders/GM-2048', 'Track order'], ['/account', 'Account']]

export function CustomerHeader() {
  const { cart } = useCart()
  const { user } = useIdentity()
  const { pathname } = useLocation()
  const hidden = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname) || pathname.startsWith('/order-confirmation/')
  if (hidden) return null
  return (
    <header className="customer-header fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur-xl">
      <div className="content-wrap customer-header-inner">
        <BrandMark />
        <nav className="header-primary" aria-label="Primary navigation">
          {links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `rounded-full px-3 py-2 text-[11px] font-extrabold uppercase transition-colors ${isActive ? 'bg-[var(--lime)] text-[var(--ink)]' : 'text-[var(--ink)] hover:bg-black/5'}`}>{label}</NavLink>)}
        </nav>
        <nav className="header-actions" aria-label="Account and basket">{user ? <NavLink to="/account" className="header-signin">Hi, {user.fullName.split(/\s+/u)[0]}</NavLink> : <><NavLink to="/login" className="header-signin">Sign in</NavLink><NavLink to="/register" className="header-signup">Sign up</NavLink></>}<NavLink to="/cart" className="header-basket" aria-label={`Open cart with ${cart.items.length} products`}><span className="cart-emoji" aria-hidden="true">🛒</span><span>{cart.items.length}</span></NavLink></nav>
      </div>
    </header>
  )
}
