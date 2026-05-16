import Section, { SectionHead } from '../components/Section.jsx'
import { SplitText, FadeContent, SpotlightCard, DarkVeil } from '../components/bits/index.jsx'

const values = [
  { t: 'Craft over filler', d: 'A line nobody reads is a line we don\'t ship. The work is the receipt.' },
  { t: 'Strategy before surface', d: 'Beautiful work that says nothing is decoration. We start with a sharper question.' },
  { t: 'Senior-led thinking', d: 'No layered hand-offs. The brain on your brief is the hand on your keyboard.' },
  { t: 'Cultural instinct', d: 'We read the room before we read the brief. Delhi taught us that.' },
  { t: 'Execution velocity', d: 'We don\'t mistake speed for shallowness. We just don\'t waste your time.' }
]

export default function About() {
  return (
    <>
      <section className="relative pt-44 pb-24 overflow-hidden">
        <DarkVeil />
        <div className="max-w-[1320px] mx-auto px-7 relative">
          <span className="label-tag">The Studio · <span className="font-deva text-mustard normal-case">परिचय</span></span>
          <h1 className="font-display mt-6" style={{ fontSize: 'clamp(80px,12vw,220px)', letterSpacing: '-.02em' }}>
            <SplitText text="We are the" by="word" />
            <br />
            <span className="font-serif-i font-light text-saffron">
              <SplitText text="kalaakaars." by="word" delay={0.35} />
            </span>
          </h1>
          <p className="font-serif-i text-parchment mt-8 max-w-3xl text-2xl leading-relaxed">
            Built in Delhi. Wired for craft. We are a senior-led studio of strategists, writers, designers, art directors, and filmmakers — making brands that earn attention without begging for it.
          </p>
        </div>
      </section>

      <Section className="py-32">
        <SectionHead label="The Story" deva="कथा" title="Kalaa. Kaari. Kalaakaari." />
        <div className="grid md:grid-cols-3 gap-12 font-serif-i text-ink-mute text-lg leading-relaxed">
          <FadeContent>
            <p className="font-display text-saffron text-3xl mb-4 leading-none">Kalaa <span className="font-deva block text-mustard text-lg mt-2">कला</span></p>
            <p>The art. The frame. The line of code that has rhythm. The 27-second cut that lands. The serif that says what sans never could.</p>
          </FadeContent>
          <FadeContent delay={0.1}>
            <p className="font-display text-saffron text-3xl mb-4 leading-none">Kaari <span className="font-deva block text-mustard text-lg mt-2">कारी</span></p>
            <p>The maker. The doer. The one who takes the soft thing in their head and makes it land in the world. Conviction with calluses.</p>
          </FadeContent>
          <FadeContent delay={0.2}>
            <p className="font-display text-saffron text-3xl mb-4 leading-none">Kalaakaari <span className="font-deva block text-mustard text-lg mt-2">कलाकारी</span></p>
            <p>Craft put into motion. Not a noun. A verb. What happens when taste, strategy and execution stop fighting each other.</p>
          </FadeContent>
        </div>
      </Section>

      <section className="py-32 bg-bg-2 border-y border-line">
        <div className="max-w-[1320px] mx-auto px-7">
          <SectionHead label="What we believe" deva="मूल्य" title="Studio values." />
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, i) => (
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
        <SectionHead label="Where we live" deva="दिल्ली" title="Born in Delhi. Built for the world." />
        <FadeContent>
          <p className="font-serif-i text-ink-mute text-xl leading-relaxed max-w-3xl">
            Delhi is loud, layered, and unfinished. It teaches you to hold contradictions: ancient and current, holy and hustling, polished and unhinged. The best brands feel the same way. We make work that comes from this city without being limited by it.
          </p>
        </FadeContent>
      </Section>
    </>
  )
}
