import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { BookingStatus, useBookings } from '../../components/commerce/BookingDetails'

const filters = [{ value: 'all', label: 'All' }, { value: 'new', label: 'New' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'delivered', label: 'Completed samples' }]
export function AdminOrdersPage() {
  const [active, setActive] = useState('all')
  const { orders, error } = useBookings(true)
  const visible = orders.filter(order => active === 'all' || order.status === active)
  return <main className="min-h-svh pb-10"><AdminPageHeader section="Orders" title="Customer bookings" subtitle="Review new baskets and keep every booking up to date." /><div className="px-6 lg:px-10">{error && <p role="alert" className="mt-5 text-red-700">{error}</p>}<div className="mt-7 flex gap-3 overflow-x-auto" aria-label="Filter bookings">{filters.map(filter => <button key={filter.value} aria-pressed={active === filter.value} onClick={() => setActive(filter.value)} className={`pill-button shrink-0 ${active === filter.value ? 'btn-ink' : 'bg-white'}`}>{filter.label} {orders.filter(order => filter.value === 'all' || order.status === filter.value).length}</button>)}</div><div className="mt-7 space-y-4" aria-live="polite">{visible.map(order => <Link data-booking-id={order.id} key={order.id} to={`/admin/orders/${order.id}`} className="grid items-center gap-4 rounded-3xl bg-white p-6 sm:grid-cols-[minmax(0,1fr)_auto_auto]"><div className="min-w-0"><strong className="break-all font-brand text-lg">{order.id}</strong><p className="mt-2 text-sm">{order.address.recipient} · {order.address.city}</p><p className="mt-1 text-xs text-[var(--muted)]">{order.placedAt} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p></div><strong className="text-[var(--green)]">NPR {order.total.toLocaleString()}</strong><BookingStatus status={order.status} /></Link>)}{!visible.length && !error && <p className="surface-card" role="status">No bookings in this view yet.</p>}</div></div></main>
}
