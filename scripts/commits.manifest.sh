# ════════════════════════════════════════════════════════════════════════
#  commits.manifest.sh  —  KALAAKAARI commit plan
#
#  Sourced by scripts/git-init-and-push.sh. Defines:
#    REMOTE_URL       — git remote (CLI --remote overrides this)
#    DEFAULT_BRANCH   — default branch (CLI --branch overrides)
#    define_commits() — function called after git init to build history
#
#  Available helpers inside define_commits:
#    commit_step "key" "subject + optional body" file1 file2 ...
#    branch_here "feat/<name>"        # use after a commit_step via &&
#
#  The order of commit_step calls is the order of the commits on main.
#  Files that don't exist are silently skipped (with a "skip [key]" log).
# ════════════════════════════════════════════════════════════════════════

REMOTE_URL="https://github.com/maplestudios-dev/kalaakari.git"
DEFAULT_BRANCH="main"

define_commits() {

  # ─── Foundation ─────────────────────────────────────────────────
  commit_step "init" \
    "chore: initialise monorepo scaffold

- pnpm workspaces + Turborepo
- shared .env.example, root README and .gitignore
- git bootstrap script + manifest" \
    .gitignore .env.example README.md package.json pnpm-workspace.yaml turbo.json scripts/

  commit_step "preview" \
    "feat: cinematic single-file homepage preview

Standalone index.html (no install needed) that renders the full
KALAAKAARI homepage — hero, marquee, pillars, manifesto, ticker,
final CTA. Used as the design north star before the React build." \
    kalaakaari-preview.html

  # ─── Backend foundation ─────────────────────────────────────────
  commit_step "api-foundation" \
    "feat(api): Express + Mongoose backend foundation

- Express server with helmet, CORS, morgan, rate-limit
- Mongoose models: User, Portfolio, ContactSubmission, BlogPost, JobPost, HomepageSection
- Routes: auth (JWT + bcrypt), portfolio, contact, blog, careers, homepage
- Permission constants module (used by RBAC next)
- Idempotent seed script for owner user + demo content" \
    apps/api/package.json apps/api/.env.example \
    apps/api/src/index.js \
    apps/api/src/middleware/errors.js apps/api/src/middleware/auth.js \
    apps/api/src/models/User.js apps/api/src/models/Portfolio.js \
    apps/api/src/models/ContactSubmission.js apps/api/src/models/BlogPost.js \
    apps/api/src/models/JobPost.js apps/api/src/models/HomepageSection.js \
    apps/api/src/routes/auth.js apps/api/src/routes/portfolio.js apps/api/src/routes/contact.js \
    apps/api/src/routes/blog.js apps/api/src/routes/careers.js apps/api/src/routes/homepage.js \
    apps/api/src/lib/permissions.js \
    apps/api/src/seed/seed.js \
    && branch_here "feat/api-foundation"

  # ─── Public website ────────────────────────────────────────────
  commit_step "web" \
    "feat(web): public website — homepage + 4 pages + react-bits

- Vite + React + Tailwind + Framer Motion
- Themed react-bits suite (SplitText, Magnet, ShinyText, FadeContent,
  SpotlightCard, TiltedCard, CountUp, DarkVeil, TextPressure)
- Homepage composition: Hero (KALAA x KAARI), Marquee, Pillars,
  About snapshot with CountUp metrics, FeaturedWork (Tilted), Services,
  ManifestoQuote, BrandsTicker, FinalCTA
- About, Services, Work, Contact pages
- Editorial palette, Anton/Fraunces/Archivo/Tiro Devanagari typography
- Grain overlay + prefers-reduced-motion support" \
    apps/web/package.json apps/web/.env.example \
    apps/web/vite.config.js apps/web/tailwind.config.js apps/web/postcss.config.js apps/web/index.html \
    apps/web/src/main.jsx apps/web/src/App.jsx apps/web/src/index.css \
    apps/web/src/components/Navbar.jsx apps/web/src/components/Footer.jsx \
    apps/web/src/components/Grain.jsx apps/web/src/components/Marquee.jsx \
    apps/web/src/components/Section.jsx apps/web/src/components/Hero.jsx \
    apps/web/src/components/Pillars.jsx apps/web/src/components/AboutSnapshot.jsx \
    apps/web/src/components/FeaturedWork.jsx apps/web/src/components/ServicesRows.jsx \
    apps/web/src/components/ManifestoQuote.jsx apps/web/src/components/BrandsTicker.jsx \
    apps/web/src/components/FinalCTA.jsx apps/web/src/components/bits/index.jsx \
    apps/web/src/pages/Home.jsx apps/web/src/pages/About.jsx \
    apps/web/src/pages/Services.jsx apps/web/src/pages/Work.jsx \
    apps/web/src/pages/Contact.jsx \
    && branch_here "feat/web"

  # ─── Admin foundation ──────────────────────────────────────────
  commit_step "admin" \
    "feat(admin): admin dashboard — login, portfolio CMS, lead inbox

- Vite + React + Tailwind admin shell with sidebar
- JWT auth via localStorage + Axios interceptor
- Dashboard analytics (projects, leads, breakdown by service)
- Portfolio CRUD (table + drawer)
- Lead inbox + CSV export + read/unread toggle" \
    apps/admin/package.json apps/admin/.env.example \
    apps/admin/vite.config.js apps/admin/tailwind.config.js apps/admin/postcss.config.js apps/admin/index.html \
    apps/admin/src/main.jsx apps/admin/src/App.jsx apps/admin/src/index.css \
    apps/admin/src/lib/api.js apps/admin/src/components/Shell.jsx \
    apps/admin/src/pages/Login.jsx apps/admin/src/pages/Dashboard.jsx \
    apps/admin/src/pages/Portfolio.jsx apps/admin/src/pages/Submissions.jsx \
    && branch_here "feat/admin"

  # ─── RBAC + audit log ──────────────────────────────────────────
  commit_step "rbac-audit" \
    "feat(rbac): roles, permissions, invite flow, audit log

- 5 roles: Owner / Admin / Editor / Author / Viewer with permission matrix
- /api/users CRUD: invite (7-day token), accept-invite, suspend, reset-password
- Owner can't be suspended/deleted; only Owner can modify Owner
- AuditLog model + lib/audit.js (fire-and-forget logger)
- Every write route auto-records actor, action, before/after diff
- Admin pages: Users (table + invite drawer), Audit (filterable), AcceptInvite" \
    apps/api/src/models/AuditLog.js apps/api/src/lib/audit.js \
    apps/api/src/routes/users.js apps/api/src/routes/audit.js \
    apps/admin/src/pages/Users.jsx apps/admin/src/pages/Audit.jsx \
    apps/admin/src/pages/AcceptInvite.jsx \
    && branch_here "feat/rbac-audit"

  # ─── JSON copywriting ──────────────────────────────────────────
  commit_step "json-copy" \
    "feat(copy): JSON copywriting system end-to-end

- SiteCopy singleton model with rolling history (last 30 versions)
- /api/site-copy GET/PUT/restore/versions
- Web CopyProvider + useCopy('hero.title1') hook with deep-merge fallback
- Bundled defaultCopy.js mirrors API defaults for SSR-safe first render
- Homepage refactored — every editable string flows through useCopy()
- Admin /copy page: live editor with JSON validation, upload/download,
  format, load-defaults, version history with one-click restore" \
    apps/api/src/models/SiteCopy.js apps/api/src/lib/defaultCopy.js \
    apps/api/src/routes/siteCopy.js \
    apps/web/src/lib/copy.jsx apps/web/src/lib/defaultCopy.js \
    apps/admin/src/pages/Copy.jsx \
    && branch_here "feat/json-copy"

  # ─── SEO ───────────────────────────────────────────────────────
  commit_step "seo" \
    "feat(seo): SEO management — per-path overrides + sitemap + redirects

- SeoEntry model: title, description, canonical, OG, JSON-LD, noindex
- Redirect model with code (301/302/307/308)
- Auto-generated sitemap.xml from published Portfolio + Blog + Video + entries
- Auto-generated robots.txt
- Web SEOHead component: patches title/meta/JSON-LD on every route change
- Admin /seo page: tabbed Entries + Redirects + Tools" \
    apps/api/src/models/SeoEntry.js apps/api/src/routes/seo.js \
    apps/web/src/components/SEOHead.jsx \
    apps/admin/src/pages/Seo.jsx \
    && branch_here "feat/seo"

  # ─── Video portfolio ───────────────────────────────────────────
  commit_step "video-reel" \
    "feat(video): video portfolio + admin CRUD

- Video model with YouTube/Vimeo/MP4 source, credits, tags
- /api/video CRUD with permission gates
- Public /reel page: featured film hero, filters, tilted grid, theater modal
- Admin /video page: source picker, credits field-array, featured toggle" \
    apps/api/src/models/Video.js apps/api/src/routes/video.js \
    apps/web/src/pages/Reel.jsx \
    apps/admin/src/pages/Video.jsx \
    && branch_here "feat/video-reel"

  # ─── Testimonials + Press ─────────────────────────────────────
  commit_step "testimonials-press" \
    "feat: testimonials + press CMS + homepage carousel

- Testimonial + Press models with featured/published flags
- /api/testimonials and /api/press CRUD
- Homepage TestimonialCarousel — auto-rotates every 7s, pauses on hover,
  AnimatePresence fade, saffron progress bar
- Admin pages for both" \
    apps/api/src/models/Testimonial.js apps/api/src/models/Press.js \
    apps/api/src/routes/testimonials.js \
    apps/web/src/components/TestimonialCarousel.jsx \
    apps/admin/src/pages/Testimonials.jsx apps/admin/src/pages/Press.jsx \
    && branch_here "feat/testimonials-press"

  # ─── Notifications ────────────────────────────────────────────
  commit_step "notifications" \
    "feat: Slack + email lead notifications

Fire-and-forget Slack webhook + SMTP email on every new contact submission.
Both channels degrade silently if not configured. Submission persistence
never depends on either succeeding." \
    apps/api/src/lib/notifications.js \
    && branch_here "feat/notifications"

  # ─── Public Careers + Press ──────────────────────────────────
  commit_step "public-pages" \
    "feat: public Careers and Press pages

- /careers — hero, studio values, open roles from /api/careers, apply CTAs
- /press — publication wall, awards highlight grid, filterable archive
- Both with SEO head + DarkVeil hero treatment" \
    apps/web/src/pages/Careers.jsx apps/web/src/pages/Press.jsx \
    && branch_here "feat/public-pages"

  # ─── Case study detail ───────────────────────────────────────
  commit_step "case-studies" \
    "feat: case study detail page (/work/:slug) + clickable cards

- Editorial template: hero, cover media, meta strip, narrative chapters
  (Challenge / Thinking / Execution), animated metrics, gallery,
  services + tags, 3 related projects, CTA
- Per-page SEOHead with CreativeWork JSON-LD
- FeaturedWork + Work page cards now link to /work/:slug" \
    apps/web/src/pages/CaseStudy.jsx \
    && branch_here "feat/case-studies"

  # ─── Journal ─────────────────────────────────────────────────
  commit_step "journal" \
    "feat: journal end-to-end (public + admin)

- /journal list with category filters, featured post, 3-col grid
- /journal/:slug detail with drop-cap typography, related rail, BlogPosting JSON-LD
- Admin /blog CRUD with SEO overrides + publish date + Author draft-only enforcement" \
    apps/web/src/pages/Journal.jsx apps/web/src/pages/JournalPost.jsx \
    apps/admin/src/pages/Blog.jsx \
    && branch_here "feat/journal"

  # ─── Docs ────────────────────────────────────────────────────
  commit_step "docs" \
    "docs: Notion-ready documentation

13 markdown files covering: product vision, brand strategy, design
system, React Bits integration, technical architecture, API reference,
admin CMS guide, deployment, roadmap, RBAC + audit, copy system,
SEO + video, notifications." \
    docs/ \
    && branch_here "docs/notion-ready"

  # ─── Lockfile (last so it reflects the final dep tree) ──────
  commit_step "lockfile" \
    "chore: commit pnpm lockfile for reproducible installs" \
    pnpm-lock.yaml

}
