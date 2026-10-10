import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useReducedMotion, type MotionProps, type TargetAndTransition, type Transition } from 'framer-motion'
import exportedTracks from './authMotionData.json'

type Track = { initial: Record<string, number>; animate: Record<string, number[]>; transition: Record<string, { duration: number; times: number[]; ease: unknown; repeat: number }> }
const tracks = exportedTracks as unknown as Record<string, Track | { alias: string }>
const Context = createContext({ mobile: false, reduced: false, interacting: false, register: false, enabled: false })

export function AuthMotionProvider({ children, register, interacting }: { children: ReactNode; register: boolean; interacting: boolean }) {
  const preference = useReducedMotion()
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const [hidden, setHidden] = useState(document.hidden)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const resize = () => setMobile(media.matches)
    const visibility = () => setHidden(document.hidden)
    media.addEventListener('change', resize)
    document.addEventListener('visibilitychange', visibility)
    return () => { media.removeEventListener('change', resize); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  return <Context.Provider value={{ mobile, reduced: !!preference || hidden, interacting, register, enabled: true }}>{children}</Context.Provider>
}

/** Exact exported keyframes/easings. Only the production lifecycle differs: forms
 * enter once and remain readable; decorative cohorts retain their Figma loops. */
export function useFigmaAuthMotion(desktopId: string, mobileId?: string, decorative = false): MotionProps & { 'data-node-id': string } {
  const { mobile, reduced, interacting, enabled } = useContext(Context)
  const id = mobile && mobileId ? mobileId : desktopId
  let source = tracks[id]
  if (source && 'alias' in source) source = tracks[source.alias]
  if (!enabled || !source || 'alias' in source) return { 'data-node-id': id }
  const animate = Object.fromEntries(Object.entries(source.animate).map(([key, values]) => {
    const next = [...values]
    // The exported outro fades form controls away. Hold their visible state.
    if (!decorative && key === 'opacity') {
      const peak = Math.max(...next)
      const peakIndex = next.indexOf(peak)
      next.fill(peak, peakIndex)
    }
    return [key, next]
  }))
  const resting = Object.fromEntries(Object.entries(animate).map(([key, values]) => [key, key === 'opacity' ? Math.max(...values) : values.at(-1)!]))
  if (reduced || (!decorative && interacting)) return { 'data-node-id': id, initial: false, animate: resting, transition: { duration: 0 } }
  const transition = Object.fromEntries(Object.entries(source.transition).map(([key, value]) => [key, { ...value, repeat: decorative ? Infinity : 0 }]))
  return { 'data-node-id': id, initial: source.initial, animate: animate as TargetAndTransition, transition: transition as Transition }
}

const slots = {
  title: ['75:196', '74:347', '130:9', '131:8'],
  fullNameLabel: ['', '', '130:10', '131:9'], fullName: ['', '', '130:11', '131:10'],
  emailLabel: ['75:197', '74:348', '130:13', '131:12'], email: ['75:198', '74:349', '130:14', '131:13'],
  phoneLabel: ['', '', '130:16', '131:15'], phone: ['', '', '130:17', '131:16'],
  passwordLabel: ['75:199', '74:350', '130:19', '131:18'], password: ['75:200', '74:351', '130:20', '131:19'],
  submit: ['75:201', '74:352', '130:22', '131:21'], submitText: ['75:202', '74:353', '130:23', '131:22'],
  google: ['83:54', '83:9', '', ''], foot: ['83:56', '83:11', '130:24', '131:23'],
} satisfies Record<string, string[]>
export function useAuthSlot(slot: keyof typeof slots) {
  const { register } = useContext(Context)
  const ids = slots[slot]
  return useFigmaAuthMotion(ids[register ? 2 : 0], ids[register ? 3 : 1])
}
