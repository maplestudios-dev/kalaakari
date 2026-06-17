import { useEffect, useState } from 'react'
import axios from 'axios'
import Section, { SectionHead } from '../components/Section.jsx'
import { SplitText, FadeContent, SpotlightCard, Magnet, DarkVeil } from '../components/bits/index.jsx'
import SEOHead from '../components/SEOHead.jsx'
import { useCopy } from '../lib/copy.jsx'

const DEMO = [
  { _id: 'd1', role: 'Senior Brand Designer', department: 'Design', location: 'New Delhi', type: 'Full-time', description: 'Lead identity work across two to three retainers. Senior-led studio, no hand-offs.', requirements: ['5+ years in brand identity', 'A reel of identity systems, not just logos', 'Comfortable owning a client conversation'], applyEmail: 'careers@kalaakaari.in' },
  { _id: 'd2', role: 'Strategist · Brand & Culture', department: 'Strategy', location: 'New Delhi', type: 'Full-time', description: 'Write briefs nobody else can write. Help brands find a sharper edge.', requirements: ['3–5 years in brand or comms strategy', 'A point of view about Indian culture', 'You write well — short sentences first'], applyEmail: 'careers@kalaakaari.in' },
  { _id: 'd3', role: 'Senior Editor / Filmmaker', department: 'Production', location: 'New Delhi · Hybrid', type: 'Full-time', description: 'Own the cut. Drive the edit room on ad films and brand documentaries.', requirements: ['Premiere + Resolve fluency', 'A reel that moves us', 'Calm under deadline'], applyEmail: 'careers@kalaakaari.in' }
]

export default function Careers() {
  const c = useCopy('pages.careers') || {}
  const values = c.values || {}
  const roles  = c.roles || {}
  const spec   = c.speculative || {}
  const careersEmail = roles.contactEmail || 'careers@kalaakaari.in'

  const [jobs, setJobs] = useState(DEMO)
  const [usingApi, setUsingApi] = useState(false)

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    axios.get(`${api}/careers`).then((r) => {
      if (r.data?.items?.length) { setJobs(r.data.items); setUsingApi(true) }
    }).catch(() => {})
  }, [])

  return (
    <>
      <SEOHead overrides={{ title: 'Careers · KALAAKAARI', description: 'Open roles at KALAAKAARI — Delhi-born, senior-led, craft-first creative studio.' }} />

      <section className="relative pt-32 sm:pt-44 pb-24 overflow-hidden">
        <DarkVeil />
        <div className="max-w-[1320px] mx-auto px-7 relative">
          <span className="label-tag">{c.eyebrow} · <span className="font-deva text-mustard normal-case">{c.eyebrowDeva}</span></span>
          <h1 className="font-display mt-6 break-words" style={{ fontSize: 'clamp(48px,12vw,220px)', letterSpacing: '-.02em' }}>
            <SplitText text={c.title1 || ''} by="word" />
            <br />
            <span className="font-serif-i font-light text-saffron"><SplitText text={c.title2 || ''} by="word" delay={0.3} /></span>
          </h1>
          <p className="font-serif-i text-parchment mt-8 max-w-3xl text-2xl leading-relaxed">{c.sub}</p>
        </div>
      </section>

      {/* Values */}
      <Section className="py-32 border-t border-line">
        <SectionHead label={values.eyebrow} deva={values.eyebrowDeva} title={values.title} />
        <div className="grid md:grid-cols-2 gap-5">
          {(values.items || []).map((v, i) => (
            <FadeContent key={v.t} delay={i * 0.06}>
              <SpotlightCard className="border border-line p-9 h-full bg-bg-2">
                <h3 className="font-display text-3xl">{v.t}</h3>
                <p className="font-serif-i text-ink-mute mt-3 leading-relaxed">{v.d}</p>
              </SpotlightCard>
            </FadeContent>
          ))}
        </div>
      </Section>

      {/* Open roles */}
      <section className="py-32 bg-bg-2 border-y border-line">
        <div className="max-w-[1320px] mx-auto px-7">
          <SectionHead
            label={roles.eyebrow}
            deva={roles.eyebrowDeva}
            title={roles.title}
            right={<span className="label-tag text-ink-mute">{usingApi ? '' : 'Demo content — manage from admin · /careers'}</span>}
          />

          {jobs.length === 0 && (
            <FadeContent>
              <div className="border border-line p-16 text-center">
                <h3 className="font-display text-3xl">{roles.emptyTitle}</h3>
                <p className="font-serif-i text-ink-mute mt-3">{roles.emptyBody}</p>
              </div>
            </FadeContent>
          )}

          <div className="space-y-4">
            {jobs.map((j, i) => (
              <FadeContent key={j._id} delay={i * 0.05}>
                <a
                  href={`mailto:${j.applyEmail || careersEmail}?subject=${encodeURIComponent('Application: ' + j.role)}`}
                  className="group block border border-line bg-bg p-8 hover:border-saffron transition-colors"
                >
                  <div className="grid md:grid-cols-[2fr_1fr_auto] gap-6 items-start">
                    <div>
                      <h3 className="font-display text-3xl md:text-4xl">{j.role}</h3>
                      <p className="font-serif-i text-ink-mute mt-2 max-w-2xl leading-relaxed">{j.description}</p>
                      {j.requirements?.length > 0 && (
                        <ul className="mt-5 space-y-1.5 text-sm text-ink-mute">
                          {j.requirements.map((r, k) => (
                            <li key={k} className="flex gap-3"><span className="text-saffron">·</span>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="space-y-2 label-tag text-[11px] normal-case tracking-[.18em]">
                      <div className="text-ink">{j.department}</div>
                      <div className="text-ink-mute">{j.location}</div>
                      <div className="text-mustard">{j.type}</div>
                    </div>
                    <div className="font-display text-3xl text-ink-mute group-hover:text-saffron group-hover:translate-x-1 transition-all">→</div>
                  </div>
                </a>
              </FadeContent>
            ))}
          </div>
        </div>
      </section>

      {/* Speculative apply */}
      <section className="py-32 text-center relative overflow-hidden">
        <DarkVeil />
        <div className="max-w-[1320px] mx-auto px-7 relative">
          <h2 className="font-display" style={{ fontSize: 'clamp(48px,7vw,120px)', letterSpacing: '-.02em' }}>{spec.title}</h2>
          <p className="font-deva text-mustard mt-4" style={{ fontSize: 'clamp(18px,2vw,26px)' }}>{spec.deva}</p>
          <p className="font-serif-i text-parchment mt-6 max-w-2xl mx-auto text-xl leading-relaxed">{spec.body}</p>
          <Magnet>
            <a href={`mailto:${spec.ctaEmail || careersEmail}`} className="inline-flex mt-10 items-center gap-3 px-8 py-5 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard transition-colors">
              {spec.ctaLabel}
            </a>
          </Magnet>
        </div>
      </section>
    </>
  )
}
