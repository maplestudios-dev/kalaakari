import ServicesRows from '../components/ServicesRows.jsx'
import Section, { SectionHead } from '../components/Section.jsx'
import { SplitText, FadeContent, SpotlightCard, Magnet } from '../components/bits/index.jsx'
import { Link } from 'react-router-dom'
import { useCopy } from '../lib/copy.jsx'

export default function Services() {
  const c = useCopy('pages.services') || {}
  const clusters = c.clusters || {}

  return (
    <>
      <section className="pt-32 sm:pt-44 pb-12">
        <div className="max-w-[1320px] mx-auto px-7">
          <span className="label-tag">{c.eyebrow} · <span className="font-deva text-mustard normal-case">{c.eyebrowDeva}</span></span>
          <h1 className="font-display mt-6 break-words" style={{ fontSize: 'clamp(48px,11vw,200px)', letterSpacing: '-.02em' }}>
            <SplitText text={c.title1 || ''} by="word" />
            <br />
            <span className="font-serif-i font-light text-saffron"><SplitText text={c.title2 || ''} by="word" delay={0.3} /></span>
          </h1>
          <p className="font-serif-i text-parchment mt-8 max-w-3xl text-2xl leading-relaxed">{c.sub}</p>
        </div>
      </section>

      <ServicesRows />

      <Section className="py-32">
        <SectionHead label={clusters.eyebrow} deva={clusters.eyebrowDeva} title={clusters.title} />
        <div className="grid md:grid-cols-3 gap-5">
          {(clusters.items || []).map((label, i) => (
            <FadeContent key={label} delay={i * 0.05}>
              <SpotlightCard className="border border-line p-9 h-full">
                <div className="label-tag text-saffron">№ {String(i + 1).padStart(2, '0')}</div>
                <h3 className="font-display text-3xl mt-4">{label}</h3>
                <p className="font-serif-i text-ink-mute mt-3 leading-relaxed">{clusters.itemBody}</p>
              </SpotlightCard>
            </FadeContent>
          ))}
        </div>

        {clusters.cta && (
          <FadeContent>
            <div className="mt-20 text-center">
              <Magnet>
                <Link to={clusters.cta.to} className="inline-flex items-center gap-3 px-8 py-5 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard transition-colors">
                  {clusters.cta.label}
                </Link>
              </Magnet>
            </div>
          </FadeContent>
        )}
      </Section>
    </>
  )
}
