import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRef } from 'react'
import type { Product } from '../../types'
import { ProductArt } from '../common/ProductArt'
import { DepthSurface } from '../motion/DepthSurface'

function SceneProduct({ product, index, playing, entered }: { product: Product; index: number; playing: boolean; entered: boolean }) {
  const reduced = useReducedMotion()
  const drift = playing && (index === 0 || index === 3)
  return <motion.div className={`scene-product scene-product-${index}`}
    initial={reduced ? false : { opacity: 0, y: 90 + index * 12, rotate: index % 2 ? 22 : -18, scale: .65 }}
    animate={entered || reduced ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : undefined}
    transition={{ duration: 1.05, delay: .28 + index * .09, ease: [.16, 1, .3, 1] }}>
    <motion.div className="scene-product-drift" animate={drift ? { y: [0, -12, 0], rotate: [0, index === 0 ? -2 : 2, 0] } : { y: 0, rotate: 0 }}
      transition={drift ? { duration: 2.2, repeat: 1, ease: 'easeInOut' } : { duration: .3 }}>
      <Link to={`/products/${product.slug}`} className="block rounded-2xl transition-[filter] hover:brightness-110" aria-label={`Shop ${product.name}`}><ProductArt product={product} /></Link>
    </motion.div>
  </motion.div>
}

export function HeroProductStage({ products }: { products: Product[] }) {
  const reduced = useReducedMotion()
  const scene = useRef<HTMLDivElement>(null)
  const inView = useInView(scene, { amount: .15 })
  const entered = useInView(scene, { amount: .15, once: true })
  const { scrollYProgress } = useScroll({ target: scene, offset: ['start end', 'end start'] })
  const scrollY = useTransform(scrollYProgress, [0, .5, 1], [24, 0, -24])
  const orbitRotate = useTransform(scrollYProgress, [0, 1], [-38, 12])
  const discRotate = useTransform(scrollYProgress, [0, 1], [-8, 8])
  const playing = !reduced && inView
  return <div ref={scene}>
    <DepthSurface strength={5}>
      <motion.div className={`hero-product-stage market-scene ${playing ? 'scene-in-view' : ''}`} style={{ y: reduced ? 0 : scrollY }}>
        <motion.div aria-hidden="true" className="market-scene-disc" style={{ rotate: reduced ? 0 : discRotate }} initial={reduced ? false : { scale: .65, opacity: .2 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.3, ease: [.16, 1, .3, 1] }} />
        <motion.div className="market-scene-orbit" aria-hidden="true" style={{ rotate: reduced ? -25 : orbitRotate, scaleY: .87 }}><span className="orbit-glint" /></motion.div>
        <div className="scene-ripple scene-ripple-one" aria-hidden="true" /><div className="scene-ripple scene-ripple-two" aria-hidden="true" />
        <div className="market-scene-word" aria-hidden="true">FRESH</div>
        <motion.div className="market-scene-stamp" initial={reduced ? false : { scale: 2, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: 12 }} transition={{ delay: .85, duration: .6, type: 'spring', bounce: .35 }}><strong>30</strong><span>min to home</span></motion.div>
        {products.slice(0, 7).map((product, index) => <SceneProduct key={product.id} product={product} index={index} playing={playing} entered={entered} />)}
        <motion.div className="market-scene-receipt" initial={reduced ? false : { y: 40, rotate: -16, opacity: 0 }} animate={{ y: 0, rotate: -6, opacity: 1 }} transition={{ delay: .9, duration: .7 }}>
          <span className="eyebrow text-[var(--green)]">THE DAILY GRIHA</span>
          <p className="mt-2 font-brand text-lg font-bold leading-tight">Good things.<br />At your doorstep.</p>
          <Link to="/market" className="mt-3 flex items-center justify-between border-t border-dashed border-black/20 pt-3 text-[10px] font-bold uppercase">Shop the fresh edit <ArrowUpRight size={16} /></Link>
        </motion.div>
        <span className="scene-caption">Picked with care. Packed for you.</span>
      </motion.div>
    </DepthSurface>
  </div>
}
