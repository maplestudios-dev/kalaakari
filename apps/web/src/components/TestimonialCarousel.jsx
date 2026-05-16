import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import Section, { SectionHead } from './Section.jsx'
import { FadeContent } from './bits/index.jsx'

const DEMO = [
  { _id: 'd1', quote: 'They sharpened the brief before they touched a Figma file. The work was a consequence.', author: 'Mira Kapoor',  role: 'Founder', company: 'Aroha Jewels', rating: 5 },
  { _id: 'd2', quote: "We came in asking for a campaign. They sold us a positioning. We're still paying it back in compounding interest.", author: 'Ravi S.',      role: 'Head of Brand', company: 'Namkeen Republic', rating: 5 },
  { _id: 'd3', quote: 'Senior-led isn\'t a tagline at KALAAKAARI — it\'s how the calls actually go.', author: 'Anjali Reddy', role: 'CMO',     company: 'Studio Tamas', rating: 5 }
]

export default function TestimonialCarousel() {
  const [items, setItems] = useState(DEMO)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    axios.get(`${api}/testimonials`).then((r) => {
      const featured = r.data?.items?.filter((t) => t.featured)
      const list = (featured?.length ? featured : r.data?.items) || []
      if (list.length) setItems(list)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (paused || items.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 7000)
    return () => clearInterval(id)
  }, [paused, items.length])

  if (items.length === 0) return null
  const t = items[index]

  return (
    <Section className="py-32 border-t border-line">
      <SectionHead
        label="Client voice"
        deva="ग्राहक की आवाज़"
        title={<>What the people<br />who hire us say.</>}
        right={
          items.length > 1 && (
            <div className="flex gap-2 items-center">
              <button onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)} className="w-10 h-10 border border-line hover:border-saffron transition-colors">←</button>
              <span className="label-tag mx-2">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
              <button onClick={() => setIndex((i) => (i + 1) % items.length)} className="w-10 h-10 border border-line hover:border-saffron transition-colors">→</button>
            </div>
          )
        }
      />

      <FadeContent>
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative border border-line bg-bg-2 p-10 md:p-16 overflow-hidden"
        >
          <span className="absolute -top-8 left-6 font-serif-i text-saffron pointer-events-none select-none" style={{ fontSize: '14rem', lineHeight: 1, opacity: .18 }}>"</span>

          <AnimatePresence mode="wait">
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative"
            >
              <blockquote className="font-serif-i font-light leading-[1.2] max-w-4xl"
                          style={{ fontSize: 'clamp(24px, 3.4vw, 44px)', letterSpacing: '-.01em' }}>
                "{t.quote}"
              </blockquote>

              <div className="mt-10 flex items-center gap-4">
                {t.avatar
                  ? <img src={t.avatar} alt="" className="w-14 h-14 rounded-full object-cover border border-line" />
                  : <div className="w-14 h-14 rounded-full bg-bg border border-line grid place-items-center font-display text-mustard text-xl">{(t.author || '?').slice(0,1)}</div>}
                <div>
                  <div className="font-display text-xl">{t.author}</div>
                  <div className="label-tag mt-1">
                    {t.role}{t.role && t.company ? ' · ' : ''}{t.company}
                  </div>
                </div>
                {t.rating && (
                  <div className="ml-auto hidden md:flex items-center gap-1 text-mustard">
                    {Array.from({ length: t.rating }).map((_, i) => <span key={i}>★</span>)}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {items.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-px bg-line">
              <motion.div
                key={`${t._id}-${paused}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: paused ? 0 : 1 }}
                transition={{ duration: paused ? 0 : 7, ease: 'linear' }}
                style={{ originX: 0 }}
                className="h-full bg-saffron"
              />
            </div>
          )}
        </div>
      </FadeContent>
    </Section>
  )
}
