import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import Section, { SectionHead } from '../components/Section.jsx'
import { SplitText, FadeContent, Magnet, DarkVeil } from '../components/bits/index.jsx'
import VideoTheater from '../components/VideoTheater.jsx'
import SEOHead from '../components/SEOHead.jsx'
import { useCopy } from '../lib/copy.jsx'
import { posterFor } from '../lib/videoEmbed.js'

export const slugify = (s = '') => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export default function ServiceDetail() {
  const { slug } = useParams()
  const s = useCopy('services') || {}
  const items = s.items || []
  // Copy-based fallback service (used if the API has nothing yet)
  const copySvc = items.find((it) => (it.slug || slugify(it.en)) === slug)

  const [svc, setSvc] = useState(null)
  const [work, setWork] = useState([])
  const [videos, setVideos] = useState([])
  const [playing, setPlaying] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) { setLoaded(true); return }
    axios.get(`${api}/services/${slug}`)
      .then((r) => {
        const doc = r.data?.item
        if (doc) {
          setSvc(doc)
          setWork(doc.workProjects || [])
          setVideos(doc.videos || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [slug])

  // Resolve the data to render — API service first, else copy fallback.
  const view = svc
    ? { name: svc.name, deva: svc.deva, number: svc.number, body: svc.body || svc.description, capabilities: svc.capabilities || [] }
    : copySvc
      ? { name: copySvc.en, deva: copySvc.deva, number: copySvc.n, body: copySvc.body, capabilities: Array.isArray(copySvc.capabilities) ? copySvc.capabilities : String(copySvc.desc || '').split('·').map((x) => x.trim()).filter(Boolean) }
      : null

  if (!view) {
    if (!loaded) return <div className="pt-44 pb-24 max-w-[1320px] mx-auto px-7 text-ink-mute label-tag">Loading…</div>
    return (
      <div className="pt-44 pb-32 max-w-[1320px] mx-auto px-7">
        <div className="label-tag">404 · Not found</div>
        <h1 className="font-display text-6xl mt-3">No service at that URL.</h1>
        <Link to="/services" className="inline-block mt-8 px-6 py-3 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg">All services →</Link>
      </div>
    )
  }

  return (
    <>
      <SEOHead overrides={{ title: `${view.name} · KALAAKAARI`, description: view.body || `${view.name} services from KALAAKAARI.` }} />

      <section className="relative pt-32 sm:pt-44 pb-16 overflow-hidden">
        <DarkVeil />
        <div className="max-w-[1320px] mx-auto px-7 relative">
          <Link to="/services" className="label-tag text-ink-mute hover:text-saffron transition-colors">← All services</Link>
          {view.number && <div className="label-tag text-saffron mt-6">№ {view.number}</div>}
          <h1 className="font-display mt-3 leading-[.9] break-words" style={{ fontSize: 'clamp(44px,10vw,180px)', letterSpacing: '-.02em' }}>
            <SplitText text={view.name} by="word" />
          </h1>
          {view.deva && <p className="font-deva text-mustard mt-3" style={{ fontSize: 'clamp(18px,2vw,28px)' }}>{view.deva}</p>}
          {view.body && <p className="font-serif-i text-parchment mt-8 max-w-3xl leading-relaxed" style={{ fontSize: 'clamp(18px,2.4vw,30px)' }}>{view.body}</p>}

          {view.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-9">
              {view.capabilities.map((c) => (
                <span key={c} className="px-4 py-2 border border-line rounded-full text-[12px] tracking-[.16em] uppercase text-ink-mute">{c}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Attached Work projects */}
      {work.length > 0 && (
        <Section className="py-24 border-t border-line">
          <SectionHead label="Selected work" deva="चुनिंदा कार्य" title={`${view.name} in practice.`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {work.map((p) => (
              <FadeContent key={p._id || p.slug}>
                <Link to={`/work/${p.slug}`} className="group block bg-bg-2 border border-line overflow-hidden hover:border-saffron transition-colors">
                  <div className="aspect-[4/3] relative overflow-hidden"
                       style={p.cover
                         ? { background: `linear-gradient(180deg, transparent 50%, rgba(11,10,8,.45)), url(${p.cover}) center/cover no-repeat` }
                         : { background: 'linear-gradient(135deg,#2a1810,#0f0a07)' }}>
                    {!p.cover && <span className="absolute inset-0 grid place-items-center font-display text-ink-mute/10 text-center px-4 text-3xl">{p.title}</span>}
                  </div>
                  <div className="px-5 py-5 border-t border-line flex items-end justify-between gap-3">
                    <h4 className="font-display text-xl">{p.title}</h4>
                    {p.client && p.client !== p.title && <span className="font-display text-xl text-ink-mute text-right shrink-0">{p.client}</span>}
                  </div>
                </Link>
              </FadeContent>
            ))}
          </div>
        </Section>
      )}

      {/* Attached Reel videos */}
      {videos.length > 0 && (
        <Section className="py-24 border-t border-line">
          <SectionHead label="In motion" deva="रील" title={`${view.name} on film.`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => (
              <FadeContent key={v._id || v.slug}>
                <button onClick={() => setPlaying(v)} className="block w-full text-left group">
                  <div className={`relative ${v.orientation === 'portrait' ? 'aspect-[9/16] max-w-[300px] mx-auto' : 'aspect-video'} bg-bg-2 border border-line overflow-hidden hover:border-saffron transition-colors`}
                       style={posterFor(v) ? { background: `url(${posterFor(v)}) center/cover no-repeat` } : undefined}>
                    {!posterFor(v) && <span className="absolute inset-0 grid place-items-center font-display text-ink-mute/15 text-center px-4 text-2xl">{v.title}</span>}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-saffron grid place-items-center"><span className="text-bg ml-0.5">▶</span></div>
                    </div>
                  </div>
                  <div className="px-1 py-4 flex justify-between items-end gap-3">
                    <h4 className="font-display text-xl">{v.title}</h4>
                    {v.client && v.client !== v.title && <span className="font-display text-xl text-ink-mute text-right shrink-0">{v.client}</span>}
                  </div>
                </button>
              </FadeContent>
            ))}
          </div>
        </Section>
      )}

      <section className="py-24 text-center relative overflow-hidden border-t border-line">
        <DarkVeil />
        <div className="max-w-[1320px] mx-auto px-7 relative">
          <h2 className="font-display" style={{ fontSize: 'clamp(40px,6vw,100px)', letterSpacing: '-.02em' }}>Have a {view.name.toLowerCase()} brief?</h2>
          <Magnet>
            <Link to="/contact" className="inline-flex mt-9 items-center gap-3 px-8 py-5 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard transition-colors">Start a project →</Link>
          </Magnet>
        </div>
      </section>

      <VideoTheater video={playing} onClose={() => setPlaying(null)} />
    </>
  )
}
