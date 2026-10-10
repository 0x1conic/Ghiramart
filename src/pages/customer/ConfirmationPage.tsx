import { ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageTransition, Reveal } from '../../components/motion/MotionPrimitives'
import { BookingStatus, useCustomerBookings } from '../../components/commerce/BookingDetails'

export function ConfirmationPage() {
  const { orderId } = useParams()
  const { orders, error } = useCustomerBookings()
  const order = orders.find(order => order.id === orderId)
  return <PageTransition className="page-shell min-h-svh bg-[var(--amber)]"><div className="content-wrap py-10"><Reveal className="max-w-4xl"><span className="eyebrow">GRIHA — MART / BOOKING</span><h1 className="display-title mt-10 text-7xl md:text-8xl">{order ? <>Your booking.<br />In good hands.</> : 'Booking not found.'}</h1>{error && <p role="alert">{error}</p>}{order && <><p className="mt-5 break-all font-bold">{order.id}</p><div className="mt-4"><BookingStatus status={order.status} /></div><section className="surface-card mt-8"><h2 className="font-brand text-2xl font-bold">Booking received</h2><p className="mt-3">Your {order.items.reduce((sum, item) => sum + item.quantity, 0)} items are booked under {order.address.recipient}. Total: NPR {order.total.toLocaleString()}.</p><p className="mt-3">Your booking is awaiting review. Check Orders for the latest status.</p></section><Link className="pill-button btn-ink mt-6" to={`/member/orders/${order.id}`}>View booking <ArrowRight size={15} /></Link></>}<Link className="pill-button ml-3 mt-6 bg-white" to="/market">Return to market</Link></Reveal></div></PageTransition>
}
