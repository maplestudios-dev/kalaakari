import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { SplitText, Magnet, ShinyText, DarkVeil } from './bits/index.jsx'
import { useCopy } from '../lib/copy.jsx'

export default function Hero() {
  const h = useCopy('hero')
  const [slides, setSlides] = useState([])
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    axios.get(`${api}/homepage`)
      .then((r) => setSlides((r.data?.homepage?.heroSlides || []).filter((s) => s.src)))
      .catch(() => {})
  }, [])

  const total = slides.length + 1          // built-in title slide + media slides
  const go = (i) => setIdx((i + total) % total)

  useEffect(() => {
    if (total <= 1 || paused) return
    const t = setInterval(() => setIdx((i) => (i + 1) % total), 6000)
    return () => clearInterval(t)
  }, [total, paused])

  return (
    <section className="relative overflow-hidden"
             onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Only the active slide is rendered, so the hero's height adapts to it —
          full-screen for the title, a tidy 16:9 band for media slides. */}
      {idx === 0
        ? <TitleSlide h={h} />
        : <MediaSlide slide={slides[idx - 1]} />}

      {total > 1 && (
        <>
          <button onClick={() => go(idx - 1)} aria-label="Previous slide"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 grid place-items-center rounded-full border border-line bg-bg/50 text-2xl text-ink hover:bg-saffron hover:text-bg transition-colors">‹</button>
          <button onClick={() => go(idx + 1)} aria-label="Next slide"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 grid place-items-center rounded-full border border-line bg-bg/50 text-2xl text-ink hover:bg-saffron hover:text-bg transition-colors">›</button>
          <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2.5 z-20">
            {Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${idx === i ? 'w-6 bg-saffron' : 'w-2 bg-ink-mute/40 hover:bg-ink-mute'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function TitleSlide({ h }) {
  return (
    <div className="relative min-h-screen pt-28 sm:pt-36 pb-16 sm:pb-20 overflow-hidden">
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
    </div>
  )
}

function MediaSlide({ slide }) {
  const external = /^https?:/i.test(slide.ctaHref || '')
  return (
    <div className="w-full px-4 sm:px-7 pt-24 sm:pt-28 pb-12 sm:pb-16">
      {/* 16:9 band — height comes from the frame itself, so no huge empty hero on mobile */}
      <div className="w-full max-w-[1280px] mx-auto">
        <div className="relative w-full aspect-video overflow-hidden border border-line bg-black">
          {slide.kind === 'video'
            ? <video src={slide.src} poster={slide.poster || undefined} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
            : <img src={slide.src} alt={slide.alt || ''} className="absolute inset-0 w-full h-full object-cover" />}
          {(slide.headline || slide.ctaLabel) && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/30 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 md:p-10">
                {slide.headline && <h2 className="font-display text-lg sm:text-3xl md:text-5xl max-w-2xl leading-[1.05] sm:leading-[.95]">{slide.headline}</h2>}
                {slide.sub && <p className="hidden sm:block font-serif-i text-parchment mt-3 max-w-xl text-base md:text-lg">{slide.sub}</p>}
                {slide.ctaLabel && slide.ctaHref && (
                  <Magnet>
                    {external
                      ? <a href={slide.ctaHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 mt-3 sm:mt-5 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-saffron text-bg text-[10px] sm:text-[12px] tracking-[.2em] sm:tracking-[.24em] uppercase hover:bg-mustard transition-colors">{slide.ctaLabel}</a>
                      : <Link to={slide.ctaHref} className="inline-flex items-center gap-3 mt-3 sm:mt-5 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-saffron text-bg text-[10px] sm:text-[12px] tracking-[.2em] sm:tracking-[.24em] uppercase hover:bg-mustard transition-colors">{slide.ctaLabel}</Link>}
                  </Magnet>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
