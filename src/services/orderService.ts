import { orders as sampleOrders } from '../data/mockData'
import type { CreateBookingInput, Order, OrderStatus } from '../types'
import { calculateCart } from './cartTotals'
import { productService } from './productService'
import { profileService } from './profileService'
import { isSafeImageUrl, safeRoutePart } from './safeContent'
import { apiRequest, getAccessToken } from './api'
import type { ApiAddress, ApiOrder, ApiPage } from './apiContracts'
import { cartService } from './cartService'

const storageKey = 'griha-mart:bookings:v1'
const listeners = new Set<() => void>()
const statuses: OrderStatus[] = ['new', 'confirmed', 'cancelled', 'packing', 'rider-pickup', 'delivered']
type Snapshot = { orders: Order[]; error: string }
const samples: Order[] = sampleOrders.map(order => ({ ...order, status: order.status === 'packing' ? 'new' : order.status, eta: undefined }))
let snapshot: Snapshot = { orders: samples, error: '' }

function validOrder(value: unknown): value is Order {
  if (!value || typeof value !== 'object') return false
  const order = value as Order
  return safeRoutePart(order.id) && typeof order.placedAt === 'string' && statuses.includes(order.status)
    && !!order.address && ['recipient', 'phone', 'line1', 'city'].every(key => typeof order.address[key as keyof typeof order.address] === 'string')
    && ['cash-on-delivery', 'esewa', 'khalti-card'].includes(order.paymentMethod)
    && [order.subtotal, order.delivery, order.memberCredit, order.total].every(Number.isFinite)
    && Array.isArray(order.items) && order.items.every(item => item && typeof item.productId === 'string' && typeof item.name === 'string'
      && isSafeImageUrl(item.image) && Number.isFinite(item.price) && Number.isInteger(item.quantity) && item.quantity > 0)
}

function read(): Snapshot {
  try {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return { orders: samples, error: '' }
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed) || !parsed.every(validOrder)) throw new Error('Invalid saved bookings')
    return { orders: parsed, error: '' }
  } catch {
    return { orders: [], error: 'We couldn’t load your bookings. Your saved data has not been changed. Check browser storage and try again.' }
  }
}

function publish(next: Snapshot) { snapshot = next; listeners.forEach(listener => listener()) }
function commit(orders: Order[]) {
  try { localStorage.setItem(storageKey, JSON.stringify(orders)) }
  catch { throw new Error('Booking could not be saved. Allow browser storage or free some space, then retry. Your basket is unchanged.') }
  publish({ orders, error: '' })
}
function latest() {
  const current = read()
  if (current.error) { publish(current); throw new Error(current.error) }
  return current.orders
}

function mapApiOrder(item: ApiOrder): Order {
  const status: Record<ApiOrder['status'], OrderStatus> = { pending: 'new', confirmed: 'confirmed', shipped: 'rider-pickup', delivered: 'delivered', cancelled: 'cancelled' }
  const catalog = productService.getSnapshot().products
  const total = Number(item.total_amount)
  return { id: String(item.id), customerId: String(item.user_id), bookingRequestId: 'api', placedAt: new Date(item.created_at).toLocaleString('en-NP', { dateStyle: 'medium', timeStyle: 'short' }), status: status[item.status], address: { id: `order-${item.id}`, label: 'Delivery address', recipient: profileService.getSnapshot().user?.fullName || 'Customer', phone: item.address.phone_number, line1: item.address.street, city: item.address.city, note: item.address.state, isDefault: false }, paymentMethod: 'cash-on-delivery', items: item.items.map(line => { const product = catalog.find(value => value.id === String(line.product_id)); return { productId: String(line.product_id), name: line.product_name, price: Number(line.unit_price), quantity: line.quantity, image: product?.image || '/assets/brand/griha-mart-logo.png' } }), subtotal: Number.isFinite(total) ? total : 0, delivery: 0, memberCredit: 0, total: Number.isFinite(total) ? total : 0 }
}

snapshot = read()
window.addEventListener('storage', event => {
  if (event.key === storageKey || event.key === null) publish(read())
})

export function bookingRequestId() {
  return `${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`.toUpperCase()
}

/** Order repository backed by the API for authenticated customers and admins, with an offline fallback. */
export const orderService = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
  getSnapshot: () => snapshot,
  async list(): Promise<Order[]> { return latest() },
  async get(id: string): Promise<Order | undefined> {
    if (getAccessToken('customer') && /^\d+$/.test(id)) {
      const remote = mapApiOrder(await apiRequest<ApiOrder>(`/order/${id}`))
      publish({ orders: [remote, ...snapshot.orders.filter(item => item.id !== id)], error: '' }); return remote
    }
    return latest().find(order => order.id === id)
  },
  async refresh(admin = false): Promise<Order[]> {
    if (!(admin ? getAccessToken('admin') : getAccessToken('customer'))) return latest()
    try {
      const response = await apiRequest<ApiPage<ApiOrder>>(admin ? '/admin/orders?page=1&size=100' : '/order?page=1&size=100', {}, admin ? 'admin' : 'customer')
      const remote = response.items.map(mapApiOrder)
      publish({ orders: remote, error: '' }); return remote
    } catch (reason) { publish({ ...snapshot, error: reason instanceof Error ? reason.message : 'Could not load orders.' }); return snapshot.orders }
  },
  async create(input: CreateBookingInput): Promise<Order> {
    if (getAccessToken('customer')) {
      if (input.paymentMethod !== 'cash-on-delivery') throw new Error('The API currently accepts cash on delivery only.')
      const cart = await cartService.get()
      let addressId = Number(input.address.id)
      if (!Number.isInteger(addressId) || addressId < 1) {
        const address = await apiRequest<ApiAddress>('/address', { method: 'POST', body: JSON.stringify({ street: input.address.line1, city: input.address.city, state: input.address.note || 'Gandaki', phone_number: input.address.phone, address_type: 'primary' }) })
        addressId = address.id
      }
      const remote = await apiRequest<ApiOrder>('/order', { method: 'POST', body: JSON.stringify({ cart_id: cart.id, address_id: addressId, payment_option: 'cod' }) })
      const order = mapApiOrder(remote); publish({ orders: [order, ...snapshot.orders.filter(item => item.id !== order.id)], error: '' }); return order
    }
    const orders = latest()
    const existing = orders.find(order => order.bookingRequestId === input.requestId)
    if (existing) return existing
    if (!input.requestId || !input.items.length) throw new Error('Add a product to your basket before booking.')
    if (!input.address.recipient.trim() || !input.address.phone.trim() || !input.address.line1.trim() || !input.address.city.trim()) throw new Error('Complete your contact details.')
    if (!['cash-on-delivery', 'esewa', 'khalti-card'].includes(input.paymentMethod)) throw new Error('Choose a payment preference.')
    const catalog = await productService.list()
    const items = input.items.map(item => {
      const product = catalog.find(product => product.id === item.product.id)
      if (!product || product.status === 'out-of-stock' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) throw new Error('A basket item is unavailable or exceeds its stock. Please update your basket.')
      return { product, quantity: item.quantity }
    })
    const totals = calculateCart(items)
    const order: Order = {
      customerId: profileService.viewerId(),
      id: `GM-${input.requestId}`, bookingRequestId: input.requestId,
      placedAt: new Date().toLocaleString('en-NP', { dateStyle: 'medium', timeStyle: 'short' }), status: 'new',
      address: { ...input.address }, paymentMethod: input.paymentMethod,
      items: items.map(({ product, quantity }) => ({ productId: product.id, name: product.name, price: product.salePrice ?? product.price, image: product.image, quantity })),
      subtotal: totals.subtotal, delivery: totals.delivery, memberCredit: totals.memberCredit, total: totals.total,
    }
    const currentOrders = latest()
    const repeated = currentOrders.find(item => item.bookingRequestId === input.requestId)
    if (repeated) return repeated
    commit([order, ...currentOrders])
    return order
  },
  async updateStatus(id: string, status: 'confirmed' | 'cancelled'): Promise<Order> {
    const orders = latest()
    const order = orders.find(order => order.id === id)
    if (!order) throw new Error('Booking not found.')
    if (status !== 'confirmed' && status !== 'cancelled') throw new Error('Unsupported booking action.')
    if (order.status === status) return order
    if (!(order.status === 'new' || (order.status === 'confirmed' && status === 'cancelled'))) throw new Error('This booking can no longer be changed.')
    const updated = { ...order, status }
    commit(orders.map(order => order.id === id ? updated : order))
    return updated
  },
  async cancel(id: string): Promise<Order> {
    if (getAccessToken('customer') && /^\d+$/.test(id)) {
      const remote = mapApiOrder(await apiRequest<ApiOrder>(`/order/${id}`, { method: 'DELETE' }))
      publish({ orders: snapshot.orders.map(item => item.id === id ? remote : item), error: '' }); return remote
    }
    const orders = latest()
    const order = orders.find(item => item.id === id)
    if (!order) throw new Error('Booking not found.')
    const updated = { ...order, status: 'cancelled' as const }
    commit(orders.map(item => item.id === id ? updated : item))
    return updated
  },
}
