import Section, { SectionHead } from '../components/Section.jsx'
import { SplitText, FadeContent, SpotlightCard, DarkVeil } from '../components/bits/index.jsx'
import { useCopy } from '../lib/copy.jsx'

export default function About() {
  const c = useCopy('pages.about') || {}
  const story  = c.story  || {}
  const values = c.values || {}
  const delhi  = c.delhi  || {}

  return (
    <>
      <section className="relative pt-32 sm:pt-44 pb-24 overflow-hidden">
        <DarkVeil />
        <div className="max-w-[1320px] mx-auto px-7 relative">
          <span className="label-tag">{c.eyebrow} · <span className="font-deva text-mustard normal-case">{c.eyebrowDeva}</span></span>
          <h1 className="font-display mt-6 break-words" style={{ fontSize: 'clamp(48px,12vw,220px)', letterSpacing: '-.02em' }}>
            <SplitText text={c.title1 || ''} by="word" />
            <br />
            <span className="font-serif-i font-light text-saffron">
              <SplitText text={c.title2 || ''} by="word" delay={0.35} />
            </span>
          </h1>
          <p className="font-serif-i text-parchment mt-8 max-w-3xl text-2xl leading-relaxed">{c.sub}</p>
        </div>
      </section>

      <Section className="py-32">
        <SectionHead label={story.eyebrow} deva={story.eyebrowDeva} title={story.title} />
        <div className="grid md:grid-cols-3 gap-12 font-serif-i text-ink-mute text-lg leading-relaxed">
          {(story.items || []).map((it, i) => (
            <FadeContent key={i} delay={i * 0.1}>
              <p className="font-display text-saffron text-3xl mb-4 leading-none">{it.en} <span className="font-deva block text-mustard text-lg mt-2">{it.deva}</span></p>
              <p>{it.body}</p>
            </FadeContent>
          ))}
        </div>
      </Section>

      <section className="py-32 bg-bg-2 border-y border-line">
        <div className="max-w-[1320px] mx-auto px-7">
          <SectionHead label={values.eyebrow} deva={values.eyebrowDeva} title={values.title} />
          <div className="grid md:grid-cols-2 gap-6">
            {(values.items || []).map((v, i) => (
              <FadeContent key={v.t} delay={i * 0.06}>
                <SpotlightCard className="border border-line p-9 h-full">
                  <h3 className="font-display text-3xl">{v.t}</h3>
                  <p className="font-serif-i text-ink-mute mt-3 leading-relaxed">{v.d}</p>
                </SpotlightCard>
              </FadeContent>
            ))}
          </div>
        </div>
      </section>

      <Section className="py-32">
        <SectionHead label={delhi.eyebrow} deva={delhi.eyebrowDeva} title={delhi.title} />
        <FadeContent>
          <p className="font-serif-i text-ink-mute text-xl leading-relaxed max-w-3xl">{delhi.body}</p>
        </FadeContent>
      </Section>
    </>
  )
}
