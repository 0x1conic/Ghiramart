export type ProductStatus = 'live' | 'low-stock' | 'out-of-stock'
export type OrderStatus = 'new' | 'confirmed' | 'packing' | 'rider-pickup' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cash-on-delivery' | 'esewa' | 'khalti-card'

export interface PaymentMethodOption {
  id: PaymentMethod
  label: string
  provider?: 'internal' | 'esewa' | 'khalti'
  enabled: boolean
}

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  avatarInitials: string
  rewardPoints: number
  tier: 'Green' | 'Gold'
  referralCode?: string
}

export interface Category {
  id: string
  name: string
  mood: string
  accent: string
}

export interface Product {
  id: string
  apiId?: number
  brand?: string
  sku?: string
  publication?: 'draft' | 'published' | 'archived'
  lowStockThreshold?: number
  featured?: boolean
  name: string
  shortName: string
  slug: string
  categoryId: string
  description: string
  originNote: string
  unit: string
  price: number
  salePrice?: number
  stock: number
  status: ProductStatus
  image: string
  /** Ordered gallery. The first item is also mirrored in `image` for cards and legacy APIs. */
  images?: string[]
  accent: 'mint' | 'coral' | 'amber' | 'blue' | 'cream' | 'pink'
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  id?: string
  items: CartItem[]
  subtotal: number
  delivery: number
  memberCredit: number
  total: number
}

export interface Address {
  id: string
  label: string
  recipient: string
  phone: string
  line1: string
  city: string
  note?: string
  isDefault: boolean
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
  customerId?: string
  bookingRequestId?: string
  placedAt: string
  status: OrderStatus
  eta?: string
  address: Address
  items: OrderItem[]
  subtotal: number
  delivery: number
  memberCredit: number
  total: number
  paymentMethod: PaymentMethod
}

export interface CreateBookingInput {
  requestId: string
  items: CartItem[]
  address: Address
  paymentMethod: PaymentMethod
}

export interface RewardTransaction {
  id: string
  label: string
  points: number
  createdAt: string
  type: 'earned' | 'redeemed' | 'referral'
}

export interface Referral {
  code: string
  senderReward: number
  friendCredit: number
  completedReferrals: number
}
