import { useCatalog } from '../../services/productService'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCategories } from '../../services/categoryService'
import { ProductCard } from '../../components/commerce/ProductCard'
import { PageTransition, staggerContainer } from '../../components/motion/MotionPrimitives'
import { StatePanel } from '../../components/common/StatePanel'
import { CommerceFeatures } from '../../components/commerce/CommerceFeatures'

export function MarketPage() {
  const { published: products, error: catalogError } = useCatalog()
  const { categories, error: categoryError } = useCategories()
  const [sort, setSort] = useState('recommended')
  const [query, setQuery] = useState('')
  const [params, setParams] = useSearchParams()
  const selectedCategory = params.get('category')
  const category = categories.some((item) => item.id === selectedCategory) ? selectedCategory : 'all'
  const setCategory = (value: string) => setParams((current) => {
    const next = new URLSearchParams(current)
    if (value === 'all') next.delete('category')
    else next.set('category', value)
    return next
  })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtered = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.shortName}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (category === 'all' || product.categoryId === category)
  }).sort((a, b) => sort === 'price' ? (a.salePrice ?? a.price) - (b.salePrice ?? b.price) : 0), [query, category, sort, products])

  return (
    <PageTransition className="page-shell bg-[var(--paper)]">
      <div className="content-wrap py-5 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr] xl:grid-cols-[290px_1fr]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <span className="eyebrow text-[var(--green)]">The daily edit</span>
            <h1 className="display-title mt-4 text-[4.5rem] md:text-[5.4rem]">The market<br />is the story.</h1>
            <p className="mt-3 text-sm font-semibold text-[var(--green)]">Curated by season, neighbourhood and appetite.</p>
            <button className="pill-button btn-ink mt-6 w-full lg:hidden" onClick={() => setFiltersOpen((open) => !open)}><SlidersHorizontal size={16} /> Filters</button>
            <div className={`${filtersOpen ? 'block' : 'hidden'} mt-5 rounded-[28px] border border-black/6 bg-white p-6 shadow-[0_16px_45px_rgba(8,18,14,.06)] lg:block`}>
              <div className="mb-5 flex items-center justify-between"><span className="eyebrow text-[var(--green)]">Shop by mood</span><button className="lg:hidden" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={18} /></button></div>
              <div className="grid gap-2">
                <button className={`rounded-xl px-3 py-3 text-left text-xs font-semibold ${category === 'all' ? 'bg-[var(--ink)] text-white' : 'hover:bg-black/5'}`} onClick={() => setCategory('all')}>Everything</button>
                {categories.map((item) => <button key={item.id} className={`rounded-xl px-3 py-3 text-left text-xs font-semibold ${category === item.id ? 'bg-[var(--lime)] text-black' : 'hover:bg-black/5'}`} onClick={() => setCategory(item.id)}>{item.mood}</button>)}
              </div>
            </div>
          </aside>

          <section aria-label="Products">{(catalogError || categoryError) && <p role="alert" className="mb-5 text-red-700">{catalogError || categoryError}</p>}
            <label className="relative mb-7 block"><span className="sr-only">Search products</span><Search className="absolute left-5 top-1/2 -translate-y-1/2" size={19} /><input className="field bg-white pl-13" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rice, dal, oil, milk…" /></label>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-brand text-lg font-bold">Today’s market</p><p className="mt-1 text-xs text-[var(--muted)]">{filtered.length} products • selected for Pokhara</p></div><div className="flex gap-2 overflow-x-auto">{categories.slice(0,3).map((item) => <button key={item.id} onClick={() => setCategory(category === item.id ? 'all' : item.id)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === item.id ? 'bg-[var(--ink)] text-white' : 'bg-white'}`}>{item.name}</button>)}<label className="sr-only" htmlFor="sort-products">Sort products</label><select value={sort} onChange={event => setSort(event.target.value)} id="sort-products" className="rounded-full border-0 bg-white px-4 text-xs font-bold"><option value="recommended">Newest & recommended</option><option value="price">Price: low first</option></select></div></div>
            {filtered.length ? <motion.div layout className="product-grid catalog-grid" variants={staggerContainer} initial="hidden" animate="visible"><AnimatePresence mode="popLayout">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</AnimatePresence></motion.div> : <StatePanel kind="results" eyebrow="No results" title="Nothing matched that craving." description="Try a different ingredient or clear the active filters." action={<button className="text-sm font-bold text-[var(--blue)]" onClick={() => { setQuery(''); setCategory('all') }}>Clear filters →</button>} />}
          </section>
        </div>
        <div className="mt-12"><CommerceFeatures /></div>
      </div>
    </PageTransition>
  )
}
