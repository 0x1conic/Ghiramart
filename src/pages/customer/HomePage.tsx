import { useCatalog } from '../../services/productService'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CommerceFeatures } from '../../components/commerce/CommerceFeatures'
import { HeroProductStage } from '../../components/commerce/HeroProductStage'
import { ProductCard } from '../../components/commerce/ProductCard'
import { BrandMembership } from '../../components/commerce/BrandMembership'
import { PageTransition, staggerContainer } from '../../components/motion/MotionPrimitives'
import { featuredProducts as sampleFeatured, heroProducts } from '../../data/mockData'
import { StoryCollections } from '../../components/commerce/StoryCollections'
import './HomePage.css'

export function HomePage() {
  const { published: products } = useCatalog()
  const featuredProducts = products.filter(product => product.featured || sampleFeatured.some(sample => sample.id === product.id))
  const heroPicks = (featuredProducts.length ? featuredProducts : products).slice(0, 2)
  return (
    <PageTransition className="bg-[var(--cream)]">
      <section className="page-shell home-arrival flex min-h-svh flex-col bg-[var(--cream)] text-[var(--ink)]">
        <div className="content-wrap relative home-edition"><span>Your neighbourhood. Your market.</span></div>
        <div className="content-wrap home-hero-grid grid flex-1 items-center gap-8 py-8 md:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)] md:py-10 lg:gap-12">
          <HeroProductStage products={heroProducts} />

          <motion.section className="home-product-showcase" variants={staggerContainer} initial="hidden" animate="visible" aria-labelledby="home-picks-title">
            <div className="home-product-showcase-heading"><div><span className="eyebrow text-[var(--green)]">Fresh from Pokhara</span><h1 id="home-picks-title">Today’s pantry picks.</h1></div><Link to="/market">See all {products.length} <ArrowRight size={16} /></Link></div>
            <div className="home-product-grid">{heroPicks.map(product => <ProductCard key={product.id} product={product} compact />)}</div>
          </motion.section>
        </div>
      </section>

      <StoryCollections />

      <section className="content-wrap pb-16 md:pb-24">
        <div className="flex items-end justify-between"><div><span className="eyebrow text-[var(--green)]">Popular right now</span><h2 className="section-title mt-3 uppercase">More for your basket.</h2><p className="mt-3 text-sm text-[var(--muted)]">Fresh staples, value pairs and family packs—ready to deliver.</p></div><Link to="/market" className="hidden text-sm font-bold text-[var(--blue)] sm:block">View all {products.length} products →</Link></div>
        <motion.div className="product-grid mt-8" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .08 }}>{featuredProducts.map((product) => <ProductCard key={product.id} product={product} compact />)}</motion.div>
        <Link to="/market" className="pill-button btn-ink mt-7 w-full sm:hidden">View all {products.length} products <ArrowRight size={16} /></Link>
      </section>

      <BrandMembership />

      <section className="content-wrap pb-16 md:pb-24"><CommerceFeatures /></section>
    </PageTransition>
  )
}
