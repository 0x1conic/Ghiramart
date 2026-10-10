import { Link } from 'react-router-dom'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { BookingStatus, useBookings } from '../../components/commerce/BookingDetails'

export function AdminDashboardPage() {
  const { orders, error } = useBookings(true)
  const pendingValue = orders.filter(order => ['new', 'confirmed'].includes(order.status)).reduce((sum, order) => sum + order.total, 0)
  const metrics = [
    ['Booking value', 'NPR ' + pendingValue.toLocaleString(), 'New + confirmed · not revenue', 'bg-[#13a653]'],
    ['New bookings', String(orders.filter(order => order.status === 'new').length), 'Awaiting your review', 'bg-[#ff6433]'],
    ['Confirmed', String(orders.filter(order => order.status === 'confirmed').length), 'Reviewed by admin', 'bg-[#aee0fa]'],
    ['Cancelled', String(orders.filter(order => order.status === 'cancelled').length), 'No payment processed', 'bg-[#ffacca]'],
  ]
  return <main className="min-h-svh pb-10"><AdminPageHeader section="Overview" title="Your booking desk." subtitle="Review customer baskets, confirm bookings, and manage your daily orders." /><div className="px-6 lg:px-10">{error && <p role="alert" className="mt-5 text-red-700">{error}</p>}<div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, detail, color]) => <article key={label} className={`rounded-3xl p-6 ${color}`}><span className="eyebrow">{label}</span><p className="font-brand mt-4 text-3xl font-bold">{value}</p><p className="mt-3 text-xs font-semibold">{detail}</p></article>)}</div><section className="surface-card mt-7"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-brand text-xl font-bold">Recent bookings</h2><Link className="text-sm font-bold underline" to="/admin/orders">View all bookings →</Link></div><div className="mt-5 space-y-3" aria-live="polite">{orders.slice(0, 8).map(order => <Link key={order.id} to={`/admin/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#fff7e6] px-5 py-4"><div className="min-w-0"><strong className="break-all text-sm">{order.id}</strong><p className="mt-2 text-xs">{order.address.recipient} · NPR {order.total.toLocaleString()}</p></div><BookingStatus status={order.status} /></Link>)}{!orders.length && !error && <p>No bookings yet.</p>}</div></section></div></main>
}
