import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Section from '../components/Section.jsx'
import { SplitText, FadeContent, DarkVeil, ShinyText } from '../components/bits/index.jsx'
import SEOHead from '../components/SEOHead.jsx'
import { useCopy } from '../lib/copy.jsx'

const DEMO = [
  { _id: 'd1', slug: 'kala-kaari-culture', title: 'Kala. Kaari. Culture.', category: 'Studio Notes', author: 'Kalaakaari Studio', excerpt: 'Why we named the studio after a verb, not a thing.', publishedAt: '2025-09-12', readTime: 4 },
  { _id: 'd2', slug: 'naming-against-the-grain', title: 'Naming against the grain', category: 'Branding', author: 'Mira K.', excerpt: 'When a category-defining name comes from breaking a convention nobody asked you to break.', publishedAt: '2025-08-02', readTime: 6 },
  { _id: 'd3', slug: 'campaign-that-earns-the-room', title: "The campaign that earns the room", category: 'Campaign Thinking', author: 'Ravi S.', excerpt: 'A short note on why an ad film should make you stop scrolling without asking you to.', publishedAt: '2025-06-18', readTime: 3 },
  { _id: 'd4', slug: 'designing-for-delhi-light', title: 'Designing for Delhi light', category: 'Design', author: 'Studio', excerpt: 'How a city\'s ambient colour temperature should influence your palette decisions.', publishedAt: '2025-04-29', readTime: 5 }
]

export default function Journal() {
  const cp = useCopy('pages.journal') || {}
  const allLabel = 'All'
  const [items, setItems] = useState(DEMO)
  const [usingApi, setUsingApi] = useState(false)
  const [cat, setCat] = useState(allLabel)

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    axios.get(`${api}/blog`).then((r) => {
      if (r.data?.items?.length) { setItems(r.data.items); setUsingApi(true) }
    }).catch(() => {})
  }, [])

  const cats = [allLabel, ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))]
  const filtered = useMemo(() => cat === allLabel ? items : items.filter((i) => i.category === cat), [items, cat])
  const [hero, ...rest] = filtered

  return (
    <>
      <SEOHead overrides={{ title: 'Journal · KALAAKAARI', description: 'Notes, essays and studio dispatches from KALAAKAARI.' }} />

      <section className="relative pt-32 sm:pt-44 pb-16 overflow-hidden">
        <DarkVeil />
        <div className="max-w-[1320px] mx-auto px-7 relative">
          <span className="label-tag">{cp.eyebrow} · <span className="font-deva text-mustard normal-case">{cp.eyebrowDeva}</span></span>
          <h1 className="font-display mt-6 break-words" style={{ fontSize: 'clamp(48px,12vw,220px)', letterSpacing: '-.02em' }}>
            <SplitText text={cp.title1 || ''} by="word" />
            <br />
            <span className="font-serif-i font-light text-saffron"><SplitText text={cp.title2 || ''} by="word" delay={0.3} /></span>
          </h1>
          <p className="font-serif-i text-parchment mt-8 max-w-3xl text-xl leading-relaxed">
            {cp.sub} {usingApi ? '' : <span className="text-ink-mute text-base">(Demo content — write your own at /blog in the admin.)</span>}
          </p>
        </div>
      </section>

      <Section className="pb-10">
        <div className="flex flex-wrap gap-2 border-y border-line py-5">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)}
                    className={`px-3 py-1.5 text-[11px] tracking-[.2em] uppercase border transition-colors ${cat === c ? 'bg-saffron text-bg border-saffron' : 'border-line text-ink-mute hover:text-ink'}`}>
              {c}
            </button>
          ))}
        </div>
      </Section>

      {/* Featured post */}
      {hero && (
        <Section className="pb-16">
          <FadeContent>
            <Link to={`/journal/${hero.slug}`} className="group grid md:grid-cols-2 gap-10 items-center">
              <div className="aspect-[4/3] bg-bg-2 border border-line relative overflow-hidden order-2 md:order-1"
                   style={{ background: hero.cover ? `url(${hero.cover}) center/cover no-repeat` : 'linear-gradient(135deg,#2a1810,#0f0a07)' }}>
                {!hero.cover && (
                  <span className="absolute inset-0 flex items-center justify-center font-display text-center px-6"
                        style={{ fontSize: 'clamp(36px,6vw,80px)', color: 'rgba(244,237,224,.07)' }}>
                    {hero.title}
                  </span>
                )}
              </div>
              <div className="order-1 md:order-2">
                <span className="label-tag text-saffron"><ShinyText>{cp.featuredLabel || 'Featured'}</ShinyText> · {hero.category}</span>
                <h2 className="font-display mt-4 group-hover:text-mustard transition-colors" style={{ fontSize: 'clamp(40px,6vw,84px)', letterSpacing: '-.02em', lineHeight: 1 }}>
                  {hero.title}
                </h2>
                <p className="font-serif-i text-ink-mute mt-6 leading-relaxed text-xl">{hero.excerpt}</p>
                <div className="mt-6 label-tag text-ink-mute">
                  {hero.author || 'Kalaakaari Studio'} · {fmtDate(hero.publishedAt || hero.createdAt)} {hero.readTime && ` · ${hero.readTime} min`}
                </div>
                <div className="mt-8 inline-flex items-center gap-2 text-saffron text-[12px] tracking-[.24em] uppercase">Read the piece →</div>
              </div>
            </Link>
          </FadeContent>
        </Section>
      )}

      {/* The rest */}
      {rest.length > 0 && (
        <Section className="pb-32 border-t border-line pt-16">
          <div className="grid md:grid-cols-3 gap-8">
            {rest.map((p, i) => (
              <FadeContent key={p._id || p.slug} delay={(i % 3) * 0.06}>
                <Link to={`/journal/${p.slug}`} className="group block">
                  <div className="aspect-[4/3] bg-bg-2 border border-line overflow-hidden mb-5"
                       style={{ background: p.cover ? `url(${p.cover}) center/cover no-repeat` : 'linear-gradient(135deg,#2a1810,#0f0a07)' }}>
                    {!p.cover && (
                      <div className="w-full h-full grid place-items-center font-display text-center px-6"
                           style={{ fontSize: 'clamp(24px,3vw,42px)', color: 'rgba(244,237,224,.07)' }}>
                        {p.title}
                      </div>
                    )}
                  </div>
                  <span className="label-tag text-mustard">{p.category}</span>
                  <h3 className="font-display text-2xl mt-2 group-hover:text-saffron transition-colors leading-tight">{p.title}</h3>
                  {p.excerpt && <p className="font-serif-i text-ink-mute text-sm mt-3 leading-relaxed line-clamp-3">{p.excerpt}</p>}
                  <div className="label-tag mt-4 text-[10px] tracking-[.2em] text-ink-mute">
                    {p.author || 'Studio'} · {fmtDate(p.publishedAt || p.createdAt)}
                  </div>
                </Link>
              </FadeContent>
            ))}
          </div>
        </Section>
      )}

      {filtered.length === 0 && (
        <Section className="py-24">
          <p className="label-tag text-ink-mute text-center">{cp.emptyMessage}</p>
        </Section>
      )}
    </>
  )
}

function fmtDate(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return '' }
}
