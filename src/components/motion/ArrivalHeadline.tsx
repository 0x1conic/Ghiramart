import { motion, useReducedMotion } from 'framer-motion'

export function ArrivalHeadline() {
  const reduced = useReducedMotion()
  return <h1 className="arrival-headline" aria-label="A little fresher. A lot more home.">
    {['A little', 'fresher.', 'A lot more home.'].map((line, index) => <span key={line} className={`arrival-mask arrival-line-${index}`} aria-hidden="true">
      <motion.span className="arrival-word" initial={reduced ? false : { y: '108%', rotate: 5 }} animate={{ y: 0, rotate: 0 }} transition={{ duration: .85, delay: .12 + index * .14, ease: [.16, 1, .3, 1] }}>{line}</motion.span>
    </span>)}
    <motion.svg aria-hidden="true" className="arrival-underline" viewBox="0 0 350 26" initial="hidden" animate="visible"><motion.path d="M5 18 C80 3 210 2 342 12 M50 23 C145 12 247 9 320 17" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: .7, duration: .65, ease: 'easeOut' }} /></motion.svg>
  </h1>
}
