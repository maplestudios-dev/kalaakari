import ServicesRows from '../components/ServicesRows.jsx'
import Section, { SectionHead } from '../components/Section.jsx'
import { SplitText, FadeContent, SpotlightCard, Magnet } from '../components/bits/index.jsx'
import { Link } from 'react-router-dom'

const clusters = [
  'Brand Launches', 'Campaign Systems', 'Social Media Ecosystems',
  'Website & Experience Design', 'Motion & Film', 'Performance Creative'
]

export default function Services() {
  return (
    <>
      <section className="pt-44 pb-12">
        <div className="max-w-[1320px] mx-auto px-7">
          <span className="label-tag">Capabilities · <span className="font-deva text-mustard normal-case">कुशलताएँ</span></span>
          <h1 className="font-display mt-6" style={{ fontSize: 'clamp(72px,11vw,200px)', letterSpacing: '-.02em' }}>
            <SplitText text="Six crafts." by="word" />
            <br />
            <span className="font-serif-i font-light text-saffron"><SplitText text="One studio." by="word" delay={0.3} /></span>
          </h1>
          <p className="font-serif-i text-parchment mt-8 max-w-3xl text-2xl leading-relaxed">
            From the first whiteboard scrawl to the final frame in market — we operate as one integrated studio, not six handoffs.
          </p>
        </div>
      </section>

      <ServicesRows />

      <Section className="py-32">
        <SectionHead label="Capability Clusters" deva="समूह" title="How we package the work." />
        <div className="grid md:grid-cols-3 gap-5">
          {clusters.map((c, i) => (
            <FadeContent key={c} delay={i * 0.05}>
              <SpotlightCard className="border border-line p-9 h-full">
                <div className="label-tag text-saffron">№ {String(i + 1).padStart(2, '0')}</div>
                <h3 className="font-display text-3xl mt-4">{c}</h3>
                <p className="font-serif-i text-ink-mute mt-3 leading-relaxed">Outcomes-led engagements that bundle our crafts into the shape your brand actually needs.</p>
              </SpotlightCard>
            </FadeContent>
          ))}
        </div>

        <FadeContent>
          <div className="mt-20 text-center">
            <Magnet>
              <Link to="/contact" className="inline-flex items-center gap-3 px-8 py-5 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard transition-colors">
                Discuss Your Project →
              </Link>
            </Magnet>
          </div>
        </FadeContent>
      </Section>
    </>
  )
}
