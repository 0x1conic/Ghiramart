import type { Cart, CartItem } from '../types'

export function calculateCart(items: CartItem[]): Cart {
  const subtotal = items.reduce((sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity, 0)
  const delivery = items.length ? 80 : 0
  // Reward redemption must come from the backend, not a shared sample member.
  const memberCredit = 0
  return { items, subtotal, delivery, memberCredit, total: subtotal + delivery + memberCredit }
}
