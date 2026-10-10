import { motion, useReducedMotion } from 'framer-motion'
import { Bell, Check, Heart, ShoppingBag, Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types'
import { ProductArt } from '../common/ProductArt'
import { staggerItem } from '../motion/MotionPrimitives'
import { useCoarsePointer } from '../motion/useCoarsePointer'
import './ProductCard.css'

const backgrounds: Record<Product['accent'], string> = {
  mint: 'bg-[#e7f2dd]', coral: 'bg-[#ffe8d5]', amber: 'bg-[#fff0d3]', blue: 'bg-[#e5efdc]', cream: 'bg-[#f6f5ef]', pink: 'bg-[#ffeddf]',
}
export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addItem } = useCart()
  const soldOut = product.status === 'out-of-stock'
  const [saved, setSaved] = useState(false)
  const [added, setAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const reduced = useReducedMotion()
  const coarse = useCoarsePointer()
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const add = () => {
    addItem(product)
    if (soldOut) return
    setAdded(true); window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1100)
  }
  return <motion.article layout variants={staggerItem} exit={{ opacity: 0 }} whileHover={reduced ? undefined : { y: -4 }} whileTap={reduced || !coarse ? undefined : { y: -4, scale: .985 }} transition={{ type: 'spring', stiffness: 330, damping: 24 }} className="grocery-card" data-compact={compact}>
    <div className={`grocery-card-media ${backgrounds[product.accent]}`}>
      <div className="grocery-card-toolbar"><div className="grocery-card-badges"><span className="bg-white/90">{product.unit}</span>{product.salePrice !== undefined && <span className="bg-[var(--lime)]">Save NPR {(product.price - product.salePrice).toLocaleString()}</span>}{product.status === 'low-stock' && <span className="bg-[var(--pink)]">Only {product.stock} left</span>}{soldOut && <span className="bg-[var(--ink)] text-white">Out of stock</span>}</div>
      <button type="button" onClick={() => setSaved(value => !value)} className={`grocery-favourite ${saved ? 'bg-[var(--pink)]' : 'bg-white/90'}`} aria-label={saved ? `Remove ${product.name} from favourites` : `Save ${product.name}`} aria-pressed={saved}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button></div>
      <Link className="grocery-card-art" to={`/products/${product.slug}`} aria-label={`View ${product.name}`}><ProductArt product={product} /></Link>
    </div>
    <div className="grocery-card-details"><div className="grocery-card-meta"><span>POKHARA PANTRY</span><span className="grocery-card-rating"><Star size={12} fill="currentColor" /> 4.9</span></div><Link to={`/products/${product.slug}`} className="grocery-card-name"><h2>{product.name}</h2><p>{product.unit} · {soldOut ? 'Currently unavailable' : 'Ready to book'}</p></Link><div className="grocery-card-footer"><p className="grocery-card-price">NPR {(product.salePrice ?? product.price).toLocaleString()}{product.salePrice !== undefined && <del>NPR {product.price.toLocaleString()}</del>}</p><motion.button type="button" whileTap={reduced ? undefined : { scale: .96 }} onClick={add} className={`grocery-card-add ${soldOut ? 'bg-[var(--pink)]' : 'bg-[var(--ink)] text-white'}`} aria-label={soldOut ? `Notify me when ${product.name} returns` : `Add ${product.name} to basket`}>{soldOut ? <><Bell size={16} /> Notify me</> : added ? <><Check size={16} /> Added</> : <><ShoppingBag size={16} /> Add</>}</motion.button></div></div>
  </motion.article>
}
