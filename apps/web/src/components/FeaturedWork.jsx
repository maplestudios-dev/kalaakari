import { Link } from 'react-router-dom'
import Section, { SectionHead } from './Section.jsx'
import { FadeContent, TiltedCard, Magnet } from './bits/index.jsx'

const projects = [
  { id: 1, slug: 'hauz-khas-collective', en: 'Hauz Khas Collective', deva: 'हौज़ ख़ास', cat: 'Branding', sub: 'Brand Identity · 2025', span: 's6', featured: true, visual: 'HAUZ KHAS' },
  { id: 2, slug: 'namkeen-republic', en: 'Namkeen Republic', deva: 'नमकीन गणराज्य', cat: 'Campaign', sub: '360° Launch · 2025', result: '4.2M Impressions', span: 's6', visual: 'NAMKEEN' },
  { id: 3, slug: 'studio-tamas', en: 'Studio Tamas', deva: 'तमस', cat: 'Identity', sub: 'Visual Identity', span: 's4', visual: 'TAMAS' },
  { id: 4, slug: 'bombay-club', en: 'The Bombay Club', deva: 'बम्बई क्लब', cat: 'Content', sub: 'Content · Social', result: '0 → 180K · 8 mo', span: 's4', visual: 'BOMBAY' },
  { id: 5, slug: 'aroha-jewels', en: 'Aroha Jewels', deva: 'आरोहा', cat: 'Production', sub: 'Film & Production', result: '3× revenue', span: 's4', visual: 'AROHA' },
  { id: 6, slug: 'urban-apothecary', en: 'Urban Apothecary', deva: 'अर्बन ऐपोथिकेरी', cat: 'Motion Design', sub: 'Brand & Motion · 2024', span: 's8', visual: 'URBAN APOTHECARY' },
  { id: 7, slug: 'atelier-lota', en: 'Atelier Lota', deva: 'अटेलियर', cat: 'Digital', sub: 'Digital · UX', span: 's4', visual: 'ATELIER' }
]

export default function FeaturedWork() {
  return (
    <Section id="work" className="py-32">
      <SectionHead
        label="Selected Work"
        deva="चुनिंदा कार्य"
        title={<>Sneak peek into<br />what we're up to.</>}
        right={
          <Magnet>
            <Link to="/work" className="inline-flex items-center gap-3 px-7 py-4 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg transition-colors">
              View All Work →
            </Link>
          </Magnet>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {projects.map((p, i) => (
          <FadeContent
            key={p.id}
            delay={(i % 3) * 0.08}
            className={
              p.span === 's6' ? 'md:col-span-6' :
              p.span === 's4' ? 'md:col-span-4' :
              p.span === 's8' ? 'md:col-span-8' : 'md:col-span-6'
            }
          >
            <ProjectCard p={p} />
          </FadeContent>
        ))}
      </div>
    </Section>
  )
}

function ProjectCard({ p }) {
  const card = (
    <Link to={`/work/${p.slug}`} className="group block relative bg-bg-2 border border-line overflow-hidden hover:border-saffron transition-colors">
      <div className="aspect-[4/3] relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#2a1810 0%,#0f0a07 100%)' }}>
        <span className="absolute top-4 left-4 z-10 label-tag text-mustard bg-bg/80 px-2.5 py-1.5 border border-line">{p.sub}</span>
        <span className="absolute top-4 right-4 z-10 font-display text-sm text-ink-mute">№{String(p.id).padStart(2,'0')}</span>
        {p.result && (
          <span className="absolute bottom-20 left-4 z-10 bg-saffron text-bg px-2.5 py-1 text-[10px] tracking-[.2em] uppercase font-semibold">{p.result}</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center font-display text-center px-6 transition-all duration-700 group-hover:scale-110"
          style={{ fontSize: 'clamp(48px,8vw,92px)', color: 'rgba(244,237,224,.07)', letterSpacing: '-.02em' }}>
          {p.visual}
        </span>
        <span className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(232,99,31,.18), transparent 60%)' }} />
      </div>
      <div className="px-5 py-5 border-t border-line flex items-end justify-between gap-3">
        <div>
          <h4 className="font-display text-2xl">{p.en}</h4>
          <span className="block font-deva text-mustard text-xs mt-1.5">{p.deva}</span>
        </div>
        <span className="label-tag">{p.cat}</span>
      </div>
    </Link>
  )
  return p.featured ? <TiltedCard className="will-change-transform">{card}</TiltedCard> : card
}
