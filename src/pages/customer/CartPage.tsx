import { useCatalog } from '../../services/productService'
import { ArrowRight, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CartLine } from '../../components/commerce/CartLine'
import { OrderSummary } from '../../components/commerce/OrderSummary'
import { StatePanel } from '../../components/common/StatePanel'
import { PageTransition, Reveal } from '../../components/motion/MotionPrimitives'
import { useCart } from '../../context/CartContext'
import { CommerceFeatures } from '../../components/commerce/CommerceFeatures'
import { ProductCard } from '../../components/commerce/ProductCard'
import { motion } from 'framer-motion'
import { staggerContainer } from '../../components/motion/MotionPrimitives'

export function CartPage() {
  const { published: products } = useCatalog()
  const { cart, clearCart } = useCart()
  return (
    <PageTransition className="cart-page page-shell bg-[var(--paper)]">
      <div className="content-wrap py-7 md:py-12">
        <h1 className="sr-only">Your basket</h1>
        {cart.items.length > 0 && <div className="mb-5 flex justify-end"><button onClick={clearCart} className="pill-button bg-black/8"><Trash2 size={15} /> Clear basket</button></div>}
        {cart.items.length === 0 ? <StatePanel kind="empty" eyebrow="Empty cart" title="Your basket is ready for its first hero." description="The market is stocked with familiar favourites." action={<Link className="pill-button btn-lime" to="/market">Return to market <ArrowRight size={15} /></Link>} /> : <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
          <Reveal className="space-y-4">{cart.items.map((item) => <CartLine key={item.product.id} item={item} />)}</Reveal>
          <Reveal from="right" delay={.12}><OrderSummary cart={cart} /></Reveal>
        </div>}
        <div className="mt-14"><CommerceFeatures /></div>
        <section className="mt-14"><div className="flex items-end justify-between"><div><span className="eyebrow text-[var(--green)]">One more thing?</span><h2 className="section-title mt-3 text-4xl uppercase">Easy additions.</h2></div><Link to="/market" className="text-sm font-bold text-[var(--blue)]">Keep shopping →</Link></div><motion.div className="product-grid mt-7" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>{products.slice(1,5).map((product) => <ProductCard key={product.id} product={product} compact />)}</motion.div></section>
      </div>
    </PageTransition>
  )
}
