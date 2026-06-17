import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import Section, { SectionHead } from '../components/Section.jsx'
import { SplitText, FadeContent, Magnet, DarkVeil } from '../components/bits/index.jsx'
import SEOHead from '../components/SEOHead.jsx'
import { useCopy } from '../lib/copy.jsx'

export const slugify = (s = '') => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export default function ServiceDetail() {
  const { slug } = useParams()
  const s = useCopy('services') || {}
  const items = s.items || []
  const svc = items.find((it) => (it.slug || slugify(it.en)) === slug)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    if (!svc) return
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    const cat = svc.category || svc.en
    axios.get(`${api}/portfolio?category=${encodeURIComponent(cat)}`)
      .then((r) => setProjects(r.data?.items || []))
      .catch(() => {})
  }, [slug, svc])

  if (!svc) {
    return (
      <div className="pt-44 pb-32 max-w-[1320px] mx-auto px-7">
        <div className="label-tag">404 · Not found</div>
        <h1 className="font-display text-6xl mt-3">No service at that URL.</h1>
        <Link to="/services" className="inline-block mt-8 px-6 py-3 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg">All services →</Link>
      </div>
    )
  }

  const capabilities = Array.isArray(svc.capabilities)
    ? svc.capabilities
    : String(svc.desc || '').split('·').map((x) => x.trim()).filter(Boolean)

  return (
    <>
      <SEOHead overrides={{ title: `${svc.en} · KALAAKAARI`, description: svc.desc || `${svc.en} services from KALAAKAARI.` }} />

      <section className="relative pt-44 pb-16 overflow-hidden">
        <DarkVeil />
        <div className="max-w-[1320px] mx-auto px-7 relative">
          <Link to="/services" className="label-tag text-ink-mute hover:text-saffron transition-colors">← All services</Link>
          <div className="label-tag text-saffron mt-6">№ {svc.n || ''}</div>
          <h1 className="font-display mt-3 leading-[.9]" style={{ fontSize: 'clamp(60px,10vw,180px)', letterSpacing: '-.02em' }}>
            <SplitText text={svc.en} by="word" />
          </h1>
          {svc.deva && <p className="font-deva text-mustard mt-3" style={{ fontSize: 'clamp(18px,2vw,28px)' }}>{svc.deva}</p>}
          {svc.body && <p className="font-serif-i text-parchment mt-8 max-w-3xl leading-relaxed" style={{ fontSize: 'clamp(20px,2.4vw,30px)' }}>{svc.body}</p>}

          {capabilities.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-9">
              {capabilities.map((c) => (
                <span key={c} className="px-4 py-2 border border-line rounded-full text-[12px] tracking-[.16em] uppercase text-ink-mute">{c}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {projects.length > 0 && (
        <Section className="py-28 border-t border-line">
          <SectionHead label="Selected work" deva="चुनिंदा कार्य" title={`${svc.en} in practice.`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
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

      <section className="py-28 text-center relative overflow-hidden border-t border-line">
        <DarkVeil />
        <div className="max-w-[1320px] mx-auto px-7 relative">
          <h2 className="font-display" style={{ fontSize: 'clamp(40px,6vw,100px)', letterSpacing: '-.02em' }}>Have a {svc.en.toLowerCase()} brief?</h2>
          <Magnet>
            <Link to="/contact" className="inline-flex mt-9 items-center gap-3 px-8 py-5 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard transition-colors">Start a project →</Link>
          </Magnet>
        </div>
      </section>
    </>
  )
}
