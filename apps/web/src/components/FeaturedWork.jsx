import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Section, { SectionHead } from './Section.jsx'
import { FadeContent, TiltedCard, Magnet } from './bits/index.jsx'

// Demo fallback — used only if the API returns nothing
const DEMO = [
  { _id: 'd1', slug: 'hauz-khas-collective', title: 'Hauz Khas Collective', deva: 'हौज़ ख़ास', category: 'Branding', year: 2025, featured: true },
  { _id: 'd2', slug: 'namkeen-republic', title: 'Namkeen Republic', deva: 'नमकीन गणराज्य', category: 'Campaign', year: 2025, result: '4.2M Impressions' },
  { _id: 'd3', slug: 'studio-tamas', title: 'Studio Tamas', deva: 'तमस', category: 'Identity', year: 2024 },
  { _id: 'd4', slug: 'bombay-club', title: 'The Bombay Club', deva: 'बम्बई क्लब', category: 'Content', year: 2024, result: '0 → 180K · 8 mo' },
  { _id: 'd5', slug: 'aroha-jewels', title: 'Aroha Jewels', deva: 'आरोहा', category: 'Production', year: 2024, result: '3× revenue' },
  { _id: 'd6', slug: 'urban-apothecary', title: 'Urban Apothecary', deva: 'अर्बन', category: 'Motion Design', year: 2024 },
  { _id: 'd7', slug: 'atelier-lota', title: 'Atelier Lota', deva: 'अटेलियर', category: 'Digital', year: 2024 }
]

// Layout pattern: [6, 6, 4, 4, 4, 8, 4] — repeats if more items
const SPAN_PATTERN = [6, 6, 4, 4, 4, 8, 4]

export default function FeaturedWork() {
  const [items, setItems] = useState(DEMO)

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    // try featured first, fall back to all if no featured
    axios.get(`${api}/portfolio?featured=true`)
      .then((r) => {
        if (r.data?.items?.length) return r.data.items
        return axios.get(`${api}/portfolio`).then((rr) => rr.data?.items || [])
      })
      .then((list) => {
        if (Array.isArray(list) && list.length) setItems(list.slice(0, 7))
      })
      .catch(() => {})
  }, [])

  return (
    <Section id="work" className="py-32">
      <SectionHead
        label="Selected Work"
        deva="चुनिंदा कार्य"
        title={<>Sneak peek into<br />what we're up to.</>}
        right={
          <Magnet>
            <Link to="/work" className="inline-flex items-center gap-3 px-7 py-4 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg transition-colors">
              View All Work →
            </Link>
          </Magnet>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {items.map((p, i) => {
          const span = SPAN_PATTERN[i % SPAN_PATTERN.length]
          const spanClass = span === 6 ? 'md:col-span-6' : span === 4 ? 'md:col-span-4' : 'md:col-span-8'
          return (
            <FadeContent
              key={p._id || p.slug || i}
              delay={(i % 3) * 0.08}
              className={spanClass}
            >
              <ProjectCard p={p} index={i} />
            </FadeContent>
          )
        })}
      </div>
    </Section>
  )
}

function ProjectCard({ p, index }) {
  const slug = p.slug || String(p.title || '').toLowerCase().replace(/\s+/g, '-')
  const cover = p.cover
  const subLabel = [p.category, p.year].filter(Boolean).join(' · ')
  const visual = (p.title || '').toUpperCase()

  const card = (
    <Link to={`/work/${slug}`} className="group block relative bg-bg-2 border border-line overflow-hidden hover:border-saffron transition-colors">
      <div className="aspect-[4/3] relative overflow-hidden"
        style={cover
          ? { background: `linear-gradient(180deg, transparent 50%, rgba(11,10,8,.4)), url(${cover}) center/cover no-repeat` }
          : { background: 'linear-gradient(135deg,#2a1810 0%,#0f0a07 100%)' }}>
        <span className="absolute top-4 left-4 z-10 label-tag text-mustard bg-bg/80 px-2.5 py-1.5 border border-line">{subLabel}</span>
        <span className="absolute top-4 right-4 z-10 font-display text-sm text-ink-mute">№{String(index + 1).padStart(2,'0')}</span>
        {p.result && (
          <span className="absolute bottom-20 left-4 z-10 bg-saffron text-bg px-2.5 py-1 text-[10px] tracking-[.2em] uppercase font-semibold">{p.result}</span>
        )}
        {!cover && (
          <span className="absolute inset-0 flex items-center justify-center font-display text-center px-6 transition-all duration-700 group-hover:scale-110"
            style={{ fontSize: 'clamp(48px,8vw,92px)', color: 'rgba(244,237,224,.07)', letterSpacing: '-.02em' }}>
            {visual}
          </span>
        )}
        <span className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(232,99,31,.18), transparent 60%)' }} />
      </div>
      <div className="px-5 py-5 border-t border-line flex items-end justify-between gap-3">
        <div>
          <h4 className="font-display text-2xl">{p.title}</h4>
          {p.deva && <span className="block font-deva text-mustard text-xs mt-1.5">{p.deva}</span>}
        </div>
        {p.client && p.client !== p.title && (
          <span className="font-display text-2xl text-ink-mute text-right leading-none shrink-0">{p.client}</span>
        )}
      </div>
    </Link>
  )
  return p.featured ? <TiltedCard className="will-change-transform">{card}</TiltedCard> : card
}
