/**
 * KALAAKAARI · React Bits — themed wrappers
 * Components implemented in the spirit of reactbits.dev (split-text, magnet,
 * shiny-text, fade-content, spotlight-card, tilted-card, count-up, dark-veil),
 * restyled for the KALAAKAARI editorial system.
 *
 * Every component respects prefers-reduced-motion.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'

// ─────────────────────────────── helpers
const useReducedMotion = () => {
  const [v, set] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    set(m.matches)
    const h = (e) => set(e.matches)
    m.addEventListener?.('change', h)
    return () => m.removeEventListener?.('change', h)
  }, [])
  return v
}

// ─────────────────────────────── SplitText
export function SplitText({ text, className = '', delay = 0, stagger = 0.04, by = 'word', as: Tag = 'span' }) {
  const reduce = useReducedMotion()
  const parts = useMemo(() => (by === 'char' ? [...text] : text.split(' ')), [text, by])
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' })

  return (
    <Tag ref={ref} className={`inline-block ${className}`} aria-label={text}>
      {parts.map((p, i) => (
        <span key={i} className="inline-block overflow-hidden align-baseline" style={{ paddingBottom: '.05em' }}>
          <motion.span
            className="inline-block"
            initial={reduce ? { y: 0 } : { y: '110%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 0.9, delay: delay + i * stagger, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {p}
            {by === 'word' && i < parts.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

// ─────────────────────────────── Magnet
export function Magnet({ children, strength = 0.3, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 14 })
  const sy = useSpring(y, { stiffness: 180, damping: 14 })
  const reduce = useReducedMotion()

  const onMove = (e) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * strength)
    y.set((e.clientY - r.top - r.height / 2) * strength)
  }
  const onLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      className={className}
      {...rest}
    >
      {children}
    </motion.span>
  )
}

// ─────────────────────────────── ShinyText
export function ShinyText({ children, speed = 4, className = '' }) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, #9C9486 0%, #F4EDE0 40%, #F5C542 50%, #F4EDE0 60%, #9C9486 100%)',
        backgroundSize: '200% 100%',
        animation: `kalaa-shine ${speed}s linear infinite`
      }}
    >
      <style>{`@keyframes kalaa-shine { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {children}
    </span>
  )
}

// ─────────────────────────────── FadeContent
export function FadeContent({ children, delay = 0, y = 32, duration = 0.9, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' })
  const reduce = useReducedMotion()
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────── CountUp
export function CountUp({ to = 100, from = 0, duration = 1.8, suffix = '', className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [val, setVal] = useState(from)
  useEffect(() => {
    if (!inView) return
    setVal(from)            // always begin from `from` (0) — never count down from a stale value
    const t0 = performance.now()
    let raf
    const step = (t) => {
      const p = Math.min(1, (t - t0) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(from + (to - from) * eased))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, from, to, duration])
  return <span ref={ref} className={className}>{val}{suffix}</span>
}

// ─────────────────────────────── SpotlightCard
export function SpotlightCard({ children, className = '', spotlightColor = 'rgba(232,99,31,.18)' }) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 50, y: 50, on: false })
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true })
  }
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setPos((p) => ({ ...p, on: true }))}
      onMouseLeave={() => setPos((p) => ({ ...p, on: false }))}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: pos.on ? 1 : 0,
          background: `radial-gradient(420px circle at ${pos.x}% ${pos.y}%, ${spotlightColor}, transparent 50%)`
        }}
      />
      {children}
    </div>
  )
}

// ─────────────────────────────── TiltedCard
export function TiltedCard({ children, className = '', max = 6 }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 150, damping: 12 })
  const sy = useSpring(y, { stiffness: 150, damping: 12 })
  const rx = useTransform(sy, [-0.5, 0.5], [max, -max])
  const ry = useTransform(sx, [-0.5, 0.5], [-max, max])
  const reduce = useReducedMotion()

  const onMove = (e) => {
    if (reduce) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────── DarkVeil (animated atmospheric backdrop)
export function DarkVeil({ className = '' }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        className="absolute -inset-1/3"
        style={{
          background:
            'radial-gradient(40% 40% at 20% 30%, rgba(232,99,31,.22), transparent 60%),' +
            'radial-gradient(36% 36% at 80% 20%, rgba(245,197,66,.10), transparent 70%),' +
            'radial-gradient(60% 60% at 50% 100%, rgba(140,58,26,.30), transparent 70%)'
        }}
        animate={{ rotate: [0, 4, -3, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ─────────────────────────────── TextPressure (lightweight)
// Oversized text whose weight subtly tracks mouse distance — used sparingly.
export function TextPressure({ text, className = '' }) {
  const ref = useRef(null)
  const [weight, setWeight] = useState(700)
  const onMove = (e) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const dist = Math.abs(e.clientX - cx) / (r.width / 2)
    setWeight(900 - Math.min(1, dist) * 400)
  }
  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setWeight(700)}
      className={className}
      style={{ fontWeight: weight, transition: 'font-weight .2s' }}
    >
      {text}
    </span>
  )
}
