import { Link } from 'react-router-dom'
import { FadeContent, CountUp, Magnet } from './bits/index.jsx'
import { useCopy } from '../lib/copy.jsx'

export default function AboutSnapshot() {
  const a = useCopy('about') || {}
  const titleLines = (a.title || '').split('\n')

  return (
    <section className="relative py-32 bg-bg-2 border-y border-line overflow-hidden">
      <span className="absolute -right-[4vw] -top-[6vh] font-deva pointer-events-none select-none"
        style={{ fontSize: 'clamp(220px,38vw,520px)', lineHeight: .8, color: 'rgba(232,99,31,.04)' }}>
        कलाकारी
      </span>

      <div className="max-w-[1320px] mx-auto px-7 relative grid md:grid-cols-[1fr_1.4fr] gap-20">
        <FadeContent>
          <h2 className="font-display leading-[.88]" style={{ fontSize: 'clamp(60px,9vw,160px)' }}>
            {titleLines.map((l, i) =>
              i === titleLines.length - 1
                ? <span key={i} className="block font-serif-i font-light text-saffron">{l}</span>
                : <span key={i} className="block">{l}</span>
            )}
          </h2>

          <dl className="mt-14">
            {(a.meta || []).map(([k, v]) => (
              <div key={k} className="flex justify-between py-4 border-b border-line label-tag normal-case tracking-[.16em]">
                <dt className="text-ink-mute">{k}</dt>
                <dd className="text-ink font-medium tracking-[.08em]">{v}</dd>
              </div>
            ))}
          </dl>
        </FadeContent>

        <FadeContent delay={0.15}>
          <span className="label-tag">{a.eyebrow}</span>
          <div className="font-serif-i text-ink-mute mt-4 max-w-xl leading-relaxed text-lg space-y-4">
            {(a.paragraphs || []).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {a.cta && (
            <Magnet>
              <Link to={a.cta.to} className="inline-flex items-center gap-3 mt-9 px-7 py-4 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg transition-colors">
                {a.cta.label}
              </Link>
            </Magnet>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-7 mt-12 pt-12 border-t border-line">
            {(a.metrics || []).map((m, i) => (
              <div key={i}>
                <div className="font-display text-mustard leading-none" style={{ fontSize: 'clamp(48px,5vw,80px)' }}>
                  <CountUp to={m.value} suffix={m.suffix || ''} />
                </div>
                <div className="label-tag mt-2">{m.label}</div>
              </div>
            ))}
          </div>
          {a.metricsFootnote && <p className="label-tag mt-4 normal-case tracking-[.08em] text-[10px]">{a.metricsFootnote}</p>}
        </FadeContent>
      </div>
    </section>
  )
}
