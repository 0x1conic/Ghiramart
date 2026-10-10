import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { products } from '../data/mockData'
import type { Cart, CartItem, Product } from '../types'
import { calculateCart } from '../services/cartTotals'
import { productService } from '../services/productService'
import { profileService, useIdentity } from '../services/profileService'
import { getAccessToken } from '../services/api'
import { cartService, mapApiCart } from '../services/cartService'

interface CartContextValue {
  cart: Cart
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  message: string
  clearMessage: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  useIdentity()
  const viewerId = profileService.viewerId()
  const previousViewer = useRef(viewerId)
  const [items, setItems] = useState<CartItem[]>(() => products.slice(0, 3).flatMap(seed => {
    const product = productService.getSnapshot().products.find(item => item.id === seed.id && item.publication === 'published' && item.stock > 0)
    return product ? [{ product, quantity: 1 }] : []
  }))
  const [message, setMessage] = useState('')
  const [remoteCartId, setRemoteCartId] = useState<string>()
  useEffect(() => {
    if (previousViewer.current !== viewerId) { setItems([]); setMessage(''); previousViewer.current = viewerId }
  }, [viewerId])
  useEffect(() => {
    if (!getAccessToken('customer')) { setRemoteCartId(undefined); return }
    void cartService.get().then(response => { const mapped = mapApiCart(response); setItems(mapped.items); setRemoteCartId(mapped.id) }).catch(() => { /* Keep the local basket available during API outages. */ })
  }, [viewerId])

  const announce = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 2400)
  }

  const addItem = (product: Product) => {
    if (product.status === 'out-of-stock') return announce(`${product.name} will return soon.`)
    setItems((current) => {
      const found = current.find((item) => item.product.id === product.id)
      return found
        ? current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { product, quantity: 1 }]
    })
    announce(`${product.name} added to your basket.`)
    if (product.apiId && getAccessToken('customer')) void cartService.add(product.apiId).then(response => { const mapped = mapApiCart(response); setItems(mapped.items); setRemoteCartId(mapped.id) }).catch(reason => announce(reason instanceof Error ? reason.message : 'Could not update your basket.'))
  }

  const removeItem = (productId: string) => {
    const product = items.find(item => item.product.id === productId)?.product
    setItems((current) => current.filter((item) => item.product.id !== productId))
    if (product?.apiId && getAccessToken('customer')) void cartService.remove(product.apiId).then(response => { const mapped = mapApiCart(response); setItems(mapped.items); setRemoteCartId(mapped.id) }).catch(reason => announce(reason instanceof Error ? reason.message : 'Could not update your basket.'))
  }
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeItem(productId)
    const current = items.find(item => item.product.id === productId)
    setItems((value) => value.map((item) => item.product.id === productId ? { ...item, quantity } : item))
    if (current?.product.apiId && getAccessToken('customer')) {
      const operation = quantity > current.quantity ? cartService.increase : cartService.decrease
      void operation(current.product.apiId).then(response => { const mapped = mapApiCart(response); setItems(mapped.items); setRemoteCartId(mapped.id) }).catch(reason => announce(reason instanceof Error ? reason.message : 'Could not update your basket.'))
    }
  }

  const cart = useMemo<Cart>(() => ({ ...calculateCart(items), id: remoteCartId }), [items, remoteCartId])

  const clearCart = () => { setItems([]); setRemoteCartId(undefined); if (getAccessToken('customer')) void cartService.clear().catch(() => undefined) }
  return <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, message, clearMessage: () => setMessage('') }}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
