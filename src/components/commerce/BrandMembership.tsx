import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemberProfile } from '../../services/profileService'
import { ScrollReveal } from '../motion/ScrollReveal'

export function BrandMembership() {
  const { currentUser } = useMemberProfile()
  const reduced = useReducedMotion()
  const section = useRef<HTMLElement>(null)
  const visible = useInView(section, { amount: .2 })
  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] })
  const rotate = useTransform(scrollYProgress, [0, 1], [-18, 18])
  const logoRotate = useTransform(scrollYProgress, [0, 1], [-12, 4])
  return <section ref={section} className="content-wrap membership-section pb-16 md:pb-24"><div className="brand-membership">
    <ScrollReveal className="brand-membership-copy" direction={-1}><span className="eyebrow text-[var(--green)]">A LITTLE MORE, FROM YOUR MART</span><h2 className="mt-5">Part of your home.<br /><span className="text-[var(--green)]">Part of your everyday.</span></h2><p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--muted)]">Your everyday shop comes with a little thank you. Earn points, enjoy member prices, and give a friend NPR 150 for their first basket.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/rewards" className="pill-button bg-[var(--green)] text-white">Your rewards <ArrowRight size={16} /></Link><Link to="/register" className="pill-button border border-black/10 bg-white">Join the family</Link></div></ScrollReveal>
    <div className={`brand-membership-art ${visible && !reduced ? 'scene-in-view' : ''}`}>
      <motion.div aria-hidden="true" className="membership-orbit" style={{ rotate: reduced ? 0 : rotate }}><span className="orbit-glint" /></motion.div>
      <div className="scene-ripple scene-ripple-one" aria-hidden="true" /><div className="scene-ripple scene-ripple-two" aria-hidden="true" />
      <ScrollReveal className="membership-logo" delay={.1}><motion.img style={{ rotate: reduced ? 0 : logoRotate }} src="/assets/brand/griha-mart-logo.png" alt="गृह मार्ट — घरका लागि सबै कुरा" width="210" height="210" loading="lazy" /></ScrollReveal>
      <ScrollReveal className="brand-membership-note" delay={.3}><strong>{currentUser.rewardPoints.toLocaleString()}</strong><span>little reasons to come home.</span><span>Available reward points</span></ScrollReveal>
    </div>
  </div></section>
}
