import { apiRequest } from './api'
import type { ApiCart } from './apiContracts'
import { mapApiProduct } from './productService'
import type { CartItem } from '../types'

export function mapApiCart(cart: ApiCart): { id: string; items: CartItem[] } {
  return { id: String(cart.id), items: cart.items.map(item => ({ product: mapApiProduct(item.product), quantity: item.quantity })) }
}

export const cartService = {
  get: () => apiRequest<ApiCart>('/cart'),
  add: (productId: number) => apiRequest<ApiCart>('/cart', { method: 'POST', body: JSON.stringify({ product_id: productId }) }),
  increase: (productId: number) => apiRequest<ApiCart>(`/cart/${productId}/increase`, { method: 'POST' }),
  decrease: (productId: number) => apiRequest<ApiCart>(`/cart/${productId}/decrease`, { method: 'POST' }),
  remove: (productId: number) => apiRequest<ApiCart>(`/cart/${productId}`, { method: 'DELETE' }),
  clear: () => apiRequest<void>('/cart', { method: 'DELETE' }),
}
