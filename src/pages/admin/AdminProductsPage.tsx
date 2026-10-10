import { AnimatePresence, motion } from 'framer-motion'
import { FolderPlus, Plus, Search, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { useCatalog } from '../../services/productService'
import { categoryService, useCategories } from '../../services/categoryService'
import './ProductStudio.css'

const categoryColours = ['mint', 'coral', 'amber', 'blue', 'cream', 'pink']
type ProductFilter = 'all' | 'published' | 'draft' | 'archived' | 'out-of-stock'
const productFilters: { value: ProductFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
  { value: 'out-of-stock', label: 'Out of stock' },
]

function CategoryCreator({ close }: { close: () => void }) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    setPending(true); setError('')
    try {
      await categoryService.create({ name: String(values.get('name') || ''), mood: String(values.get('mood') || ''), accent: String(values.get('accent') || 'mint') })
      form.reset(); close()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not create the category.') }
    finally { setPending(false) }
  }
  return <motion.section className="category-creator" initial={{ opacity: 0, y: -14, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}>
    <div className="category-creator-heading"><div><span className="eyebrow text-[var(--green)]">New collection</span><h2>Create a category</h2><p>Organise products and give shoppers a quick way to explore them.</p></div><button type="button" onClick={close} aria-label="Close category form"><X size={18} /></button></div>
    <form onSubmit={submit} className="category-creator-form">
      <label><span className="label">Category name</span><input autoFocus required maxLength={60} className="field" name="name" placeholder="e.g. Snacks" /></label>
      <label><span className="label">Shopping label</span><input required maxLength={80} className="field" name="mood" placeholder="e.g. Tea-time favourites" /></label>
      <label><span className="label">Colour</span><select className="field capitalize" name="accent" defaultValue="mint">{categoryColours.map(colour => <option key={colour}>{colour}</option>)}</select></label>
      <button disabled={pending} className="pill-button btn-ink"><FolderPlus size={16} /> {pending ? 'Creating…' : 'Create category'}</button>
    </form>{error && <p role="alert" className="studio-error">{error}</p>}
  </motion.section>
}

export function AdminProductsPage() {
  const { products, error } = useCatalog()
  const { categories, error: categoryError } = useCategories()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ProductFilter>('all')
  const [addingCategory, setAddingCategory] = useState(false)
  const filtered = products.filter(product => {
    const matchesFilter = filter === 'all'
      || (filter === 'out-of-stock' ? product.stock === 0 : product.publication === filter)
    const categoryName = categories.find(category => category.id === product.categoryId)?.name ?? ''
    return matchesFilter && `${product.name} ${product.sku ?? ''} ${categoryName}`.toLowerCase().includes(query.toLowerCase())
  })
  return <main className="inventory-page min-h-svh pb-10"><AdminPageHeader section="Products" title="A well-stocked little world." subtitle="Your shelves, your selection. Create, preview and publish every new favourite." action={<div className="flex flex-wrap gap-2"><button className="pill-button bg-white" onClick={() => setAddingCategory(value => !value)}><FolderPlus size={16} /> Add category</button><Link className="pill-button btn-ink" to="/admin/products/new"><Plus size={16} /> Add product</Link></div>} /><div className="inventory-content"><AnimatePresence>{addingCategory && <CategoryCreator close={() => setAddingCategory(false)} />}</AnimatePresence><div className="inventory-metrics">{[['All products', products.length], ['Published', products.filter(item => item.publication === 'published').length], ['Drafts', products.filter(item => item.publication === 'draft').length], ['Categories', categories.length]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>{(error || categoryError) && <p role="alert" className="studio-error">{error || categoryError}</p>}<label className="relative mt-6 block"><Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} /><span className="sr-only">Search inventory</span><input className="field pl-12" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, SKU or category" /></label><div className="inventory-tabs" aria-label="Product inventory filter">{productFilters.map(({ value, label }) => <button key={value} aria-pressed={filter === value} className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div><div className="inventory-list">{filtered.map(product => <article key={product.id} className="inventory-row" data-product-id={product.id}><img src={product.image} alt="" /><div className="inventory-row-title"><h2>{product.name}</h2><p>{product.sku} · {product.unit}</p><span>{categories.find(category => category.id === product.categoryId)?.name}</span></div><div><strong>NPR {(product.salePrice ?? product.price).toLocaleString()}</strong><p className={product.stock === 0 ? 'inventory-stock-out' : ''}>{product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}</p></div><span className={`inventory-status inventory-status-${product.publication}`}>{product.publication}</span><Link to={`/admin/products/${product.id}/edit`} aria-label={`Edit ${product.name}`}>Edit →</Link></article>)}{!filtered.length && !error && <div className="surface-card"><h2 className="font-brand text-xl font-bold">No products here yet.</h2><p className="mt-3 text-sm">Try another filter or create your next pantry favourite.</p><Link className="pill-button btn-ink mt-5" to="/admin/products/new">Add product</Link></div>}</div></div></main>
}
