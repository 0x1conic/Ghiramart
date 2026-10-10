import { motion } from 'framer-motion'
import { ArrowUpRight, Clock3, Mail, MapPin, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandMark } from '../common/BrandMark'
import { staggerContainer } from '../motion/MotionPrimitives'

const promises = [
  { icon: MapPin, title: 'Pokhara-wide', detail: 'Local routes, every day' },
  { icon: Clock3, title: 'Fresh in 30', detail: 'Fast delivery slots' },
  { icon: ShieldCheck, title: 'Quality checked', detail: 'Selected before packing' },
  { icon: Truck, title: 'NPR 80 delivery', detail: 'Simple, clear pricing' },
]

const promiseItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: .42 } },
}

export function SiteFooter() {
  return <footer className="bg-[var(--forest)] text-white">
    <div className="content-wrap pb-10 pt-12 md:pt-16">
      <div className="footer-brand-band"><BrandMark light /><p lang="ne">घरका लागि सबै कुरा</p></div>
      <div className="grid gap-10 md:grid-cols-[1.2fr_.8fr_.8fr] lg:grid-cols-[1.3fr_.7fr_.7fr_1fr]">
        <div><p className="max-w-xs text-base leading-relaxed text-white/80">A familiar face.<br />A well-stocked pantry.<br /><span className="font-brand font-bold text-[#ffb15c]">Your very own neighbourhood mart.</span></p><p className="mt-5 flex items-center gap-2 text-xs text-white/70"><MapPin size={14} /> Pokhara, Nepal</p></div>
        <div><h2 className="eyebrow text-[#ffb15c]">For your home</h2><div className="mt-5 grid gap-3 text-sm text-white/80"><Link to="/market">All groceries</Link><Link to="/market?category=rice-dal">Rice & dal</Link><Link to="/market?category=fresh">Fresh produce</Link><Link to="/cart">Your basket</Link></div></div>
        <div><h2 className="eyebrow text-[#ffb15c]">Here for you</h2><div className="mt-5 grid gap-3 text-sm text-white/80"><Link to="/member/orders">Track your order</Link><Link to="/account">Your account</Link><Link to="/rewards">Rewards & referrals</Link><a href="mailto:care@grihamart.com">Contact Griha Care</a></div></div>
        <div className="rounded-2xl border border-white/20 p-5"><span className="eyebrow text-[#ffb15c]">NEARBY, EVERY DAY</span><p className="mt-4 font-brand text-xl font-bold leading-snug">Good things are<br />just a basket away.</p><Link to="/market" className="mt-5 inline-flex items-center gap-3 text-sm font-bold text-white">Visit the market <ArrowUpRight size={18} /></Link></div>
      </div>
      <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 Griha Mart · गृह मार्ट</p><a href="mailto:care@grihamart.com" className="inline-flex items-center gap-2"><Mail size={14} /> care@grihamart.com</a></div>
    </div>
    <div className="footer-signature" aria-label="Griha Mart promise">
      <p><span lang="ne">गृह मार्ट</span><span aria-hidden="true">✳</span><span lang="ne">घरका लागि सबै कुरा</span><span aria-hidden="true">✳</span><span>Your neighbourhood. Your home.</span></p>
    </div>
    <div className="bg-white pb-24 text-[var(--ink)] md:pb-0">
      <motion.div className="footer-trust-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .35 }} variants={staggerContainer}>
        {promises.map(({ icon: Icon, title, detail }) => <motion.div variants={promiseItem} key={title} className="footer-trust-item"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--mint)] text-[var(--green)]"><Icon size={18} aria-hidden="true" /></span><div><p className="text-sm font-extrabold">{title}</p><p className="mt-1 text-[11px] text-[var(--muted)]">{detail}</p></div></motion.div>)}
      </motion.div>
    </div>
  </footer>
}
