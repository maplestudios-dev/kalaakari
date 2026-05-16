import Section, { SectionHead } from './Section.jsx'
import { FadeContent, SpotlightCard } from './bits/index.jsx'
import { useCopy } from '../lib/copy.jsx'

export default function Pillars() {
  const p = useCopy('pillars') || {}
  const items = p.items || []
  return (
    <Section className="py-32">
      <SectionHead
        label={p.eyebrow}
        deva={p.eyebrowDeva}
        title={(p.title || '').split('\n').map((line, i) => <span key={i} className="block">{line}</span>)}
        right={<span className="label-tag max-w-xs leading-relaxed normal-case tracking-[.08em] text-ink-mute">{p.intro}</span>}
      />
      <div>
        {items.map((it, i) => {
          const reverse = i === 1
          return (
            <FadeContent key={it.n} delay={i * 0.06}>
              <SpotlightCard>
                <div className={`grid items-center gap-10 py-16 border-t border-line ${reverse ? 'md:grid-cols-[1fr_1fr_80px]' : 'md:grid-cols-[80px_1fr_1fr]'} grid-cols-[50px_1fr] ${i === items.length - 1 ? 'border-b' : ''}`}>
                  <div className={`font-display text-saffron text-5xl ${reverse ? 'md:order-3 md:text-right' : ''}`}>{it.n}</div>
                  <h3 className={`font-display ${reverse ? 'md:order-2 md:text-right' : ''} col-span-2 md:col-span-1`}
                      style={{ fontSize: 'clamp(54px,8vw,128px)' }}>
                    {it.en}
                    <span className="block font-deva text-mustard mt-2" style={{ fontSize: '.28em', letterSpacing: 0 }}>{it.deva}</span>
                  </h3>
                  <p className={`font-serif-i text-ink-mute max-w-md leading-relaxed col-span-2 md:col-span-1 ${reverse ? 'md:order-1' : ''}`} style={{ fontSize: 17 }}>
                    {it.body}
                  </p>
                </div>
              </SpotlightCard>
            </FadeContent>
          )
        })}
      </div>
    </Section>
  )
}
