import { useCatalog } from '../../services/productService'
import { ArrowLeft, ArrowRight, BellRing, CheckCircle2, ChevronLeft, ChevronRight, Leaf, Star, Truck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../../context/CartContext'
import { PageTransition, Reveal } from '../../components/motion/MotionPrimitives'
import { staggerContainer } from '../../components/motion/MotionPrimitives'
import { QuantityControl } from '../../components/common/QuantityControl'
import { ProductCard } from '../../components/commerce/ProductCard'
import { CommerceFeatures } from '../../components/commerce/CommerceFeatures'
import { safeImageUrl } from '../../services/safeContent'
import './ProductPage.css'

export function ProductPage() {
  const { published: products } = useCatalog()
  const { productId } = useParams()
  const product = products.find((item) => item.id === productId || item.slug === productId)
  const { addItem } = useCart()
  const soldOut = product?.status === 'out-of-stock'
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const gallery = product ? (product.images?.length ? product.images : [product.image]) : []
  useEffect(() => setSelectedImage(0), [product?.id])
  if (!product) return <PageTransition className="page-shell"><div className="content-wrap py-10"><h1 className="section-title">This product is unavailable.</h1><Link className="pill-button btn-ink mt-5" to="/market">Back to market</Link></div></PageTransition>
  return (
    <PageTransition className="product-page bg-[var(--cream)]">
    <section className="page-shell min-h-svh bg-[var(--green)] text-white">
      <div className="content-wrap grid min-h-[calc(100svh-108px)] items-center gap-8 py-8 md:grid-cols-2">
        <Reveal from="left" className="relative flex min-h-[320px] items-center justify-center md:min-h-[640px]">
          <Link to="/market" className="absolute left-0 top-0 inline-flex items-center gap-2 text-xs font-bold uppercase text-[var(--amber)]"><ArrowLeft size={16} /> Pantry / 01</Link>
          <div className="product-gallery-stage" aria-label={`${product.name} image gallery`}>
            <div className="product-gallery-main">
              <AnimatePresence mode="wait" initial={false}><motion.img key={gallery[selectedImage]} src={safeImageUrl(gallery[selectedImage])} alt={`${product.name}, view ${selectedImage + 1} of ${gallery.length}`} initial={{ opacity: 0, x: 24, scale: .96 }} animate={{ opacity: 1, x: 0, y: [0, -7, 0], scale: 1 }} exit={{ opacity: 0, x: -24, scale: .96 }} transition={{ opacity: { duration: .22 }, x: { duration: .28 }, scale: { duration: .28 }, y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' } }} /></AnimatePresence>
              {gallery.length > 1 && <><button type="button" className="product-gallery-arrow is-left" aria-label="Previous product image" onClick={() => setSelectedImage(index => (index - 1 + gallery.length) % gallery.length)}><ChevronLeft /></button><button type="button" className="product-gallery-arrow is-right" aria-label="Next product image" onClick={() => setSelectedImage(index => (index + 1) % gallery.length)}><ChevronRight /></button></>}
            </div>
            {gallery.length > 1 && <div className="product-gallery-thumbs" role="list" aria-label="Choose product image">{gallery.map((image, index) => <button type="button" role="listitem" key={`${index}-${image.slice(-24)}`} className={selectedImage === index ? 'is-active' : ''} aria-label={`Show product image ${index + 1}`} aria-current={selectedImage === index ? 'true' : undefined} onClick={() => setSelectedImage(index)}><img src={safeImageUrl(image)} alt="" /></button>)}</div>}
          </div>
        </Reveal>
        <Reveal from="right" delay={.1} className="max-w-xl">
          <span className="eyebrow text-[var(--lime)]">Pantry / Chapter 01</span>
          <h1 className="display-title mt-5 text-[4.5rem] md:text-[5.6rem]">{product.name}.</h1>
          <div className="mt-4 flex items-center gap-3 text-sm"><span className="flex items-center gap-1 font-bold text-[var(--lime)]"><Star size={15} fill="currentColor" /> 4.9</span><span className="text-white/50">124 Pokhara homes</span></div>
          <p className="mt-3 max-w-lg text-lg text-white/72">{product.description}</p>
          <div className="mt-9 flex flex-wrap items-end gap-3"><p className="font-brand text-4xl font-bold text-[var(--amber)]">NPR {(product.salePrice ?? product.price).toLocaleString()}</p>{product.salePrice && <p className="pb-1 text-sm text-white/55 line-through">NPR {product.price.toLocaleString()}</p>}</div>
          {!soldOut && <div className="mt-7 flex flex-wrap items-center gap-4"><QuantityControl quantity={quantity} onChange={(value) => setQuantity(Math.min(product.stock, Math.max(1, value)))} /><span className="text-xs text-white/55">{product.stock} ready for delivery</span></div>}
          <button className={`pill-button mt-5 w-full ${soldOut ? 'bg-[var(--pink)] text-[var(--ink)]' : 'btn-amber'}`} onClick={() => { if (soldOut) addItem(product); else for (let index = 0; index < quantity; index += 1) addItem(product) }}>{soldOut ? <><BellRing size={16} /> Notify me</> : <>Add {quantity} to pantry <ArrowRight size={16} /></>}</button>
          <div className="mt-8 rounded-3xl bg-[var(--black)] p-6"><span className="eyebrow text-white/60">Origin note</span><p className="mt-2 text-sm">{product.originNote}</p></div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase text-white/65"><span className="rounded-2xl border border-white/10 p-3"><Truck className="mx-auto mb-2" size={17} />30 min</span><span className="rounded-2xl border border-white/10 p-3"><Leaf className="mx-auto mb-2" size={17} />Fresh pick</span><span className="rounded-2xl border border-white/10 p-3"><CheckCircle2 className="mx-auto mb-2" size={17} />Checked</span></div>
        </Reveal>
      </div>
    </section>
    <section className="content-wrap grid gap-6 py-16 md:grid-cols-3 md:py-24"><article className="surface-card md:col-span-2"><span className="eyebrow text-[var(--green)]">The product story</span><h2 className="section-title mt-4 text-3xl uppercase">Made for everyday<br />Nepali kitchens.</h2><p className="mt-5 max-w-2xl leading-relaxed text-[var(--muted)]">{product.description} Every batch is selected for flavour, reliable quality and the meals that bring a home together.</p><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Pack',product.unit],['Stock',String(product.stock)],['Delivery','Today'],['Points',String(product.salePrice ?? product.price)]].map(([label,value]) => <div key={label} className="rounded-2xl bg-[#fff7e6] p-4"><span className="eyebrow text-[var(--muted)]">{label}</span><p className="mt-2 font-brand text-lg font-bold">{value}</p></div>)}</div></article><aside className="rounded-[28px] bg-[var(--amber)] p-7"><span className="eyebrow">Griha promise</span><h3 className="font-brand mt-5 text-2xl font-bold">Love it at the table—or tell us.</h3><p className="mt-3 text-sm leading-relaxed">Griha Care will make it right, without making the conversation complicated.</p><Link to="/states" className="mt-7 inline-block text-xs font-extrabold uppercase">Learn about our promise →</Link></aside></section>
    <section className="content-wrap pb-16 md:pb-24"><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="eyebrow text-[var(--green)]">Complete the pantry</span><h2 className="section-title mt-3 text-4xl uppercase">Good together.</h2></div><Link to="/market" className="text-sm font-bold text-[var(--blue)]">View all →</Link></div><motion.div className="product-grid mt-8" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .12 }}>{products.filter((item) => item.id !== product.id).slice(0,4).map((item) => <ProductCard key={item.id} product={item} compact />)}</motion.div><div className="mt-12"><CommerceFeatures /></div></section>
    </PageTransition>
  )
}
