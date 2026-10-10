import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../../data/mockData'
import { BrandMark } from '../common/BrandMark'
import { ProductArt } from '../common/ProductArt'
import { AuthMotionProvider, useFigmaAuthMotion } from './AuthMotion'
import './CinematicAuth.css'

function Grocery({ index, desktopId, mobileId, className, decorative = true }: { index: number; desktopId: string; mobileId?: string; className: string; decorative?: boolean }) {
  const animation = useFigmaAuthMotion(desktopId, mobileId, decorative)
  return <div className={`auth-grocery-position ${className}`}><motion.div {...animation}><ProductArt product={products[index]} /></motion.div></div>
}

function AuthScene({ register }: { register: boolean }) {
  const sun = useFigmaAuthMotion('83:38', '83:2', true)
  const orbit = useFigmaAuthMotion('83:39', '83:2', true)
  const promise = useFigmaAuthMotion('83:43')
  return <div className="auth-art auth-art-login" aria-label="Griha Mart member groceries">
    <div className="auth-sun-position"><motion.div {...sun} className="auth-sun"><img className="auth-desktop-sun" src="/assets/auth/member-sun.svg" alt="" /><img className="auth-mobile-sun" src="/assets/auth/mobile-member-orb.svg" alt="" /></motion.div></div>
    <div className="auth-orbit-position"><motion.img {...orbit} src="/assets/auth/member-orbit.svg" className="auth-orbit" alt="" /></div>
    <Grocery index={0} desktopId="83:40" mobileId="83:3" className="auth-rice" />
    <Grocery index={1} desktopId="83:41" className="auth-dal" />
    <Grocery index={3} desktopId="83:42" className="auth-tomatoes" />
    <motion.div {...promise} className="auth-promise"><strong>{register ? 'JOIN THE FAMILY' : 'MEMBERS GET MORE'}</strong><p>Faster checkout • live tracking<br />member-only market drops</p></motion.div>
  </div>
}

function AuthComposition({ register, children, onInteract }: { register: boolean; children: ReactNode; onInteract: () => void }) {
  const title = useFigmaAuthMotion(register ? '130:4' : '75:194', register ? '131:6' : '74:345')
  const subtitle = useFigmaAuthMotion('130:5')
  const form = useFigmaAuthMotion(register ? '130:8' : '75:195', register ? '131:7' : '74:346')
  const social = useFigmaAuthMotion('83:46')
  const benefits = useFigmaAuthMotion('83:4')
  return <div className="auth-composition">
    <section className="auth-story">
      <motion.h1 {...title} className="auth-headline">{register ? <>JOIN THE<br />GRIHA FAMILY.</> : <>WELCOME<br />BACK HOME.</>}</motion.h1>
      {register && <motion.p {...subtitle} className="auth-subtitle">Earn points, save addresses and make every grocery run faster.</motion.p>}
      <div className="auth-social"><motion.div {...social} className="auth-social-surface" /><p>★★★★★ &nbsp;4.9<br />Loved by 2,000+ homes</p></div>
      <AuthScene register={register} />
      <motion.p {...benefits} className="auth-mobile-benefits">FASTER CHECKOUT • LIVE TRACKING</motion.p>
    </section>
    <motion.section {...form} className="auth-form-panel" onFocusCapture={onInteract} aria-label={register ? 'Create membership' : 'Member access'}>{children}</motion.section>
  </div>
}

function AuthHeader({ register }: { register: boolean }) {
  const brand = useFigmaAuthMotion(register ? '130:3' : '75:193', register ? '130:3' : '74:344')
  const back = useFigmaAuthMotion(register ? '131:5' : '')
  return <header className="auth-brand-row"><motion.div {...brand}><BrandMark light /></motion.div><motion.div {...back}><Link to="/" className="auth-back"><ArrowLeft size={16} /> Back to market</Link></motion.div></header>
}

export function CinematicAuth({ children, register }: { children: ReactNode; register: boolean }) {
  const [interacting, setInteracting] = useState(false)
  return <AuthMotionProvider register={register} interacting={interacting}>
    <main className={`auth-page ${register ? 'auth-register' : 'auth-login'}`}>
      <AuthHeader register={register} />
      <AuthComposition register={register} onInteract={() => setInteracting(true)}>{children}</AuthComposition>
    </main>
  </AuthMotionProvider>
}
