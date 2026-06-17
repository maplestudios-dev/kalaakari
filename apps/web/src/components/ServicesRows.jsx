import { Link } from 'react-router-dom'
import Section, { SectionHead } from './Section.jsx'
import { FadeContent, SpotlightCard } from './bits/index.jsx'
import { useCopy } from '../lib/copy.jsx'
import { slugify } from '../pages/ServiceDetail.jsx'

export default function ServicesRows() {
  const s = useCopy('services') || {}
  return (
    <section id="services" className="py-32 bg-bg-2 border-y border-line">
      <div className="max-w-[1320px] mx-auto px-7">
        <SectionHead
          label={s.eyebrow}
          deva={s.eyebrowDeva}
          title={(s.title || '').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
        />
        <FadeContent>
          <p className="font-serif-i text-ink-mute text-lg max-w-2xl leading-relaxed mb-10">{s.intro}</p>
        </FadeContent>

        {(s.items || []).map((it, i) => (
          <FadeContent key={it.n} delay={i * 0.04}>
            <SpotlightCard>
              <Link to={`/services/${it.slug || slugify(it.en)}`} className="group grid items-center gap-6 md:gap-8 py-9 border-t border-line transition-all duration-300 hover:pl-6 relative overflow-hidden"
                style={{ gridTemplateColumns: '60px 1fr 60px' }}>
                <span className="absolute inset-0 bg-gradient-to-r from-saffron/5 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <div className="font-display text-3xl text-ink-mute group-hover:text-saffron transition-colors">{it.n}</div>
                <div className="md:grid md:grid-cols-[280px_1fr] gap-8 items-center">
                  <h3 className="font-display" style={{ fontSize: 'clamp(28px,3.5vw,52px)' }}>
                    {it.en}
                    <span className="block font-deva text-mustard text-base font-light mt-1">{it.deva}</span>
                  </h3>
                  <p className="hidden md:block text-ink-mute leading-relaxed">{it.desc}</p>
                </div>
                <div className="font-display text-3xl text-ink-mute group-hover:text-saffron group-hover:translate-x-2 transition-all text-right">→</div>
              </Link>
            </SpotlightCard>
          </FadeContent>
        ))}
      </div>
    </section>
  )
}
