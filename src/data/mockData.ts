import type { Address, Category, Order, Product, Referral, RewardTransaction, User } from '../types'

export const categories: Category[] = [
  { id: 'rice-dal', name: 'Rice & Dal', mood: 'Dal–Bhat night', accent: 'mint' },
  { id: 'breakfast', name: 'Breakfast', mood: 'Fast breakfast', accent: 'cream' },
  { id: 'fresh', name: 'Fresh', mood: 'Fresh today', accent: 'blue' },
  { id: 'hosting', name: 'Hosting', mood: 'Hosting home', accent: 'amber' },
]

const basmatiGallery = [
  '/assets/products/basmati-rice.png',
  '/assets/products/basmati-rice-left.png',
  '/assets/products/basmati-rice-right.png',
]

export const products: Product[] = [
  {
    id: 'rice-5kg', name: 'Himalayan Basmati Rice', shortName: 'Rice', slug: 'himalayan-basmati-rice',
    categoryId: 'rice-dal', description: 'Long grain, aromatic, and made for the table where everyone stays a little longer.',
    originNote: 'Selected for Pokhara kitchens. Delivered today.', unit: '5 kg', price: 1050, stock: 23,
    status: 'live', image: basmatiGallery[0], images: basmatiGallery, accent: 'mint',
  },
  {
    id: 'dal-1kg', name: 'Masoor Dal', shortName: 'Dal', slug: 'masoor-dal', categoryId: 'rice-dal',
    description: 'Warm, quick-cooking red lentils for everyday comfort.', originNote: 'A pantry staple for a proper dal–bhat night.',
    unit: '1 kg', price: 210, stock: 8, status: 'low-stock', image: '/assets/products/masoor-dal.png', accent: 'coral',
  },
  {
    id: 'oil-1l', name: 'Mustard Oil', shortName: 'Oil', slug: 'mustard-oil', categoryId: 'hosting',
    description: 'Bold, fragrant mustard oil for pickles, curries and family recipes.', originNote: 'Cold-pressed flavour, bottled for the Nepali kitchen.',
    unit: '1 L', price: 325, stock: 41, status: 'live', image: '/assets/products/mustard-oil.png', accent: 'amber',
  },
  {
    id: 'tomato-1kg', name: 'Fresh Tomatoes', shortName: 'Tomato', slug: 'fresh-tomatoes', categoryId: 'fresh',
    description: 'Bright, juicy tomatoes harvested for today’s meals.', originNote: 'Morning-fresh and selected by hand.',
    unit: '1 kg', price: 95, stock: 16, status: 'live', image: '/assets/products/tomatoes.png', accent: 'blue',
  },
  {
    id: 'milk-1l', name: 'Buffalo Milk', shortName: 'Milk', slug: 'buffalo-milk', categoryId: 'breakfast',
    description: 'Rich, fresh buffalo milk for tea, breakfast and home.', originNote: 'Fresh batch returns tomorrow morning.',
    unit: '1 L', price: 120, stock: 0, status: 'out-of-stock', image: '/assets/products/buffalo-milk.png', accent: 'cream',
  },
  {
    id: 'rice-family-pack', name: 'Basmati Rice Family Pack', shortName: 'Rice Family Pack', slug: 'basmati-rice-family-pack', categoryId: 'rice-dal',
    description: 'Two pantry-sized bags for busy family kitchens and generous weekend tables.', originNote: 'Better value for homes that cook rice every day.',
    unit: '2 × 5 kg', price: 2100, salePrice: 1990, stock: 14, status: 'live', image: basmatiGallery[0], images: basmatiGallery, accent: 'blue',
  },
  {
    id: 'dal-twin-pack', name: 'Masoor Dal Twin Pack', shortName: 'Dal Twin Pack', slug: 'masoor-dal-twin-pack', categoryId: 'rice-dal',
    description: 'A double pantry refill of quick-cooking red lentils for comforting everyday meals.', originNote: 'Packed as a value pair for the weekly shop.',
    unit: '2 × 1 kg', price: 420, salePrice: 399, stock: 7, status: 'low-stock', image: '/assets/products/masoor-dal.png', accent: 'mint',
  },
  {
    id: 'oil-kitchen-pair', name: 'Mustard Oil Kitchen Pair', shortName: 'Oil Pair', slug: 'mustard-oil-kitchen-pair', categoryId: 'hosting',
    description: 'Two bottles of bold mustard oil for pickles, curries and family cooking.', originNote: 'A practical kitchen pair with member-friendly value.',
    unit: '2 × 1 L', price: 650, salePrice: 620, stock: 19, status: 'live', image: '/assets/products/mustard-oil.png', accent: 'coral',
  },
  {
    id: 'tomato-family-crate', name: 'Tomato Family Crate', shortName: 'Tomato Crate', slug: 'tomato-family-crate', categoryId: 'fresh',
    description: 'A larger hand-selected crate for sauces, salads and family-sized curries.', originNote: 'Picked this morning and packed for a full household.',
    unit: '3 kg', price: 285, salePrice: 270, stock: 10, status: 'live', image: '/assets/products/tomatoes.png', accent: 'amber',
  },
  {
    id: 'milk-morning-pair', name: 'Buffalo Milk Morning Pair', shortName: 'Milk Pair', slug: 'buffalo-milk-morning-pair', categoryId: 'breakfast',
    description: 'Two fresh cartons for morning tea, breakfast and the whole family.', originNote: 'Delivered chilled in the first morning batch.',
    unit: '2 × 1 L', price: 240, salePrice: 230, stock: 18, status: 'live', image: '/assets/products/buffalo-milk.png', accent: 'pink',
  },
  // Demo inventory and prices; replace through the catalog service for production.
  {
    id: 'onions-1kg', name: 'Red Onions', shortName: 'Onions', slug: 'red-onions', categoryId: 'fresh',
    description: 'Crisp red onions for a fragrant curry base, crunchy salads and homemade achar.',
    originNote: 'An everyday essential for your vegetable basket.', unit: '1 kg', price: 85, stock: 32,
    status: 'live', image: '/assets/products/onions.png', accent: 'pink',
  },
  {
    id: 'potatoes-1kg', name: 'Golden Potatoes', shortName: 'Potatoes', slug: 'golden-potatoes', categoryId: 'fresh',
    description: 'Versatile golden potatoes for comforting aloo dishes, crispy sides and family favourites.',
    originNote: 'Ready for the meals that feel like home.', unit: '1 kg', price: 70, stock: 38,
    status: 'live', image: '/assets/products/potatoes.png', accent: 'cream',
  },
  {
    id: 'bananas-1kg', name: 'Ripe Bananas', shortName: 'Bananas', slug: 'ripe-bananas', categoryId: 'fresh',
    description: 'Naturally sweet bananas for breakfast bowls, smoothies and an easy afternoon snack.',
    originNote: 'A little sunshine for your fruit bowl.', unit: '1 kg', price: 140, stock: 24,
    status: 'live', image: '/assets/products/bananas.png', accent: 'amber',
  },
]

// A distinct photograph for every homepage pick; value packs remain in the market.
export const featuredProducts = products.filter((product) => [
  'rice-5kg', 'dal-1kg', 'oil-1l', 'tomato-1kg', 'milk-1l', 'onions-1kg', 'potatoes-1kg', 'bananas-1kg',
].includes(product.id))
export const heroProducts = featuredProducts.filter((product) => product.id !== 'potatoes-1kg')

// Historical fixture only. Active member UI must use profileService/useIdentity.
export const currentUser: User = {
  id: 'usr-sample', fullName: 'Sample Member', email: 'hello@grihamart.com', phone: '+977 9800 000 000',
  avatarInitials: 'SM', rewardPoints: 2480, tier: 'Green',
}

export const savedAddresses: Address[] = [
  { id: 'addr-home', label: 'Home', recipient: 'Sample Member', phone: '+977 9800 000 000', line1: 'Lakeside, near Hallan Chowk', city: 'Pokhara', note: 'Call at the gate', isDefault: true },
  { id: 'addr-work', label: 'Work', recipient: 'Sample Member', phone: '+977 9800 000 000', line1: 'New Road, near Mahendrapul', city: 'Pokhara', isDefault: false },
]

const orderItems = products.slice(0, 3).map((product) => ({ productId: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }))

export const orders: Order[] = [
  { id: 'GM-2048', placedAt: 'Today • 4:31 PM', status: 'packing', eta: '5:28 PM', address: savedAddresses[0], items: orderItems, subtotal: 1585, delivery: 80, memberCredit: -65, total: 1600, paymentMethod: 'cash-on-delivery' },
  { id: 'GM-1982', placedAt: 'Sep 08', status: 'delivered', address: savedAddresses[0], items: orderItems.slice(0, 2), subtotal: 2060, delivery: 80, memberCredit: 0, total: 2140, paymentMethod: 'esewa' },
  { id: 'GM-1924', placedAt: 'Aug 29', status: 'delivered', address: savedAddresses[1], items: orderItems.slice(1), subtotal: 900, delivery: 80, memberCredit: 0, total: 980, paymentMethod: 'khalti-card' },
]

export const rewardTransactions: RewardTransaction[] = [
  { id: 'rw-1', label: 'Referral joined', points: 1500, createdAt: 'Today', type: 'referral' },
  { id: 'rw-2', label: 'Order GM-2048', points: 160, createdAt: 'Today', type: 'earned' },
  { id: 'rw-3', label: 'Checkout reward', points: -500, createdAt: 'Sep 08', type: 'redeemed' },
]

export const referral: Referral = { code: 'SAMPLE150', senderReward: 1500, friendCredit: 150, completedReferrals: 6 }
