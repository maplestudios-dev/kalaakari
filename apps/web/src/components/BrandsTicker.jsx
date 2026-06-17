import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useCopy } from '../lib/copy.jsx'

const isDeva = (s = '') => /[ऀ-ॿ]/.test(s)

/**
 * Client marquee. Renders uploaded brand logos in their original colour when
 * available, otherwise the text names from Site Copy.
 *
 * Scrolling is adaptive: only when the (de-duplicated) logos are wider than the
 * viewport do we duplicate them for a seamless loop. With just a few logos they
 * render once, centred — so a brand never appears twice on screen.
 */
export default function BrandsTicker() {
  const tokens = useCopy('brandsTicker') || []
  const [logos, setLogos] = useState([])
  const [scroll, setScroll] = useState(false)
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
  // De-duplicate so the same brand is never listed twice in the source.
  const base = useLogos
    ? logos.filter((b, i, a) => a.findIndex((x) => (x.logo || x.name) === (b.logo || b.name)) === i)
    : tokens.filter((t, i, a) => a.indexOf(t) === i)
  const content = scroll ? [...base, ...base] : base

  // Decide whether scrolling is needed (content wider than the rail).
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const measure = () => {
      if (!scroll && el.scrollWidth > el.clientWidth + 4) setScroll(true)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [base.length, scroll])

  // Auto-scroll only when scrolling is actually needed.
  useEffect(() => {
    if (!scroll) return
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
  }, [scroll, base.length])

  const wrap = () => {
    const el = scroller.current
    if (!el) return
    const half = el.scrollWidth / 2
    if (el.scrollLeft >= half) el.scrollLeft -= half
    else if (el.scrollLeft <= 0) el.scrollLeft += half
  }

  const onPointerDown = (e) => {
    if (!scroll) return
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
        className={`flex gap-12 md:gap-20 items-center whitespace-nowrap overflow-x-hidden select-none touch-pan-y ${scroll ? 'cursor-grab active:cursor-grabbing' : 'justify-center'}`}
        onMouseEnter={() => { if (scroll) paused.current = true }}
        onMouseLeave={() => { if (!drag.current) paused.current = false }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {useLogos
          ? content.map((b, i) => (
              <img
                key={i}
                src={b.logo}
                alt={b.name || 'Client'}
                className="h-8 md:h-10 w-auto object-contain pointer-events-none"
                loading="lazy"
              />
            ))
          : content.map((t, i) =>
              isDeva(t)
                ? <span key={i} className="font-deva text-mustard text-3xl pointer-events-none">{t}</span>
                : <span key={i} className="font-display text-4xl text-ink-mute uppercase pointer-events-none">{t}</span>
            )}
      </div>
    </section>
  )
}
