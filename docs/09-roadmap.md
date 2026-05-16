# 09 · Roadmap

The MVP ships:
- Public site: Home, About, Services, Work, Contact
- Admin: Login, Dashboard, Portfolio CMS, Lead inbox + CSV export
- API: Auth, Portfolio, Contact, Blog, Careers, Homepage singleton
- React Bits (themed): SplitText, Magnet, ShinyText, FadeContent, SpotlightCard, TiltedCard, CountUp, DarkVeil, TextPressure

## Next phases

### Phase 2 — content depth
- **Journal / Insights pages** — public list + detail (schemas + API already in place; needs UI + admin module)
- **Careers public page + job detail** — schemas + API in place; UI pending
- **Case study detail page** (`/work/:slug`) — schema in place; build the editorial template
- **Capability detail pages** (`/services/strategy`, …) — one route per service

### Phase 3 — admin depth
- **Blog CMS module** in admin
- **Careers CMS module** in admin
- **Homepage Sections editor** — wire hero copy, marquee text, featured project picker, manifesto, brand ticker to the existing `/api/homepage` PUT endpoint
- **Media library** — `multer` + Cloudinary upload at `/api/media`
- **Drag-to-reorder** for portfolio (uses the existing `order` field)

### Phase 4 — motion + storytelling
- **Scroll Stack** (react-bits) on a dedicated Services page for the capability storytelling sequence (Problem → Insight → Direction → Execution → Result)
- **Curved Loop** circular seal on the About page ("Kala • Kaari • Culture • Delhi • Craft")
- **Circular Gallery** for studio culture imagery on About + Careers

### Phase 5 — long-term
- Client portal (project status, invoices, asset handover)
- Testimonials CMS + homepage carousel
- Press / Awards page
- Multi-language site support (Hindi as a primary, not just decorative)
- Interactive reel archive (video grid with on-hover playback)
- Campaign microsite builder inside admin (templated landing pages)
- AI-assisted content management — captioning, alt text, SEO meta generation
