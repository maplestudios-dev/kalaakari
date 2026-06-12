import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Section, { SectionHead } from '../components/Section.jsx'
import { SplitText, FadeContent, TiltedCard, Magnet } from '../components/bits/index.jsx'
import VideoTheater from '../components/VideoTheater.jsx'
import { useCopy } from '../lib/copy.jsx'

const CATEGORY_FILTERS = ['Branding', 'Campaign', 'Content', 'Digital', 'Performance', 'Production']

// fallback demo content if API is offline
const DEMO = [
  { id: 1, title: 'Hauz Khas Collective', client: 'Hauz Khas Collective', deva: 'हौज़ ख़ास', category: 'Branding', year: 2025, result: '', span: 6, featured: true, visual: 'HAUZ KHAS' },
  { id: 2, title: 'Namkeen Republic', client: 'Namkeen Republic', deva: 'नमकीन गणराज्य', category: 'Campaign', year: 2025, result: '4.2M Impressions', span: 6, visual: 'NAMKEEN' },
  { id: 3, title: 'Studio Tamas', client: 'Studio Tamas', deva: 'तमस', category: 'Branding', year: 2024, visual: 'TAMAS', span: 4 },
  { id: 4, title: 'The Bombay Club', client: 'The Bombay Club', deva: 'बम्बई क्लब', category: 'Content', year: 2024, result: '0 → 180K · 8 mo', visual: 'BOMBAY', span: 4 },
  { id: 5, title: 'Aroha Jewels', client: 'Aroha', deva: 'आरोहा', category: 'Production', year: 2024, result: '3× revenue', visual: 'AROHA', span: 4 },
  { id: 6, title: 'Urban Apothecary', client: 'Urban Apothecary', deva: 'अर्बन', category: 'Content', year: 2024, visual: 'URBAN APOTHECARY', span: 8 },
  { id: 7, title: 'Atelier Lota', client: 'Atelier Lota', deva: 'अटेलियर', category: 'Digital', year: 2024, visual: 'ATELIER', span: 4 }
]

export default function Work() {
  const c = useCopy('pages.work') || {}
  const allLabel = c.filterAllLabel || 'All'

  const [filter, setFilter] = useState(allLabel)
  const [items, setItems] = useState(DEMO)
  const [videos, setVideos] = useState([])
  const [playing, setPlaying] = useState(null)
  const [usingApi, setUsingApi] = useState(false)

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    axios.get(`${api}/portfolio`).then((r) => {
      if (r.data?.items?.length) { setItems(r.data.items); setUsingApi(true) }
    }).catch(() => {})
    axios.get(`${api}/video?featured=true`).then((r) => {
      const list = r.data?.items?.length ? r.data.items : []
      setVideos(list.slice(0, 4))
    }).catch(() => {})
  }, [])

  const filters = [allLabel, ...CATEGORY_FILTERS]
  const filtered = filter === allLabel ? items : items.filter((p) => p.category === filter)

  return (
    <>
      <section className="pt-44 pb-12">
        <div className="max-w-[1320px] mx-auto px-7">
          <span className="label-tag">{c.eyebrow} · <span className="font-deva text-mustard normal-case">{c.eyebrowDeva}</span></span>
          <h1 className="font-display mt-6" style={{ fontSize: 'clamp(72px,12vw,220px)', letterSpacing: '-.02em' }}>
            <SplitText text={c.title || ''} by="word" />
          </h1>
          <p className="font-serif-i text-parchment mt-8 max-w-3xl text-xl leading-relaxed">
            {c.sub} {usingApi ? '' : <span className="text-ink-mute text-base">(Demo content — connect API to load live items.)</span>}
          </p>

          <div className="mt-12 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 border text-[11px] tracking-[.2em] uppercase transition-colors ${filter === f ? 'bg-saffron text-bg border-saffron' : 'border-line text-ink-mute hover:text-ink'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Section className="pb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {filtered.map((p, i) => (
            <FadeContent key={p._id || p.id || p.slug} delay={(i % 3) * 0.06}
              className={
                p.span === 8 ? 'md:col-span-8' :
                p.span === 4 ? 'md:col-span-4' :
                'md:col-span-6'
              }>
              <Card p={p} />
            </FadeContent>
          ))}
        </div>
      </Section>

      {/* ── Also in motion ─────────────────────────── */}
      {videos.length > 0 && (
        <section className="border-t border-line py-24 bg-bg-2">
          <div className="max-w-[1320px] mx-auto px-7">
            <SectionHead
              label="Also in motion"
              deva="वीडियो"
              title="Films we have made."
              right={
                <Magnet>
                  <Link to="/reel" className="inline-flex items-center gap-3 px-7 py-4 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg transition-colors">
                    All of the reel →
                  </Link>
                </Magnet>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {videos.map((v) => (
                <button key={v._id} onClick={() => setPlaying(v)} className="text-left">
                  <div className="relative aspect-video bg-bg border border-line overflow-hidden hover:border-saffron transition-colors group"
                       style={v.poster ? { background: `url(${v.poster}) center/cover no-repeat` } : { background: 'linear-gradient(135deg,#2a1810,#0a0805)' }}>
                    {!v.poster && (
                      <div className="absolute inset-0 grid place-items-center font-display text-ink-mute/15 text-center px-3 text-sm">{v.title}</div>
                    )}
                    <span className="absolute top-2.5 left-2.5 label-tag text-mustard bg-bg/80 px-2 py-1 border border-line text-[9px]">{v.category}</span>
                    {v.duration && <span className="absolute top-2.5 right-2.5 font-display text-xs text-ink-mute bg-bg/80 px-2 py-0.5 border border-line">{v.duration}s</span>}
                    <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-saffron grid place-items-center"><span className="text-bg ml-0.5">▶</span></div>
                    </div>
                  </div>
                  <h4 className="font-display text-lg mt-3">{v.title}</h4>
                  {v.client && <span className="label-tag text-[10px] mt-1 block">{v.client} · {v.year}</span>}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <VideoTheater video={playing} onClose={() => setPlaying(null)} />
    </>
  )
}

function Card({ p }) {
  const slug = p.slug || String(p.title || '').toLowerCase().replace(/\s+/g, '-')
  const cover = p.cover
  const inner = (
    <Link to={`/work/${slug}`} className="group block relative bg-bg-2 border border-line overflow-hidden hover:border-saffron transition-colors">
      <div className="aspect-[4/3] relative overflow-hidden"
           style={cover
             ? { background: `linear-gradient(180deg, transparent 50%, rgba(11,10,8,.45)), url(${cover}) center/cover no-repeat` }
             : { background: 'linear-gradient(135deg,#2a1810,#0f0a07)' }}>
        <span className="absolute top-4 left-4 z-10 label-tag text-mustard bg-bg/80 px-2.5 py-1.5 border border-line">{p.category} · {p.year}</span>
        {p.result && <span className="absolute bottom-20 left-4 z-10 bg-saffron text-bg px-2.5 py-1 text-[10px] tracking-[.2em] uppercase font-semibold">{p.result}</span>}
        {!cover && (
          <span className="absolute inset-0 flex items-center justify-center font-display text-center px-6 transition-all duration-700 group-hover:scale-110"
                style={{ fontSize: 'clamp(48px,8vw,92px)', color: 'rgba(244,237,224,.07)' }}>{p.visual || p.title}</span>
        )}
        <span className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 30% 30%, rgba(232,99,31,.18), transparent 60%)' }} />
      </div>
      <div className="px-5 py-5 border-t border-line flex items-end justify-between gap-3">
        <div>
          <h4 className="font-display text-2xl">{p.title}</h4>
          {p.deva && <span className="block font-deva text-mustard text-xs mt-1.5">{p.deva}</span>}
        </div>
        <span className="label-tag">{p.category}</span>
      </div>
    </Link>
  )
  return p.featured ? <TiltedCard>{inner}</TiltedCard> : inner
}
