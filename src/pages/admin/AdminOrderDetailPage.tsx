import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { BookingItems, BookingStatus, BookingTotals, paymentLabels, useBookings } from '../../components/commerce/BookingDetails'
import { orderService } from '../../services/orderService'

export function AdminOrderDetailPage() {
  const { orderId } = useParams()
  const { orders, error: storageError } = useBookings(true)
  const order = orders.find(order => order.id === orderId)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  async function update(status: 'confirmed' | 'cancelled') {
    if (!order || pending) return
    setPending(true); setError(''); setMessage('')
    try { await orderService.updateStatus(order.id, status); setMessage(status === 'confirmed' ? 'Booking confirmed. The customer view has been updated.' : 'Booking cancelled. No payment or refund was processed.'); setCancelling(false) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update booking.') }
    finally { setPending(false) }
  }
  if (!order) return <main className="p-8"><h1 className="section-title">Booking not found.</h1>{storageError && <p role="alert">{storageError}</p>}<Link className="pill-button btn-ink mt-5" to="/admin/orders">Back to bookings</Link></main>
  const connected = order.bookingRequestId === 'api'
  return <main className="min-h-svh pb-10"><AdminPageHeader section="Booking details" title="Review this basket." action={<BookingStatus status={order.status} />} /><div className="grid gap-5 px-6 pt-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,.75fr)] lg:px-10"><section className="surface-card min-w-0"><h2 className="break-all font-brand text-xl font-bold">{order.id}</h2><p className="mt-2 text-xs text-[var(--muted)]">Booked {order.placedAt}</p><BookingItems order={order} /><BookingTotals order={order} /></section><aside className="space-y-5"><section className="surface-card"><h2 className="font-brand text-xl font-bold">Customer details</h2><p className="mt-5 font-bold">{order.address.recipient}</p><p className="mt-2 break-words text-sm">{order.address.phone}</p><p className="mt-2 break-words text-sm">{order.address.line1}, {order.address.city}</p><p className="mt-5 text-sm">Payment preference: {paymentLabels[order.paymentMethod]}</p><p className="mt-2 text-xs text-[var(--muted)]">No payment collected</p></section><section className="surface-card"><h2 className="font-brand text-xl font-bold">Admin review</h2><p className="mt-3 text-sm">{connected ? 'This order’s current status is synchronized with Griha Mart.' : 'Review the customer’s details, then confirm or cancel the booking.'}</p>{!connected && order.status === 'new' && <button disabled={pending} onClick={() => update('confirmed')} className="pill-button btn-ink mt-5 w-full">Confirm booking</button>}{!connected && ['new', 'confirmed'].includes(order.status) && !cancelling && <button disabled={pending} onClick={() => setCancelling(true)} className="pill-button mt-3 w-full bg-[var(--pink)]">Cancel booking</button>}{cancelling && <div className="mt-4 rounded-xl border border-red-200 p-4"><p className="text-sm">Cancel this booking? This cannot be undone.</p><div className="mt-3 flex flex-wrap gap-2"><button disabled={pending} className="pill-button btn-ink" onClick={() => update('cancelled')}>Yes, cancel booking</button><button disabled={pending} className="pill-button bg-[var(--mint)]" onClick={() => setCancelling(false)}>Keep booking</button></div></div>}{message && <p role="status" className="mt-4 text-sm text-[var(--green)]">{message}</p>}{(error || storageError) && <p role="alert" className="mt-4 text-sm text-red-700">{error || storageError}</p>}</section><Link className="pill-button bg-white" to="/admin/orders">← All bookings</Link></aside></div></main>
}
