import { Link } from 'react-router-dom'
import { SplitText, FadeContent, Magnet, DarkVeil } from './bits/index.jsx'
import { useCopy } from '../lib/copy.jsx'

export default function FinalCTA() {
  const f = useCopy('finalCta') || {}
  return (
    <section className="relative py-44 text-center overflow-hidden">
      <DarkVeil />
      <div className="max-w-[1320px] mx-auto px-7 relative">
        <h2 className="font-display leading-[.86]" style={{ fontSize: 'clamp(64px,10vw,180px)', letterSpacing: '-.02em' }}>
          <SplitText text={f.title1 || ''} by="word" stagger={0.06} />
          <br />
          <span className="font-serif-i font-light text-saffron">
            <SplitText text={f.title2 || ''} by="word" stagger={0.06} delay={0.45} />
          </span>
        </h2>
        {f.deva && <FadeContent delay={0.65}><p className="font-deva text-mustard mt-6" style={{ fontSize: 'clamp(20px,2vw,28px)' }}>{f.deva}</p></FadeContent>}
        <FadeContent delay={0.85}>
          <div className="flex flex-wrap justify-center gap-4 mt-14">
            {f.ctaPrimary && (
              <Magnet>
                <Link to={f.ctaPrimary.to} className="inline-flex items-center gap-3 px-8 py-5 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard transition-colors">
                  {f.ctaPrimary.label}
                </Link>
              </Magnet>
            )}
            {f.ctaSecondary && (
              <Magnet>
                <Link to={f.ctaSecondary.to} className="inline-flex items-center gap-3 px-8 py-5 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg transition-colors">
                  {f.ctaSecondary.label}
                </Link>
              </Magnet>
            )}
          </div>
        </FadeContent>
      </div>
    </section>
  )
}
