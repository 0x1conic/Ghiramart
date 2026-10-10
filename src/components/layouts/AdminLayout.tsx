import { Boxes, Gift, LayoutDashboard, Megaphone, PackageCheck, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { BrandMark } from '../common/BrandMark'

const links = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/orders', label: 'Orders', icon: PackageCheck },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/rewards', label: 'Rewards', icon: Gift },
  { to: '/admin/promotions', label: 'Promotions', icon: Megaphone },
]

export function AdminLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fff7e6] lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="min-w-0 overflow-hidden bg-[var(--forest)] p-5 text-white lg:fixed lg:inset-y-0 lg:w-[250px] lg:p-7">
        <BrandMark admin light to="/admin/dashboard" />
        <p className="mt-4 text-[9px] font-bold uppercase text-white/65">Admin control room</p>
        <nav className="mt-5 flex w-full min-w-0 gap-2 overflow-x-auto lg:mt-10 lg:flex-col" aria-label="Admin navigation">
          {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? 'bg-[var(--lime)] text-[var(--ink)]' : 'hover:bg-white/10'}`}><Icon size={17} />{label}</NavLink>)}
        </nav>
      </aside>
      <div className="lg:col-start-2"><Outlet /></div>
    </div>
  )
}
