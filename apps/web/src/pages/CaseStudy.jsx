import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import Section, { SectionHead } from '../components/Section.jsx'
import { SplitText, FadeContent, Magnet, TiltedCard, DarkVeil, CountUp } from '../components/bits/index.jsx'
import VideoTheater from '../components/VideoTheater.jsx'
import SEOHead from '../components/SEOHead.jsx'

const DEMO = {
  'hauz-khas-collective': {
    title: 'Hauz Khas Collective', client: 'Hauz Khas Collective', deva: 'हौज़ ख़ास', category: 'Branding', year: 2025,
    industry: 'Hospitality · Culture', cover: '',
    excerpt: 'Brand identity for a creator hub at the heart of HKV.',
    challenge: 'A 47-year-old courtyard restaurant in Hauz Khas Village wanted to reposition as a creator collective — coworking by day, supper club by night — without alienating the loyal regulars who knew it as a thali place. We had to honour the location\'s lived-in patina without slipping into nostalgia cosplay.',
    idea: 'We anchored the identity in the word "collective" as a verb, not a noun. The visual system uses overlapping rectangular plates — like trays in a dining hall — that recompose to host every output: menus, posters, social, room signage, even merch tags. The wordmark itself is two halves of a stamp that lock together.',
    execution: 'We delivered a full brand book, signage rollout across the property, the launch campaign films, and a Notion-based brand portal so the in-house team could publish without us. We also redesigned the take-away tin and the matchbox covers, which became the unexpected social-media star of the launch.',
    metrics: [{ label: 'Brand reach in launch month', value: '3.4M' }, { label: 'New cover stories landed', value: '7' }, { label: 'Reservations vs. prev. month', value: '+218%' }],
    services: ['Brand Strategy','Visual Identity','Naming','Art Direction','Launch Campaign'],
    tags: ['hospitality','identity','launch'],
    result: '+218% reservations · 3.4M reach · 7 press features'
  }
}

export default function CaseStudy() {
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [related, setRelated] = useState([])
  const [videos, setVideos] = useState([])
  const [playing, setPlaying] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true); setNotFound(false); setItem(null); setVideos([])
    const api = import.meta.env.VITE_API_URL
    if (!api) {
      const demo = DEMO[slug]
      if (demo) setItem({ ...demo, slug })
      else setNotFound(true)
      setLoading(false)
      return
    }
    Promise.all([
      axios.get(`${api}/portfolio/${slug}`).catch(() => null),
      axios.get(`${api}/portfolio`).catch(() => ({ data: { items: [] } })),
      axios.get(`${api}/video?projectSlug=${encodeURIComponent(slug)}`).catch(() => ({ data: { items: [] } }))
    ]).then(([itemRes, listRes, videoRes]) => {
      if (!itemRes?.data?.item) {
        const demo = DEMO[slug]
        if (demo) setItem({ ...demo, slug })
        else setNotFound(true)
      } else {
        setItem(itemRes.data.item)
      }
      const list = listRes.data.items || []
      setRelated(list.filter((p) => p.slug !== slug).slice(0, 3))
      setVideos(videoRes.data?.items || [])
    }).finally(() => setLoading(false))
  }, [slug])

  const jsonLd = useMemo(() => {
    if (!item) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      'name': item.title,
      'creator': { '@type': 'Organization', 'name': 'KALAAKAARI' },
      'about': item.category,
      'dateCreated': item.year ? String(item.year) : undefined,
      'description': item.excerpt
    }
  }, [item])

  if (loading) return <div className="pt-44 pb-24 max-w-[1320px] mx-auto px-7 text-ink-mute label-tag">Loading…</div>

  if (notFound || !item) {
    return (
      <div className="pt-44 pb-32 max-w-[1320px] mx-auto px-7">
        <div className="label-tag">404 · Not found</div>
        <h1 className="font-display text-6xl mt-3">No project at that slug.</h1>
        <p className="font-serif-i text-ink-mute mt-4 text-xl">It may have been unpublished, or the URL is wrong.</p>
        <Link to="/work" className="inline-block mt-8 px-6 py-3 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg">Back to all work →</Link>
      </div>
    )
  }

  return (
    <>
      <SEOHead overrides={{
        title: `${item.title} · KALAAKAARI`,
        description: item.excerpt || `${item.category} · ${item.client}`,
        ogImage: item.cover,
        schemaJSONLD: jsonLd
      }} />

      {/* ─── HERO ────────────────────── */}
      <section className="relative pt-40 pb-16 overflow-hidden">
        <DarkVeil />
        <div className="max-w-[1320px] mx-auto px-7 relative">
          <Link to="/work" className="label-tag text-ink-mute hover:text-saffron transition-colors">← All work</Link>

          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mt-6">
            <span className="label-tag text-mustard">{item.category}</span>
            {item.year && <span className="label-tag">{item.year}</span>}
            {item.industry && <span className="label-tag">{item.industry}</span>}
          </div>

          {/* Client identity — logo alone when available; name only as fallback */}
          {(item.clientLogo || item.client) && (
            <div className="mt-7">
              {item.clientLogo
                ? <img src={item.clientLogo} alt={item.client || 'Client'} className="h-12 md:h-16 w-auto object-contain" />
                : <span className="font-display text-3xl md:text-5xl text-ink">{item.client}</span>}
            </div>
          )}

          <h1 className="font-display mt-4 leading-[.9]" style={{ fontSize: 'clamp(60px,10vw,180px)', letterSpacing: '-.02em' }}>
            <SplitText text={item.title} by="word" />
          </h1>
          {item.deva && <p className="font-deva text-mustard mt-3" style={{ fontSize: 'clamp(18px,2vw,28px)' }}>{item.deva}</p>}
          {item.excerpt && (
            <FadeContent delay={0.3}>
              <p className="font-serif-i text-parchment mt-8 max-w-3xl leading-relaxed" style={{ fontSize: 'clamp(20px,2.4vw,30px)' }}>
                {item.excerpt}
              </p>
            </FadeContent>
          )}
        </div>
      </section>

      {/* ─── COVER MEDIA ─────────────── */}
      <section className="pb-24">
        <div className="max-w-[1320px] mx-auto px-7">
          <FadeContent>
            <div className="aspect-[16/9] bg-bg-2 border border-line relative overflow-hidden"
                 style={{ background: (item.coverWide || item.cover)
                   ? `url(${item.coverWide || item.cover}) center/cover no-repeat`
                   : 'linear-gradient(135deg,#2a1810 0%,#0f0a07 100%)' }}>
              {!(item.coverWide || item.cover) && (
                <span className="absolute inset-0 flex items-center justify-center font-display text-center px-8"
                      style={{ fontSize: 'clamp(48px,8vw,140px)', color: 'rgba(244,237,224,.07)', letterSpacing: '-.02em' }}>
                  {item.title}
                </span>
              )}
              {item.video && (
                <video src={item.video} controls className="absolute inset-0 w-full h-full object-cover" />
              )}
            </div>
          </FadeContent>
        </div>
      </section>

      {/* ─── META STRIP ──────────────── */}
      <section className="border-y border-line bg-bg-2 py-10">
        <div className="max-w-[1320px] mx-auto px-7 grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetaBlock label="Client" value={item.client || '—'} />
          <MetaBlock label="Year"   value={item.year || '—'} />
          <MetaBlock label="Industry" value={item.industry || '—'} />
          <MetaBlock label="Services" value={(item.services || []).slice(0,2).join(' · ') || item.category} />
        </div>
      </section>

      {/* ─── NARRATIVE ──────────────── */}
      <Section className="py-32">
        <div className="grid md:grid-cols-[200px_1fr] gap-12 max-w-5xl">
          {item.challenge && <Chapter n="01" label="The Challenge" body={item.challenge} />}
        </div>
      </Section>
      <Section className="pb-32">
        <div className="grid md:grid-cols-[200px_1fr] gap-12 max-w-5xl ml-auto">
          {item.idea && <Chapter n="02" label="The Thinking" body={item.idea} accent />}
        </div>
      </Section>
      <Section className="pb-32">
        <div className="grid md:grid-cols-[200px_1fr] gap-12 max-w-5xl">
          {item.execution && <Chapter n="03" label="The Execution" body={item.execution} />}
        </div>
      </Section>

      {/* ─── METRICS ────────────────── */}
      {item.metrics?.length > 0 && (
        <section className="py-24 bg-bg-2 border-y border-line">
          <div className="max-w-[1320px] mx-auto px-7">
            <FadeContent>
              <span className="label-tag">04 · Results <span className="font-deva text-mustard normal-case">परिणाम</span></span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
                {item.metrics.map((m, i) => (
                  <FadeContent key={i} delay={i * 0.08}>
                    <div className="font-display text-mustard leading-none" style={{ fontSize: 'clamp(56px,8vw,120px)' }}>
                      <NumberOrCount v={m.value} />
                    </div>
                    <div className="label-tag mt-3">{m.label}</div>
                  </FadeContent>
                ))}
              </div>
              {item.result && !item.metrics && <p className="font-serif-i text-2xl text-saffron mt-6">{item.result}</p>}
            </FadeContent>
          </div>
        </section>
      )}

      {/* ─── GALLERY ────────────────── */}
      {item.gallery?.length > 0 && (
        <Section className="py-24">
          <SectionHead label="The work" deva="गैलरी" title="Selected outputs." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {item.gallery.map((src, i) => (
              <FadeContent key={i} delay={(i % 3) * 0.06}>
                <div className="aspect-[4/3] bg-bg-2 border border-line overflow-hidden"
                     style={{ background: `url(${src}) center/cover no-repeat` }} />
              </FadeContent>
            ))}
          </div>
        </Section>
      )}

      {/* ─── SERVICES + TAGS ───────── */}
      {((item.services?.length > 0) || (item.tags?.length > 0)) && (
        <Section className="py-16">
          <div className="grid md:grid-cols-2 gap-12 border-t border-line pt-14">
            {item.services?.length > 0 && (
              <div>
                <span className="label-tag mb-4 block">Services we shipped</span>
                <div className="flex flex-wrap gap-2">
                  {item.services.map((s) => (
                    <span key={s} className="px-3 py-1.5 border border-line text-[11px] tracking-[.18em] uppercase text-ink-mute">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {item.tags?.length > 0 && (
              <div>
                <span className="label-tag mb-4 block">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <span key={t} className="px-3 py-1.5 border border-line rounded-full text-[11px] tracking-[.18em] uppercase text-mustard">#{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ─── LINKED VIDEOS ──────────── */}
      {videos.length > 0 && (
        <Section className="py-24 border-t border-line">
          <SectionHead label="The film" deva="फ़िल्म" title={videos.length > 1 ? 'Films from this project.' : 'The film for this project.'} />
          <div className={`grid gap-5 ${videos.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
            {videos.map((v) => (
              <FadeContent key={v._id}>
                <button onClick={() => setPlaying(v)} className="block w-full text-left group">
                  <div className="relative aspect-video bg-bg-2 border border-line overflow-hidden hover:border-saffron transition-colors"
                       style={v.poster ? { background: `url(${v.poster}) center/cover no-repeat` } : { background: 'linear-gradient(135deg,#2a1810,#0a0805)' }}>
                    {!v.poster && (
                      <div className="absolute inset-0 grid place-items-center font-display text-ink-mute/15 text-center px-6"
                           style={{ fontSize: 'clamp(28px,4vw,56px)' }}>{v.title}</div>
                    )}
                    <span className="absolute top-3 left-3 label-tag text-mustard bg-bg/80 px-2 py-1 border border-line">{v.category}</span>
                    {v.duration && <span className="absolute top-3 right-3 font-display text-xs text-ink-mute bg-bg/80 px-2 py-0.5 border border-line">{v.duration}s</span>}
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="w-16 h-16 rounded-full bg-saffron grid place-items-center group-hover:scale-110 transition-transform"><span className="text-bg ml-0.5 text-lg">▶</span></div>
                    </div>
                  </div>
                  <h4 className="font-display text-xl mt-3">{v.title}</h4>
                  {v.excerpt && <p className="font-serif-i text-ink-mute text-sm mt-1.5 leading-relaxed">{v.excerpt}</p>}
                </button>
              </FadeContent>
            ))}
          </div>
        </Section>
      )}

      {/* ─── RELATED ────────────────── */}
      {related.length > 0 && (
        <Section className="py-32 border-t border-line">
          <SectionHead label="More work" deva="अधिक" title={<>Other things we've<br />made recently.</>} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((p, i) => (
              <FadeContent key={p._id || p.slug} delay={i * 0.06}>
                <Link to={`/work/${p.slug}`} className="group block bg-bg-2 border border-line overflow-hidden hover:border-saffron transition-colors">
                  <div className="aspect-[4/3] relative overflow-hidden"
                       style={p.cover
                         ? { background: `linear-gradient(180deg, transparent 50%, rgba(11,10,8,.45)), url(${p.cover}) center/cover no-repeat` }
                         : { background: 'linear-gradient(135deg,#2a1810,#0f0a07)' }}>
                    <span className="absolute top-4 left-4 z-10 label-tag text-mustard bg-bg/80 px-2.5 py-1.5 border border-line">{p.category} · {p.year}</span>
                    {!p.cover && (
                      <span className="absolute inset-0 flex items-center justify-center font-display text-center px-6 transition-all duration-700 group-hover:scale-110"
                            style={{ fontSize: 'clamp(40px,6vw,80px)', color: 'rgba(244,237,224,.07)' }}>{p.title}</span>
                    )}
                    <span className="absolute inset-0 pointer-events-none transition-all duration-500"
                          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(232,99,31,.15), transparent 60%)' }} />
                  </div>
                  <div className="px-5 py-5 border-t border-line">
                    <h4 className="font-display text-2xl">{p.title}</h4>
                    {p.deva && <span className="block font-deva text-mustard text-xs mt-1.5">{p.deva}</span>}
                  </div>
                </Link>
              </FadeContent>
            ))}
          </div>
        </Section>
      )}

      {/* ─── CTA ───────────────────── */}
      <section className="py-32 text-center relative overflow-hidden">
        <DarkVeil />
        <div className="max-w-[1320px] mx-auto px-7 relative">
          <h2 className="font-display" style={{ fontSize: 'clamp(48px,7vw,120px)', letterSpacing: '-.02em' }}>
            Want one of these?
          </h2>
          <p className="font-deva text-mustard mt-4" style={{ fontSize: 'clamp(18px,2vw,26px)' }}>आपके लिए?</p>
          <Magnet>
            <Link to="/contact" className="inline-flex mt-8 items-center gap-3 px-8 py-5 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard transition-colors">
              Start a project →
            </Link>
          </Magnet>
        </div>
      </section>

      <VideoTheater video={playing} onClose={() => setPlaying(null)} />
    </>
  )
}

function MetaBlock({ label, value }) {
  return (
    <div>
      <div className="label-tag text-ink-mute">{label}</div>
      <div className="font-display text-2xl mt-1.5">{value}</div>
    </div>
  )
}

function Chapter({ n, label, body, accent }) {
  return (
    <>
      <FadeContent>
        <div className="font-display text-saffron text-3xl">{n}</div>
        <div className="label-tag mt-2">{label}</div>
      </FadeContent>
      <FadeContent delay={0.1}>
        <p className={`leading-relaxed text-xl font-serif-i ${accent ? 'text-parchment' : 'text-ink-mute'}`} style={{ fontSize: 'clamp(20px,2.2vw,28px)' }}>
          {body}
        </p>
      </FadeContent>
    </>
  )
}

function NumberOrCount({ v }) {
  // if the value parses cleanly as a number, animate it; otherwise show as-is (e.g. "3.4M", "+218%")
  const cleaned = String(v).replace(/[^0-9.]/g, '')
  const num = +cleaned
  if (!cleaned || Number.isNaN(num) || cleaned.length > 6) return <>{v}</>
  // strip the numeric portion, keep the suffix prefix
  const suffix = String(v).slice(String(v).indexOf(cleaned) + cleaned.length)
  const prefix = String(v).slice(0, String(v).indexOf(cleaned))
  return <>{prefix}<CountUp to={Math.round(num)} suffix={suffix} duration={1.4} /></>
}
