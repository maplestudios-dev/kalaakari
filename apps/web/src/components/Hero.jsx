import { Link } from 'react-router-dom'
import { SplitText, Magnet, ShinyText, DarkVeil } from './bits/index.jsx'
import { useCopy } from '../lib/copy.jsx'

export default function Hero() {
  const h = useCopy('hero')

  return (
    <section className="relative min-h-screen pt-36 pb-20 overflow-hidden">
      <DarkVeil />

      <span className="absolute left-[-3vw] top-[5vh] font-deva pointer-events-none select-none"
        style={{ fontSize: 'clamp(260px, 46vw, 680px)', lineHeight: .85, color: 'rgba(244,237,224,.035)' }}>
        क
      </span>
      <span className="absolute right-[-3vw] bottom-[-8vh] font-deva pointer-events-none select-none"
        style={{ fontSize: 'clamp(260px, 46vw, 680px)', lineHeight: .85, color: 'rgba(232,99,31,.045)' }}>
        ला
      </span>

      <div className="max-w-[1320px] mx-auto px-7 relative">
        <div className="flex flex-wrap justify-between gap-6 mb-14">
          <span className="label-tag flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-saffron shadow-[0_0_12px_var(--saffron)] animate-pulse" />
            <ShinyText>{h.eyebrow}</ShinyText>
          </span>
          <span className="label-tag">{h.coordinates}</span>
          <span className="label-tag">{h.established}</span>
        </div>

        <h1 className="font-display relative z-10"
          style={{ fontSize: 'clamp(72px, 16vw, 260px)', letterSpacing: '-.02em', lineHeight: 0.88 }}>
          <span className="block">
            <SplitText text={h.title1} by="word" />
          </span>
          <span className="block">
            <span className="font-serif-i text-saffron mr-4 inline-block align-baseline" style={{ fontSize: '.7em', transform: 'translateY(-.18em)' }}>{h.titleX}</span>
            <SplitText text={h.title2} by="word" delay={0.18} />
          </span>
        </h1>

        <p className="font-deva mt-4 text-mustard" style={{ fontSize: 'clamp(18px, 2vw, 26px)' }}>
          {h.deva}
        </p>

        <p className="font-serif-i text-parchment mt-5 max-w-3xl" style={{ fontSize: 'clamp(20px, 2.4vw, 30px)' }}>
          {h.sub}
        </p>

        <p className="text-ink-mute mt-9 max-w-xl leading-relaxed">{h.body}</p>

        <div className="flex flex-wrap gap-2 mt-9">
          {(h.chips || []).map((c) => (
            <span key={c} className="px-3.5 py-1.5 border border-line rounded-full text-[11px] tracking-[.2em] uppercase text-ink-mute hover:text-ink hover:border-saffron transition-colors">
              {c}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3.5 mt-11">
          <Magnet>
            <Link to={h.ctaPrimary.to} className="inline-flex items-center gap-3 px-7 py-4 bg-saffron text-bg border border-saffron text-[12px] tracking-[.24em] uppercase hover:bg-mustard hover:border-mustard transition-colors">
              {h.ctaPrimary.label}
            </Link>
          </Magnet>
          <Magnet>
            <Link to={h.ctaSecondary.to} className="inline-flex items-center gap-3 px-7 py-4 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg transition-colors">
              {h.ctaSecondary.label}
            </Link>
          </Magnet>
        </div>
      </div>

      <div className="hidden md:flex absolute bottom-7 inset-x-0 px-7 max-w-[1320px] mx-auto justify-between text-[10px] tracking-[.3em] uppercase text-ink-mute">
        <span>{h.bottomLeft}</span>
        <span>{h.bottomRight}</span>
      </div>
    </section>
  )
}
