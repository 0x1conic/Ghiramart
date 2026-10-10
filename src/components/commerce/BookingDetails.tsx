import { useEffect, useSyncExternalStore } from 'react'
import type { Order, OrderStatus, PaymentMethod } from '../../types'
import { orderService } from '../../services/orderService'
import { profileService, useIdentity } from '../../services/profileService'
import { safeImageUrl } from '../../services/safeContent'

export const bookingStatus: Record<OrderStatus, string> = {
  new: 'New · awaiting review', confirmed: 'Confirmed by admin', cancelled: 'Cancelled',
  packing: 'Confirmed by admin', 'rider-pickup': 'Confirmed by admin', delivered: 'Completed (sample)',
}
export const paymentLabels: Record<PaymentMethod, string> = { 'cash-on-delivery': 'Cash on delivery', esewa: 'eSewa', 'khalti-card': 'Khalti / Card' }
export function useBookings(admin = false) { const state = useSyncExternalStore(orderService.subscribe, orderService.getSnapshot); useEffect(() => { void orderService.refresh(admin) }, [admin]); return state }
export function useCustomerBookings() {
  useIdentity()
  const state = useBookings()
  return { ...state, orders: state.orders.filter(order => order.customerId === profileService.viewerId()) }
}
export function BookingStatus({ status }: { status: OrderStatus }) {
  return <span className={`status-pill ${status === 'cancelled' ? 'bg-[var(--pink)]' : status === 'new' ? 'bg-[var(--amber)]' : 'bg-[var(--mint)]'} text-[var(--ink)]`}>{bookingStatus[status]}</span>
}
export function BookingItems({ order }: { order: Order }) {
  return <ul className="booking-items mt-5 divide-y divide-black/10">{order.items.map(item => <li key={item.productId} className="flex flex-wrap items-center gap-3 py-4"><img src={safeImageUrl(item.image)} alt="" className="h-16 w-14 object-contain" /><div className="min-w-0 flex-1"><strong className="text-sm">{item.name}</strong><p className="mt-1 text-xs text-[var(--muted)]">{item.quantity} × NPR {item.price.toLocaleString()}</p></div><strong className="text-sm">NPR {(item.price * item.quantity).toLocaleString()}</strong></li>)}</ul>
}
export function BookingTotals({ order }: { order: Pick<Order, 'subtotal' | 'delivery' | 'memberCredit' | 'total'> }) {
  return <dl className="mt-6 grid grid-cols-2 gap-3 text-sm"><dt>Subtotal</dt><dd className="text-right">NPR {order.subtotal.toLocaleString()}</dd><dt>Delivery estimate</dt><dd className="text-right">NPR {order.delivery}</dd><dt>Member credit</dt><dd className="text-right">− NPR {Math.abs(order.memberCredit)}</dd><dt className="font-bold">Booking total</dt><dd className="text-right font-bold">NPR {order.total.toLocaleString()}</dd></dl>
}
