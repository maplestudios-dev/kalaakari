import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useCopy } from '../lib/copy.jsx'

const isDeva = (s = '') => /[ऀ-ॿ]/.test(s)

/**
 * Client marquee — continuous auto-scroll with manual drag/swipe.
 * Renders uploaded brand logos when available (auto-tinted light for the dark
 * background); otherwise falls back to the text names from Site Copy.
 * Auto-scroll pauses on hover/touch and resumes on release.
 */
export default function BrandsTicker() {
  const tokens = useCopy('brandsTicker') || []
  const [logos, setLogos] = useState([])
  const scroller = useRef(null)
  const paused = useRef(false)
  const drag = useRef(null)

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    axios.get(`${api}/homepage`)
      .then((r) => setLogos((r.data?.homepage?.brandLogos || []).filter((b) => b.logo)))
      .catch(() => {})
  }, [])

  const useLogos = logos.length > 0
  const base = useLogos ? logos : tokens
  const row = [...base, ...base]

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    el.scrollLeft = el.scrollWidth / 4
    let raf
    const SPEED = 0.5
    const tick = () => {
      if (el && !paused.current) {
        el.scrollLeft += SPEED
        const half = el.scrollWidth / 2
        if (el.scrollLeft >= half) el.scrollLeft -= half
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [base.length])

  const wrap = () => {
    const el = scroller.current
    if (!el) return
    const half = el.scrollWidth / 2
    if (el.scrollLeft >= half) el.scrollLeft -= half
    else if (el.scrollLeft <= 0) el.scrollLeft += half
  }

  const onPointerDown = (e) => {
    paused.current = true
    drag.current = { x: e.clientX, start: scroller.current.scrollLeft }
    scroller.current.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    scroller.current.scrollLeft = drag.current.start - (e.clientX - drag.current.x)
    wrap()
  }
  const endDrag = () => { drag.current = null; paused.current = false }

  return (
    <section className="border-y border-line bg-bg overflow-hidden py-12">
      <div
        ref={scroller}
        className="flex gap-20 items-center whitespace-nowrap overflow-x-hidden cursor-grab active:cursor-grabbing select-none touch-pan-y"
        onMouseEnter={() => { paused.current = true }}
        onMouseLeave={() => { if (!drag.current) paused.current = false }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {useLogos
          ? row.map((b, i) => (
              <img
                key={i}
                src={b.logo}
                alt={b.name || 'Client'}
                className="h-8 md:h-10 w-auto object-contain pointer-events-none opacity-60 hover:opacity-100 transition-opacity"
                style={{ filter: 'brightness(0) invert(1)' }}
                loading="lazy"
              />
            ))
          : row.map((t, i) =>
              isDeva(t)
                ? <span key={i} className="font-deva text-mustard text-3xl pointer-events-none">{t}</span>
                : <span key={i} className="font-display text-4xl text-ink-mute uppercase pointer-events-none">{t}</span>
            )}
      </div>
    </section>
  )
}
