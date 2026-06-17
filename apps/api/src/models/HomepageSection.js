import mongoose from 'mongoose'

/**
 * One document — singleton. Holds homepage-editable content.
 */
const HomepageSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    hero: {
      eyebrow: { type: String, default: 'LIVE FROM NEW DELHI' },
      title:   { type: String, default: 'KALAA × KAARI' },
      deva:    { type: String, default: 'कला × कारी — कलाकारी' },
      sub:     { type: String, default: 'Artists, makers, and storytellers of India\'s digital age.' },
      body:    { type: String, default: '' },
      ctaPrimary:   { label: { type: String, default: 'See Our Work' }, href: { type: String, default: '/work' } },
      ctaSecondary: { label: { type: String, default: 'Our Creed' }, href: { type: String, default: '/about' } }
    },
    marquee: { type: [String], default: ['MAKE CULTURE','संस्कृति बनाओ','NOT JUST CONTENT','बल्कि कला','THINK BOLD'] },
    metrics: [{ label: String, value: Number, suffix: String }],
    brands:  [{ type: String }],                     // legacy text marquee names (still supported)
    // Uploadable client logos for the homepage marquee. When present, the web
    // renders these instead of the legacy text names.
    brandLogos: [{ name: { type: String }, logo: { type: String } }],
    // Extra hero carousel slides shown AFTER the built-in typographic hero (slide 1).
    // Each slide is a full-bleed image or video with an optional headline + CTA.
    heroSlides: [{
      kind:     { type: String, enum: ['image', 'video'], default: 'image' },
      src:      { type: String },                    // image or video URL
      poster:   { type: String },                    // poster image for video slides
      alt:      { type: String },
      headline: { type: String },
      sub:      { type: String },
      ctaLabel: { type: String },
      ctaHref:  { type: String }
    }],
    quote:   { en: String, deva: String, attr: String },
    featuredProjectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PortfolioProject' }]
  },
  { timestamps: true }
)

export default mongoose.model('HomepageSection', HomepageSchema)
