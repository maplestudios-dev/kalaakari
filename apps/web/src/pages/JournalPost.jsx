import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import Section from '../components/Section.jsx'
import { SplitText, FadeContent, Magnet, DarkVeil } from '../components/bits/index.jsx'
import SEOHead from '../components/SEOHead.jsx'

const DEMO_BODIES = {
  'kala-kaari-culture': `When we registered the studio, the first round of names was a list of nouns. Atelier this. Studio that. They felt like furniture. We wanted a name that did something.\n\nKalaakaari isn't a thing. It's the act of putting craft into motion — kala (the art) becoming kaari (the maker, the doer). A verb dressed up as a noun. That distinction matters in our work too. We don't sell brand guidelines. We sell the act of moving a brand from where it sits to where it could sit.\n\nThe rest is just consequence — typography choices, palette decisions, the way we structure a brief. They all fall out of the same idea: craft is a discipline, not a deliverable.`,
  'naming-against-the-grain': `Most naming projects end with a name nobody dislikes. That's not the same as a name that does work.\n\nThe naming brief for one of our most-shared launches asked for "approachable, modern, Indian." We delivered three names. Two were exactly that. The third — the one they chose — was deliberately abrasive, a bit hard to spell, and pronounced two different ways by two different people in the first review meeting.\n\nIt won because abrasion is memorable. Approachability is forgettable. The risk wasn't picking the strange name; it was picking the safe one.`,
  'campaign-that-earns-the-room': `A 27-second ad film either earns the next 60 seconds of attention or it doesn't. The work is to make sure it does. Not by being louder. By being specific.\n\nSpecificity is the most underrated tool in advertising. The brand that names the actual problem out loud — not the abstract problem, the actual one a person hits at 9pm on a Tuesday — wins permission to keep talking.`,
  'designing-for-delhi-light': `Delhi has a colour temperature. Late afternoon, before the dust kicks up, the city goes amber. Brand colours that look great in a Figma canvas at 6500K can read muddy in that ambient warmth.\n\nWe started swatch-testing in actual Delhi rooms — restaurant interiors, market stalls, office lobbies — instead of just lightboxes. The brands we make now hold up because they were colour-graded for where they'd be seen.`
}

export default function JournalPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true); setNotFound(false); setPost(null)
    const api = import.meta.env.VITE_API_URL
    if (!api) {
      const body = DEMO_BODIES[slug]
      if (body) setPost(buildDemo(slug, body))
      else setNotFound(true)
      setLoading(false)
      return
    }
    Promise.all([
      axios.get(`${api}/blog/${slug}`).catch(() => null),
      axios.get(`${api}/blog`).catch(() => ({ data: { items: [] } }))
    ]).then(([itemRes, listRes]) => {
      if (!itemRes?.data?.item) {
        const body = DEMO_BODIES[slug]
        if (body) setPost(buildDemo(slug, body))
        else setNotFound(true)
      } else {
        setPost(itemRes.data.item)
      }
      const list = listRes.data.items || []
      setRelated(list.filter((p) => p.slug !== slug).slice(0, 3))
    }).finally(() => setLoading(false))
  }, [slug])

  const jsonLd = useMemo(() => post && ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'author': { '@type': 'Person', 'name': post.author || 'Kalaakaari Studio' },
    'datePublished': post.publishedAt || post.createdAt,
    'description': post.excerpt,
    'articleSection': post.category
  }), [post])

  if (loading) return <div className="pt-44 pb-24 max-w-[1320px] mx-auto px-7 text-ink-mute label-tag">Loading…</div>
  if (notFound || !post) {
    return (
      <div className="pt-44 pb-32 max-w-[1320px] mx-auto px-7">
        <div className="label-tag">404 · Not found</div>
        <h1 className="font-display text-6xl mt-3">No post at that slug.</h1>
        <Link to="/journal" className="inline-block mt-8 px-6 py-3 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg">Back to the journal →</Link>
      </div>
    )
  }

  return (
    <>
      <SEOHead overrides={{
        title: `${post.seo?.title || post.title} · KALAAKAARI Journal`,
        description: post.seo?.description || post.excerpt,
        ogImage: post.seo?.ogImage || post.cover,
        schemaJSONLD: jsonLd
      }} />

      <section className="relative pt-40 pb-12 overflow-hidden">
        <DarkVeil />
        <div className="max-w-[900px] mx-auto px-7 relative">
          <Link to="/journal" className="label-tag text-ink-mute hover:text-saffron transition-colors">← Journal</Link>
          <div className="flex flex-wrap gap-3 mt-6 label-tag">
            <span className="text-mustard">{post.category}</span>
            <span>·</span>
            <span>{fmtDate(post.publishedAt || post.createdAt)}</span>
            <span>·</span>
            <span>{post.author || 'Kalaakaari Studio'}</span>
          </div>

          <h1 className="font-display mt-5 leading-[.95]" style={{ fontSize: 'clamp(40px,7vw,110px)', letterSpacing: '-.02em' }}>
            <SplitText text={post.title} by="word" stagger={0.04} />
          </h1>
          {post.excerpt && (
            <FadeContent delay={0.3}>
              <p className="font-serif-i text-parchment mt-8 leading-relaxed" style={{ fontSize: 'clamp(20px,2.4vw,30px)' }}>
                {post.excerpt}
              </p>
            </FadeContent>
          )}
        </div>
      </section>

      {post.cover && (
        <section className="pb-16">
          <div className="max-w-[1320px] mx-auto px-7">
            <FadeContent>
              <div className="aspect-[16/9] bg-bg-2 border border-line"
                   style={{ background: `url(${post.cover}) center/cover no-repeat` }} />
            </FadeContent>
          </div>
        </section>
      )}

      <article className="pb-32">
        <div className="max-w-[760px] mx-auto px-7 font-serif-i text-ink leading-relaxed" style={{ fontSize: 'clamp(18px,1.4vw,22px)', fontStyle: 'normal' }}>
          <FadeContent>
            {renderBody(post.body)}
          </FadeContent>

          <div className="border-t border-line mt-16 pt-8 flex items-center justify-between flex-wrap gap-4">
            <div className="label-tag">— {post.author || 'Kalaakaari Studio'}</div>
            <Magnet>
              <Link to="/contact" className="inline-flex items-center gap-3 px-6 py-3 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg transition-colors">
                Work with us →
              </Link>
            </Magnet>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <Section className="py-24 border-t border-line">
          <div className="label-tag mb-8">More from the journal</div>
          <div className="grid md:grid-cols-3 gap-8">
            {related.map((p, i) => (
              <FadeContent key={p._id || p.slug} delay={i * 0.05}>
                <Link to={`/journal/${p.slug}`} className="group block">
                  <span className="label-tag text-mustard">{p.category}</span>
                  <h4 className="font-display text-2xl mt-2 group-hover:text-saffron transition-colors">{p.title}</h4>
                  {p.excerpt && <p className="font-serif-i text-ink-mute mt-2 text-sm leading-relaxed line-clamp-2">{p.excerpt}</p>}
                </Link>
              </FadeContent>
            ))}
          </div>
        </Section>
      )}
    </>
  )
}

function renderBody(body) {
  if (!body) return <p className="text-ink-mute">No body content yet.</p>
  // body may be HTML (from a future rich text editor) or plain text with \n\n separators
  const looksHtml = /<\w+[^>]*>/.test(body)
  if (looksHtml) return <div className="prose-kalaa" dangerouslySetInnerHTML={{ __html: body }} />
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  return paragraphs.map((p, i) => (
    <p key={i} className="mb-6">{i === 0 ? <span className="float-left font-display text-saffron mr-3 leading-none" style={{ fontSize: '4.2em', lineHeight: '.85' }}>{p[0]}</span> : null}{i === 0 ? p.slice(1) : p}</p>
  ))
}

function fmtDate(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return '' }
}

function buildDemo(slug, body) {
  const meta = {
    'kala-kaari-culture':           { title: 'Kala. Kaari. Culture.',                       category: 'Studio Notes', author: 'Kalaakaari Studio', publishedAt: '2025-09-12' },
    'naming-against-the-grain':     { title: 'Naming against the grain',                     category: 'Branding',     author: 'Mira K.',           publishedAt: '2025-08-02' },
    'campaign-that-earns-the-room': { title: 'The campaign that earns the room',             category: 'Campaign Thinking', author: 'Ravi S.',      publishedAt: '2025-06-18' },
    'designing-for-delhi-light':    { title: 'Designing for Delhi light',                    category: 'Design',       author: 'Studio',            publishedAt: '2025-04-29' }
  }[slug] || { title: slug, category: 'Studio Notes' }
  return { slug, ...meta, body, excerpt: body.split('\n')[0] }
}
