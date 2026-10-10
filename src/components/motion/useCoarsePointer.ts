import { useEffect, useState } from 'react'

const QUERY = '(hover: none) and (pointer: coarse)'

/** True on touch devices. Hover- and mouse-driven motion never fires there, so
 *  those surfaces are handed a scroll- or tap-driven equivalent instead. */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(() => window.matchMedia(QUERY).matches)
  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const sync = () => setCoarse(media.matches)
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  return coarse
}
