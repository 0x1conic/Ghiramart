import type { Address, CreateBookingInput, Order, Product } from '../types'
import { orderService } from './orderService'
import { productService } from './productService'
import { profileService } from './profileService'

const wait = (ms = 280) => new Promise((resolve) => window.setTimeout(resolve, ms))

export const catalogService = {
  async list(query = ''): Promise<Product[]> {
    await wait()
    return query.trim() ? productService.search(query) : productService.list()
  },
  async get(id: string): Promise<Product | undefined> {
    await wait()
    return (await productService.list()).find((product) => product.id === id || product.slug === id)
  },
}

export const memberService = {
  async addresses(): Promise<Address[]> { await wait(); return profileService.getSnapshot().addresses },
  async orders(): Promise<Order[]> { await wait(); return (await orderService.list()).filter(order => order.customerId === profileService.viewerId()) },
}

export const checkoutService = {
  async placeOrder(payload: CreateBookingInput): Promise<Order> {
    await wait(900)
    if (payload.paymentMethod === 'khalti-card') throw new Error('Payment didn’t go through. Nothing was charged.')
    return orderService.create(payload)
  },
}
