import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react'
import { useCoarsePointer } from './useCoarsePointer'

export function DepthSurface({ children, className = '', strength = 9 }: { children: ReactNode; className?: string; strength?: number }) {
  const reduced = useReducedMotion()
  const coarse = useCoarsePointer()
  const frame = useRef<HTMLDivElement>(null)
  const horizontal = useMotionValue(0)
  const vertical = useMotionValue(0)
  const rotateX = useSpring(vertical, { stiffness: 170, damping: 24 })
  const rotateY = useSpring(horizontal, { stiffness: 170, damping: 24 })
  const shineX = useTransform(rotateY, [-(strength || 1), strength || 1], [-90, 90])
  const { scrollYProgress } = useScroll({ target: frame, offset: ['start end', 'end start'] })
  const idle = reduced || strength === 0
  useEffect(() => { if (idle) { horizontal.set(0); vertical.set(0) } }, [idle, horizontal, vertical])
  /** Touch has no hover, so the pointer tilt below never runs. Phones read the
   * same depth from the surface's own travel through the viewport instead. */
  useEffect(() => {
    if (!coarse || idle) return
    const apply = (progress: number) => {
      vertical.set((1 - progress * 2) * strength)
      horizontal.set(Math.sin(progress * Math.PI * 2) * strength * .7)
    }
    apply(scrollYProgress.get())
    return scrollYProgress.on('change', apply)
  }, [coarse, idle, strength, scrollYProgress, horizontal, vertical])
  const reset = () => { if (coarse) return; horizontal.set(0); vertical.set(0) }
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (idle || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    horizontal.set(((event.clientX - bounds.left) / bounds.width - .5) * strength * 2)
    vertical.set(-((event.clientY - bounds.top) / bounds.height - .5) * strength * 2)
  }
  return <div ref={frame} className={`depth-perspective ${className}`} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
    <motion.div className="depth-surface" style={{ rotateX: reduced ? 0 : rotateX, rotateY: reduced ? 0 : rotateY }}>
      {children}
      {!reduced && <motion.div aria-hidden="true" className="depth-shine" style={{ x: shineX }} />}
    </motion.div>
  </div>
}
