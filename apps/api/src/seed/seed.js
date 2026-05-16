import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import Portfolio from '../models/Portfolio.js'
import BlogPost from '../models/BlogPost.js'
import JobPost from '../models/JobPost.js'
import HomepageSection from '../models/HomepageSection.js'
import SiteCopy from '../models/SiteCopy.js'
import Video from '../models/Video.js'
import Testimonial from '../models/Testimonial.js'
import Press from '../models/Press.js'
import { defaultCopy } from '../lib/defaultCopy.js'

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✓ connected to', process.env.MONGODB_URI)

  // ── Owner user ──
  const email = (process.env.ADMIN_EMAIL || 'admin@kalaakaari.in').toLowerCase()
  const pw    = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
  const passwordHash = await bcrypt.hash(pw, 10)
  await User.findOneAndUpdate(
    { email },
    { email, name: 'Studio Owner', passwordHash, role: 'Owner', status: 'active' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
  console.log(`✓ owner user ready → ${email} / ${pw}`)

  // ── Singletons ──
  await HomepageSection.findOneAndUpdate({ key: 'main' }, { key: 'main' }, { upsert: true })

  // SiteCopy: safe-refresh. If the doc doesn't exist OR is still at version 1
  // (no one has edited it through the admin yet), overwrite with the latest
  // bundled defaults. Once edited (version > 1) we leave customisations alone.
  const existing = await SiteCopy.findOne({ key: 'main' })
  if (!existing) {
    await SiteCopy.create({ key: 'main', version: 1, copy: defaultCopy })
    console.log('✓ site copy created from defaults')
  } else if (existing.version <= 1) {
    existing.copy = defaultCopy
    await existing.save()
    console.log('✓ site copy refreshed to latest defaults (unedited copy detected)')
  } else {
    console.log(`✓ site copy left alone (v${existing.version} — has been edited in admin)`)
  }

  // ── Portfolio ──
  const seedProjects = [
    { title: 'Hauz Khas Collective', slug: 'hauz-khas-collective', deva: 'हौज़ ख़ास', category: 'Branding', year: 2025, excerpt: 'Brand identity for a creator hub at the heart of HKV.', featured: true },
    { title: 'Namkeen Republic', slug: 'namkeen-republic', deva: 'नमकीन गणराज्य', category: 'Campaign', year: 2025, result: '4.2M Impressions', excerpt: '360° launch campaign for a snack disruptor.', featured: true },
    { title: 'Studio Tamas', slug: 'studio-tamas', deva: 'तमस', category: 'Branding', year: 2024 },
    { title: 'The Bombay Club', slug: 'bombay-club', deva: 'बम्बई क्लब', category: 'Content', year: 2024, result: '0 → 180K · 8 mo' },
    { title: 'Aroha Jewels', slug: 'aroha-jewels', deva: 'आरोहा', category: 'Production', year: 2024, result: '3× revenue' },
    { title: 'Urban Apothecary', slug: 'urban-apothecary', deva: 'अर्बन', category: 'Content', year: 2024 },
    { title: 'Atelier Lota', slug: 'atelier-lota', deva: 'अटेलियर', category: 'Digital', year: 2024 }
  ]
  for (const p of seedProjects) await Portfolio.findOneAndUpdate({ slug: p.slug }, p, { upsert: true })
  console.log(`✓ seeded ${seedProjects.length} portfolio items`)

  // ── Blog ──
  const seedPosts = [
    {
      slug: 'kala-kaari-culture',
      title: 'Kala. Kaari. Culture.',
      category: 'Studio Notes',
      author: 'Kalaakaari Studio',
      excerpt: 'Why we named the studio after a verb, not a thing.',
      body: "When we registered the studio, the first round of names was a list of nouns. Atelier this. Studio that. They felt like furniture. We wanted a name that did something.\n\nKalaakaari isn't a thing. It's the act of putting craft into motion — kala (the art) becoming kaari (the maker, the doer). A verb dressed up as a noun. That distinction matters in our work too.\n\nWe don't sell brand guidelines. We sell the act of moving a brand from where it sits to where it could sit. The rest is just consequence — typography choices, palette decisions, the way we structure a brief. They all fall out of the same idea: craft is a discipline, not a deliverable.",
      published: true,
      publishedAt: new Date('2025-09-12')
    },
    {
      slug: 'naming-against-the-grain',
      title: 'Naming against the grain',
      category: 'Branding',
      author: 'Mira K.',
      excerpt: 'When a category-defining name comes from breaking a convention nobody asked you to break.',
      body: "Most naming projects end with a name nobody dislikes. That's not the same as a name that does work.\n\nThe naming brief for one of our most-shared launches asked for \"approachable, modern, Indian.\" We delivered three names. Two were exactly that. The third — the one they chose — was deliberately abrasive, a bit hard to spell, and pronounced two different ways by two different people in the first review meeting.\n\nIt won because abrasion is memorable. Approachability is forgettable. The risk wasn't picking the strange name; it was picking the safe one.",
      published: true,
      publishedAt: new Date('2025-08-02')
    },
    {
      slug: 'campaign-that-earns-the-room',
      title: 'The campaign that earns the room',
      category: 'Campaign Thinking',
      author: 'Ravi S.',
      excerpt: 'A short note on why an ad film should make you stop scrolling without asking you to.',
      body: "A 27-second ad film either earns the next 60 seconds of attention or it doesn't. The work is to make sure it does. Not by being louder. By being specific.\n\nSpecificity is the most underrated tool in advertising. The brand that names the actual problem out loud — not the abstract problem, the actual one a person hits at 9pm on a Tuesday — wins permission to keep talking.",
      published: true,
      publishedAt: new Date('2025-06-18')
    },
    {
      slug: 'designing-for-delhi-light',
      title: 'Designing for Delhi light',
      category: 'Design',
      author: 'Studio',
      excerpt: "How a city's ambient colour temperature should influence your palette decisions.",
      body: "Delhi has a colour temperature. Late afternoon, before the dust kicks up, the city goes amber. Brand colours that look great in a Figma canvas at 6500K can read muddy in that ambient warmth.\n\nWe started swatch-testing in actual Delhi rooms — restaurant interiors, market stalls, office lobbies — instead of just lightboxes. The brands we make now hold up because they were colour-graded for where they'd be seen.",
      published: true,
      publishedAt: new Date('2025-04-29')
    }
  ]
  for (const p of seedPosts) await BlogPost.findOneAndUpdate({ slug: p.slug }, p, { upsert: true })
  console.log(`✓ seeded ${seedPosts.length} journal posts`)

  // ── Jobs ──
  await JobPost.findOneAndUpdate(
    { role: 'Senior Brand Designer' },
    {
      role: 'Senior Brand Designer',
      department: 'Design',
      location: 'New Delhi',
      type: 'Full-time',
      description: 'Lead identity work across two to three retainers. Senior-led studio, no hand-offs.',
      requirements: ['5+ years in brand identity', 'A reel of identity systems, not just logos', 'Comfortable owning a client conversation']
    },
    { upsert: true }
  )

  // ── Videos (reel) ──
  const seedVideos = [
    { title: 'Namkeen Republic — Launch Film', slug: 'namkeen-republic-launch', client: 'Namkeen Republic', category: 'Ad Film', year: 2025, duration: 47, youtubeId: 'dQw4w9WgXcQ', excerpt: 'A 47-second hook for a snack disruptor.', featured: true, tags: ['campaign','launch','food'] },
    { title: 'Aroha — The Heirloom', slug: 'aroha-heirloom', client: 'Aroha Jewels', category: 'Brand Film', year: 2024, duration: 90, youtubeId: 'dQw4w9WgXcQ', excerpt: 'A film about what we pass down.', tags: ['craft','heritage'] },
    { title: 'Hauz Khas Collective — Identity Reel', slug: 'hkc-identity-reel', client: 'HKC', category: 'Reel', year: 2025, duration: 22, youtubeId: 'dQw4w9WgXcQ', excerpt: 'Identity in motion.', tags: ['branding','motion'] }
  ]
  for (const v of seedVideos) await Video.findOneAndUpdate({ slug: v.slug }, v, { upsert: true })
  console.log(`✓ seeded ${seedVideos.length} videos`)

  // ── Testimonials ──
  const seedTestimonials = [
    { author: 'Mira Kapoor', quote: 'They sharpened the brief before they touched a Figma file. The work was a consequence.', role: 'Founder', company: 'Aroha Jewels', featured: true, rating: 5, order: 1 },
    { author: 'Ravi S.',     quote: "We came in asking for a campaign. They sold us a positioning. We're still paying it back in compounding interest.", role: 'Head of Brand', company: 'Namkeen Republic', featured: true, rating: 5, order: 2 },
    { author: 'Anjali Reddy', quote: "Senior-led isn't a tagline at KALAAKAARI — it's how the calls actually go.", role: 'CMO', company: 'Studio Tamas', featured: true, rating: 5, order: 3 }
  ]
  for (const t of seedTestimonials) await Testimonial.findOneAndUpdate({ author: t.author }, t, { upsert: true })

  // ── Press / Awards ──
  await Press.findOneAndUpdate(
    { title: 'Brand Identity of the Year — Hauz Khas Collective' },
    {
      type: 'Award',
      title: 'Brand Identity of the Year — Hauz Khas Collective',
      publication: 'Kyoorius Design Awards', date: new Date('2025-09-01'),
      excerpt: 'Recognized for clarity, restraint, and cultural specificity.'
    },
    { upsert: true }
  )

  console.log('✓ seed complete')
  await mongoose.disconnect()
}

run().catch((e) => { console.error(e); process.exit(1) })
