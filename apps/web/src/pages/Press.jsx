import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Section, { SectionHead } from '../components/Section.jsx'
import { SplitText, FadeContent, DarkVeil } from '../components/bits/index.jsx'
import SEOHead from '../components/SEOHead.jsx'

const DEMO = [
  { _id: 'd1', type: 'Award',   title: 'Brand Identity of the Year — Hauz Khas Collective', publication: 'Kyoorius Design Awards', date: '2025-09-01', excerpt: 'Recognized for clarity, restraint, and cultural specificity.', url: '#' },
  { _id: 'd2', type: 'Award',   title: 'Best Campaign — South Asia', publication: 'D&AD New Blood', date: '2024-06-15', excerpt: 'For the Namkeen Republic launch film.', url: '#' },
  { _id: 'd3', type: 'Press',   title: 'The studios reshaping Indian advertising', publication: 'It\'s Nice That', date: '2025-02-12', excerpt: 'A long-read on Delhi\'s independent creative class.', url: '#' },
  { _id: 'd4', type: 'Feature', title: 'Inside Kalaakaari\'s Delhi office', publication: 'Design Indaba', date: '2024-11-04', excerpt: '"Senior-led" isn\'t a slogan. We took a look.', url: '#' },
  { _id: 'd5', type: 'Press',   title: 'How small studios outrun network agencies', publication: 'Campaign India', date: '2024-08-20', excerpt: 'Featured alongside three other studios redefining craft-first work.', url: '#' }
]

export default function Press() {
  const [items, setItems] = useState(DEMO)
  const [usingApi, setUsingApi] = useState(false)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    axios.get(`${api}/press`).then((r) => {
      if (r.data?.items?.length) { setItems(r.data.items); setUsingApi(true) }
    }).catch(() => {})
  }, [])

  const types = ['All', ...Array.from(new Set(items.map((i) => i.type)))]
  const filtered = useMemo(() => filter === 'All' ? items : items.filter((i) => i.type === filter), [items, filter])
  const awards = items.filter((i) => i.type === 'Award')
  const publications = useMemo(() => Array.from(new Set(items.map((i) => i.publication).filter(Boolean))), [items])

  return (
    <>
      <SEOHead overrides={{ title: 'Press & Awards · KALAAKAARI', description: 'Press mentions, features, and awards for the KALAAKAARI creative studio.' }} />

      <section className="relative pt-44 pb-24 overflow-hidden">
        <DarkVeil />
        <div className="max-w-[1320px] mx-auto px-7 relative">
          <span className="label-tag">Press & Awards · <span className="font-deva text-mustard normal-case">सम्मान</span></span>
          <h1 className="font-display mt-6" style={{ fontSize: 'clamp(72px,12vw,220px)', letterSpacing: '-.02em' }}>
            <SplitText text="The receipts" by="word" />
            <br />
            <span className="font-serif-i font-light text-saffron"><SplitText text="we did not write." by="word" delay={0.3} /></span>
          </h1>
          <p className="font-serif-i text-parchment mt-8 max-w-3xl text-xl leading-relaxed">
            Awards, features, and the words of other people. {usingApi ? '' : <span className="text-ink-mute text-base">(Demo content — manage at /press in the admin.)</span>}
          </p>
        </div>
      </section>

      {/* Publication wall */}
      {publications.length > 0 && (
        <section className="border-y border-line py-14 bg-bg-2">
          <div className="max-w-[1320px] mx-auto px-7">
            <p className="label-tag text-center mb-8">As featured in</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 font-display text-ink-mute" style={{ fontSize: 'clamp(20px,2.4vw,32px)' }}>
              {publications.map((p) => <span key={p} className="opacity-80 hover:opacity-100 hover:text-ink transition-opacity">{p}</span>)}
            </div>
          </div>
        </section>
      )}

      {/* Awards highlight */}
      {awards.length > 0 && (
        <Section className="py-24">
          <SectionHead label="Awards" deva="पुरस्कार" title="Recognized work." />
          <div className="grid md:grid-cols-2 gap-5">
            {awards.map((a, i) => (
              <FadeContent key={a._id} delay={i * 0.05}>
                <a href={a.url || '#'} target="_blank" rel="noopener noreferrer"
                   className="block border border-line bg-bg-2 p-8 hover:border-saffron transition-colors group">
                  <span className="label-tag text-mustard">★ {a.type} · {a.date ? new Date(a.date).getFullYear() : ''}</span>
                  <h3 className="font-display text-3xl md:text-4xl mt-3 leading-tight">{a.title}</h3>
                  {a.publication && <div className="font-serif-i text-ink-mute mt-3 text-lg">{a.publication}</div>}
                  {a.excerpt && <p className="text-ink-mute mt-4 leading-relaxed">{a.excerpt}</p>}
                  <div className="mt-6 label-tag group-hover:text-saffron transition-colors">Read about it →</div>
                </a>
              </FadeContent>
            ))}
          </div>
        </Section>
      )}

      {/* All press list with filters */}
      <section className="py-24 bg-bg-2 border-t border-line">
        <div className="max-w-[1320px] mx-auto px-7">
          <SectionHead
            label="All mentions"
            deva="कवरेज"
            title={<>The full archive.</>}
            right={
              <div className="flex gap-2 flex-wrap">
                {types.map((t) => (
                  <button key={t} onClick={() => setFilter(t)}
                          className={`px-3 py-2 border text-[11px] tracking-[.2em] uppercase transition-colors ${filter === t ? 'bg-saffron text-bg border-saffron' : 'border-line text-ink-mute hover:text-ink'}`}>
                    {t}
                  </button>
                ))}
              </div>
            }
          />
          <div className="border-t border-line">
            {filtered.map((p, i) => (
              <FadeContent key={p._id} delay={(i % 5) * 0.04}>
                <a href={p.url || '#'} target="_blank" rel="noopener noreferrer"
                   className="group grid md:grid-cols-[120px_1fr_220px_60px] gap-6 items-center py-8 border-b border-line hover:pl-4 transition-all">
                  <span className="label-tag text-mustard">{p.type}</span>
                  <div>
                    <h4 className="font-display text-xl md:text-2xl">{p.title}</h4>
                    {p.excerpt && <p className="text-ink-mute text-sm mt-1 leading-relaxed">{p.excerpt}</p>}
                  </div>
                  <div className="label-tag normal-case tracking-[.14em] text-ink-mute text-[12px]">
                    {p.publication}<br />
                    <span className="text-[10px] tracking-[.2em] uppercase">{p.date ? new Date(p.date).toLocaleDateString() : ''}</span>
                  </div>
                  <div className="font-display text-2xl text-ink-mute group-hover:text-saffron group-hover:translate-x-1 transition-all text-right">↗</div>
                </a>
              </FadeContent>
            ))}
            {filtered.length === 0 && <p className="label-tag text-ink-mute text-center p-10">No entries match this filter.</p>}
          </div>
        </div>
      </section>
    </>
  )
}
