import { SplitText, FadeContent } from './bits/index.jsx'
import { useCopy } from '../lib/copy.jsx'

export default function ManifestoQuote() {
  const m = useCopy('manifesto') || {}
  return (
    <section className="relative py-44 text-center overflow-hidden">
      <span className="absolute inset-0 flex items-center justify-center font-deva italic pointer-events-none select-none"
        style={{ fontSize: 'clamp(280px,40vw,540px)', color: 'rgba(232,99,31,.05)', lineHeight: 1 }}>
        कला
      </span>
      <div className="max-w-[1320px] mx-auto px-7 relative">
        <blockquote className="font-serif-i font-light leading-[1.05] max-w-5xl mx-auto"
          style={{ fontSize: 'clamp(36px,6vw,84px)', letterSpacing: '-.02em' }}>
          <SplitText text={`“${m.quotePart1 || ''}`} by="word" stagger={0.05} />
          <br />
          <span className="text-saffron"><SplitText text={`${m.quotePart2 || ''}”`} by="word" stagger={0.05} delay={0.4} /></span>
        </blockquote>
        {m.deva && <FadeContent delay={0.6}><p className="font-deva text-mustard mt-9" style={{ fontSize: 'clamp(20px,2vw,28px)' }}>{m.deva}</p></FadeContent>}
        {m.attribution && <FadeContent delay={0.8}><p className="label-tag mt-9">{m.attribution}</p></FadeContent>}
      </div>
    </section>
  )
}
