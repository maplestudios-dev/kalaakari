/**
 * KALAAKAARI · default site copy
 *
 * Every editable string on the public site lives here, namespaced by section.
 * Frontend reads via `useCopy('hero.title')` — paths use dot notation.
 *
 * To regenerate the schema after adding fields, just add them here and the
 * admin UI will surface them automatically.
 */
export const defaultCopy = {
  meta: {
    siteName: 'KALAAKAARI',
    siteNameDeva: 'कलाकारी',
    tagline: 'Independent creative studio · New Delhi',
    defaultOgImage: ''
  },

  nav: {
    links: [
      { to: '/work',     label: 'Work' },
      { to: '/reel',     label: 'Reel' },
      { to: '/services', label: 'Services' },
      { to: '/about',    label: 'Studio' },
      { to: '/journal',  label: 'Journal' },
      { to: '/careers',  label: 'Careers' },
      { to: '/press',    label: 'Press' },
      { to: '/contact',  label: 'Contact' }
    ],
    cta: { label: 'Start a Project →', to: '/contact' }
  },

  hero: {
    eyebrow: 'LIVE FROM NEW DELHI',
    coordinates: '28.6139° N · 77.2090° E',
    established: 'EST. MMXVIII · INDEPENDENT · CRAFT-FIRST',
    title1: 'KALAA',
    titleX: '×',
    title2: 'KAARI',
    deva: 'कला × कारी — कलाकारी',
    sub: "Artists, makers, and storytellers of India's digital age.",
    body: 'Where the ancient craft of kalaa collides with the velocity of modern advertising. We build brands, campaigns, content, and digital experiences that do more than exist — they enter culture.',
    chips: ['Independent','Craft-first','Delhi-born','Branding','Campaigns','Content','Digital'],
    ctaPrimary:   { label: 'See Our Work',  to: '/work' },
    ctaSecondary: { label: 'Our Creed',     to: '/about' },
    bottomLeft:  'SCROLL ↓ DESCEND INTO CRAFT',
    bottomRight: 'ISSUE №01 / MMXXVI'
  },

  marquee: [
    { en: 'MAKE CULTURE',      deva: 'संस्कृति बनाओ' },
    { en: 'NOT JUST CONTENT',  deva: 'बल्कि कला' },
    { en: 'THINK BOLD',        deva: 'साहसी सोचो', acc: true },
    { en: 'ACT FAST',          deva: 'तेज़ चलो' },
    { en: 'BE TRUE',           deva: 'कलाकार रहो' }
  ],

  pillars: {
    eyebrow: 'Pillars',
    eyebrowDeva: 'हमारे स्तंभ',
    title: 'Three forces.\nOne craft.',
    intro: 'The DNA that shapes every brief, every frame, every line of copy that leaves the studio.',
    items: [
      { n: '01', en: 'Kala',    deva: 'कला — the art',    body: "The soul. We obsess over the frame, the letterform, the pause between two notes. Craft is not a deliverable. It is a discipline." },
      { n: '02', en: 'Kaari',   deva: 'कारी — the fire',  body: "The maker's intent. We do not execute briefs blindly. We interrogate them, sharpen them, and build ideas with edges." },
      { n: '03', en: 'Culture', deva: 'संस्कृति — the pulse', body: "Born in Delhi's chaos and coloured by its contradictions. We build brands that do not just reach people. They move them." }
    ]
  },

  about: {
    title: 'We\nignite\nbrands.',
    eyebrow: 'About the studio',
    paragraphs: [
      'KALAAKAARI is a branding-first independent creative studio where strategy, design, and storytelling converge. We partner with ambitious brands to shape culture, challenge conventions, and build identities that endure.',
      'With craft, conviction, and a deep love for Delhi\'s beautiful chaos, we transform ideas into brand experiences that punch above their weight.'
    ],
    cta: { label: 'Know the Studio →', to: '/about' },
    meta: [
      ['Founded', '2018'],
      ['Base', 'New Delhi'],
      ['Brands served', '40+'],
      ['Studio model', 'Senior-led'],
      ['Team', 'Strategy · Design · Film']
    ],
    metrics: [
      { value: 8,   suffix: '',  label: 'Years active' },
      { value: 42,  suffix: '+', label: 'Brands shaped' },
      { value: 180, suffix: 'M', label: 'Impressions delivered' }
    ],
    metricsFootnote: '* Demo seed values — replace via admin dashboard.'
  },

  work: {
    eyebrow: 'Selected Work',
    eyebrowDeva: 'चुनिंदा कार्य',
    title: "Sneak peek into\nwhat we're up to.",
    viewAllCta: { label: 'View All Work →', to: '/work' }
  },

  services: {
    eyebrow: 'What we do',
    eyebrowDeva: 'हमारी सेवाएँ',
    title: 'The medium shapes the message.\nWe shape both.',
    intro: 'Strategy, design, content, performance, and production — everything your brand needs to speak with clarity and conviction.',
    items: [
      { n: '01', en: 'Strategy',    deva: 'रणनीति',    desc: 'Brand positioning · Architecture · Narrative · Market & consumer analysis · Go-to-market' },
      { n: '02', en: 'Branding',    deva: 'पहचान',     desc: 'Visual identity · Naming · Brand guidelines · Key messaging · Art direction' },
      { n: '03', en: 'Content',     deva: 'कथा',       desc: 'Ad films · Editorial photography · Scripting · Reels · Short & long-form storytelling' },
      { n: '04', en: 'Digital',     deva: 'डिजिटल',    desc: 'UI/UX · Design systems · Interactive prototypes · Websites · Digital asset systems' },
      { n: '05', en: 'Performance', deva: 'प्रदर्शन',   desc: 'Paid social · Search · Funnel design · Creative testing · Optimisation' },
      { n: '06', en: 'Production',  deva: 'निर्माण',    desc: 'Video production · 3D & CGI · Photography · Motion design · Animation' }
    ]
  },

  manifesto: {
    quotePart1: "We don't sell brands.",
    quotePart2: "We ignite them.",
    deva: 'कला जो पेट भरे। कारी जो दिल।',
    attribution: '— Studio Creed · MMXXVI'
  },

  brandsTicker: ['ZOMATO','स्विगी','boAt','नायका','MAMAEARTH','लेंसकार्ट','BEWAKOOF','मीशो','SUGAR','मिंत्रा'],

  finalCta: {
    title1: 'Work with us.',
    title2: 'Or work among us.',
    deva: 'हमारे साथ काम करो। या हमारे बीच।',
    ctaPrimary:   { label: 'Contact Us →',  to: '/contact' },
    ctaSecondary: { label: 'Careers ↗',     to: '/about' }
  },

  footer: {
    brandLine: 'An independent creative studio in New Delhi, building brands that are remembered, not just seen.',
    columns: {
      Studio:       [
        { label: 'About', to: '/about' },
        { label: 'Work',  to: '/work' },
        { label: 'Reel',  to: '/reel' },
        { label: 'Journal', to: '/journal' },
        { label: 'Press & Awards', to: '/press' },
        { label: 'Careers', to: '/careers' }
      ],
      Capabilities: [
        { label: 'Strategy', to: '/services' },
        { label: 'Branding', to: '/services' },
        { label: 'Content', to: '/services' },
        { label: 'Digital', to: '/services' },
        { label: 'Performance', to: '/services' },
        { label: 'Production', to: '/services' }
      ],
      Contact:      ['hello@kalaakaari.in','+91 11 2345 6789','Hauz Khas Village, New Delhi 110016','@kalaakaari.studio']
    },
    copyright: '© MMXXVI Kalaakaari Studio LLP · Made in DELHI',
    legalLinks: ['Privacy','Terms','Imprint']
  }
}
