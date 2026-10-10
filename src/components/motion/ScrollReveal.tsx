import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/** Reveals each element when it reaches the viewport, not on initial page load. */
export function ScrollReveal({ children, className = '', delay = 0, direction = 1 }: {
  children: ReactNode; className?: string; delay?: number; direction?: number
}) {
  const reduced = useReducedMotion()
  return <motion.div className={className}
    initial={reduced ? false : { opacity: 0, y: 64 + 8 * direction, scale: .94 }}
    whileInView={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }}
    viewport={{ once: true, amount: .18 }}
    transition={{ duration: reduced ? 0 : .85, delay: reduced ? 0 : delay, ease: [.16, 1, .3, 1] }}>
    {children}
  </motion.div>
}
