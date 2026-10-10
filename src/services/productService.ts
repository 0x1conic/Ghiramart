import { useEffect, useSyncExternalStore } from 'react'
import { products as fixtures } from '../data/mockData'
import type { Product } from '../types'
import { categoryService } from './categoryService'
import { isSafeImageUrl, safeRoutePart } from './safeContent'
import { apiRequest, getAccessToken } from './api'
import type { ApiPage, ApiProduct } from './apiContracts'

export type ProductInput = Omit<Product, 'id' | 'slug' | 'status'>
const key = 'griha-mart:products:v1'
const listeners = new Set<() => void>()
const seeds: Product[] = fixtures.map(product => ({ ...product, sku: product.id.toUpperCase(), publication: 'published', lowStockThreshold: 8 }))
type Snapshot = { products: Product[]; error: string }
export const validProductImage = isSafeImageUrl
function validate(input: ProductInput) {
  if (!input.name?.trim() || !input.unit?.trim() || !input.sku?.trim()) throw new Error('Product name, SKU and pack size are required.')
  if (input.name.length > 100 || input.sku.length > 50 || input.unit.length > 40) throw new Error('Keep the name under 100, SKU under 50 and pack size under 40 characters.')
  if (!categoryService.list().some(category => category.id === input.categoryId)) throw new Error('Choose a category.')
  if (!Number.isFinite(input.price) || input.price <= 0) throw new Error('Price must be greater than zero.')
  if (input.salePrice !== undefined && (!Number.isFinite(input.salePrice) || input.salePrice <= 0 || input.salePrice >= input.price)) throw new Error('Sale price must be greater than zero and below the regular price.')
  if (!Number.isInteger(input.stock) || input.stock < 0) throw new Error('Stock must be a whole number of zero or more.')
  if (!Number.isInteger(input.lowStockThreshold) || input.lowStockThreshold! < 0) throw new Error('Low-stock alert must be a whole number of zero or more.')
  if (!['published', 'draft', 'archived'].includes(input.publication || '')) throw new Error('Choose a publication state.')
  if (!['mint', 'coral', 'amber', 'blue', 'cream', 'pink'].includes(input.accent)) throw new Error('Choose a card colour.')
  if (!validProductImage(input.image)) throw new Error('Choose a library image or enter a valid HTTP(S) image URL.')
  if (input.images !== undefined && (!Array.isArray(input.images) || !input.images.length || input.images.length > 8 || input.images.some(image => !validProductImage(image)))) throw new Error('Add between 1 and 8 valid product images.')
}
function read(): Snapshot {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { products: seeds, error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('Invalid catalog')
    for (const product of parsed) {
      validate(product)
      if (!safeRoutePart(product.id) || !safeRoutePart(product.slug) || typeof product.description !== 'string' || typeof product.originNote !== 'string' || typeof product.shortName !== 'string' || !['live', 'low-stock', 'out-of-stock'].includes(product.status)) throw new Error('Invalid product')
      const seedGallery = seeds.find(seed => seed.id === product.id)?.images
      product.images = product.images?.length ? product.images : seedGallery?.length ? [...seedGallery] : [product.image]
      product.image = product.images[0]
    }
    return { products: parsed, error: '' }
  } catch { return { products: [], error: 'We couldn’t load the catalog. Your saved products have not been changed. Check browser storage and try again.' } }
}
let snapshot = read()
let remoteRequested = false
function publish(next: Snapshot) { snapshot = next; listeners.forEach(listener => listener()) }
function latest() { const current = read(); if (current.error) { publish(current); throw new Error(current.error) }; return current.products }
function commit(products: Product[]) {
  try { localStorage.setItem(key, JSON.stringify(products)) }
  catch { throw new Error('Could not save the product. Allow browser storage or free some space, then retry.') }
  publish({ products, error: '' })
}
window.addEventListener('storage', event => { if (event.key === key || event.key === null) publish(read()) })

function productImages(value: string, name: string) {
  let candidates: string[] = []
  try {
    const parsed: unknown = JSON.parse(value)
    if (Array.isArray(parsed)) candidates = parsed.map(String)
    else if (typeof parsed === 'string') candidates = [parsed]
  } catch { candidates = value.split(',').map(item => item.trim()) }
  candidates = candidates.filter(validProductImage)
  if (!candidates.length) {
    const fixture = fixtures.find(item => item.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(item.shortName.toLowerCase()))
    if (fixture) candidates = fixture.images?.length ? fixture.images : [fixture.image]
  }
  return candidates.length ? candidates : ['/assets/brand/griha-mart-logo.png']
}

export function mapApiProduct(item: ApiProduct): Product {
  const images = productImages(item.image_urls, item.name)
  const category = categoryService.list().find(value => value.name.toLowerCase() === item.category.toLowerCase())
  const stock = Math.max(0, item.stock_quantity)
  const price = Number(item.price)
  const salePrice = item.discounted_price === null ? undefined : Number(item.discounted_price)
  const accents: Product['accent'][] = ['mint', 'coral', 'amber', 'blue', 'cream', 'pink']
  return { id: String(item.id), apiId: item.id, brand: item.brand, sku: `API-${item.id}`, publication: 'published', lowStockThreshold: 8, featured: false, name: item.name, shortName: item.name, slug: `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product'}-${item.id}`, categoryId: category?.id || item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description: item.description, originNote: item.brand, unit: item.brand, price: Number.isFinite(price) ? price : 0, salePrice: salePrice !== undefined && Number.isFinite(salePrice) ? salePrice : undefined, stock, status: stock === 0 ? 'out-of-stock' : stock <= 8 ? 'low-stock' : 'live', image: images[0], images, accent: accents[item.id % accents.length] }
}

async function imageFile(value: string, index: number) {
  if (!value.startsWith('data:image/')) return undefined
  const response = await fetch(value)
  const blob = await response.blob()
  return new File([blob], `product-${index}.${blob.type.split('/')[1] || 'webp'}`, { type: blob.type })
}

/** Product repository with a local fallback for offline browsing and draft-only admin work. */
export const productService = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
  getSnapshot: () => snapshot,
  async list(includeUnpublished = false) { return latest().filter(product => includeUnpublished || product.publication === 'published') },
  async get(id: string) {
    const local = latest().find(product => product.id === id || product.slug === id)
    if (local || !/^\d+$/.test(id)) return local
    try { return mapApiProduct(await apiRequest<ApiProduct>(`/products/${id}`)) } catch { return undefined }
  },
  async search(query: string) {
    const q = query.trim()
    if (!q) return latest().filter(product => product.publication === 'published')
    try { return (await apiRequest<ApiPage<ApiProduct>>(`/products/search?q=${encodeURIComponent(q)}&page=1&size=100`)).items.map(mapApiProduct) }
    catch { return latest().filter(product => `${product.name} ${product.shortName} ${product.brand || ''}`.toLowerCase().includes(q.toLowerCase())) }
  },
  async refresh(force = false) {
    if (remoteRequested && !force) return snapshot.products
    remoteRequested = true
    try {
      const page = await apiRequest<ApiPage<ApiProduct>>('/products?page=1&size=100')
      const remote = page.items.map(mapApiProduct)
      publish({ products: remote, error: '' })
      return remote
    } catch { return snapshot.products }
  },
  async save(input: ProductInput, id?: string): Promise<Product> {
    validate(input)
    const products = latest()
    const existing = id ? products.find(product => product.id === id) : undefined
    if (id && !existing) throw new Error('Product no longer exists.')
    if (products.some(product => product.id !== id && product.sku?.toLowerCase() === input.sku!.trim().toLowerCase())) throw new Error('This SKU is already used by another product.')
    const suffix = crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
    const gallery = input.images?.length ? [...input.images] : [input.image]
    const product: Product = {
      ...input, image: gallery[0], images: gallery, name: input.name.trim(), sku: input.sku!.trim(), unit: input.unit.trim(),
      id: existing?.id ?? 'product-' + Date.now().toString(36) + '-' + suffix,
      slug: existing?.slug ?? (input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'grocery') + '-' + suffix,
      status: input.stock === 0 ? 'out-of-stock' : input.stock <= (input.lowStockThreshold ?? 8) ? 'low-stock' : 'live',
    }
    const adminToken = getAccessToken('admin')
    if (adminToken && input.publication === 'archived' && id && /^\d+$/.test(id)) {
      await apiRequest<void>(`/products/${id}`, { method: 'DELETE' }, 'admin')
      commit(products.filter(item => item.id !== id)); return product
    }
    if (adminToken && input.publication === 'published') {
      const body = new FormData()
      body.set('name', input.name.trim()); body.set('brand', input.brand?.trim() || input.originNote.trim() || 'Griha Mart')
      body.set('category', categoryService.list().find(category => category.id === input.categoryId)?.name || input.categoryId)
      body.set('description', input.description); body.set('price', String(input.price)); body.set('stock_quantity', String(input.stock))
      if (input.salePrice !== undefined) body.set('discounted_price', String(input.salePrice))
      const files = (await Promise.all(gallery.map(imageFile))).filter((file): file is File => Boolean(file))
      files.forEach(file => body.append('file', file))
      const editingRemote = Boolean(id && /^\d+$/.test(id))
      const saved = await apiRequest<ApiProduct>(editingRemote ? `/products/${id}` : '/products', { method: editingRemote ? 'PATCH' : 'POST', body }, 'admin')
      const mapped = mapApiProduct(saved)
      publish({ products: editingRemote ? products.map(item => item.id === id ? mapped : item) : [mapped, ...products], error: '' })
      return mapped
    }
    commit(existing ? products.map(item => item.id === id ? product : item) : [product, ...products])
    return product
  },
}
export function useCatalog() {
  const state = useSyncExternalStore(productService.subscribe, productService.getSnapshot)
  useEffect(() => { void productService.refresh() }, [])
  return { ...state, published: state.products.filter(product => product.publication === 'published') }
}
