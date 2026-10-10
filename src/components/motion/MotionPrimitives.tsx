import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const easeOut = [0.22, 1, 0.36, 1] as const

export function PageTransition({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.main
      className={className}
      initial={reduced ? false : { opacity: .92, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: .96, y: -6 }}
      transition={{ duration: reduced ? 0 : .28, ease: easeOut }}
    >
      {children}
    </motion.main>
  )
}

export function Reveal({ children, className = '', delay = 0, from = 'up' }: { children: ReactNode; className?: string; delay?: number; from?: 'up' | 'left' | 'right' }) {
  const reduced = useReducedMotion()
  const offset = from === 'left' ? { x: -65 } : from === 'right' ? { x: 65 } : { y: 65 }
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: .2, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: reduced ? 0 : .48, delay: reduced ? 0 : delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  )
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: .08, delayChildren: .08 } },
}

export const staggerItem: Variants = {
  hidden: { opacity: .18, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: .42, ease: easeOut } },
}

export function FloatingProduct({ children, className = '', duration = 6, offset = 14, delay = 0 }: { children: ReactNode; className?: string; duration?: number; offset?: number; delay?: number }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: .35, y: 36 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: [0, -offset, 0] }}
      transition={reduced ? { duration: 0 } : { opacity: { duration: .5, delay }, y: { duration, delay, repeat: Infinity, ease: 'easeInOut' } }}
    >
      {children}
    </motion.div>
  )
}
