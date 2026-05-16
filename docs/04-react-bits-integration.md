# 04 · React Bits Integration

This site uses react-bits-style components themed for KALAAKAARI. The implementations live at `apps/web/src/components/bits/index.jsx` — fully owned by this repo so the studio can theme freely without fighting upstream styles. Each component below documents the public API, where it is used, theming overrides applied, and reduced-motion behavior.

## Components in use

### SplitText  — *essential*
**API:** `<SplitText text="…" by="word|char" delay={0} stagger={0.04} />`
**Used in:** Hero `KALAA × KAARI`, all page H1s, manifesto quote, final CTA.
**Theming:** No color override — inherits parent `font-display` / `font-serif-i`.
**Reduced motion:** Animates to final state instantly (no rise from below).

### Magnet  — *essential*
**API:** `<Magnet strength={0.3}>…</Magnet>`
**Used in:** Hero CTAs (See Our Work, Our Creed), Final CTA, Contact submit, Section heads with right-aligned CTAs.
**Theming:** None. Wraps any element; respects its existing styles.
**Reduced motion:** No-op (movement disabled).

### ShinyText  — *essential*
**API:** `<ShinyText speed={4}>LIVE FROM NEW DELHI</ShinyText>`
**Used in:** Hero "LIVE FROM NEW DELHI" status label only (one location to keep it premium).
**Theming:** Gradient uses `--ink-mute → --ink → --mustard`, the studio palette.
**Reduced motion:** Static text (no animated background-position).

### FadeContent  — *essential*
**API:** `<FadeContent delay={0} y={32}>…</FadeContent>`
**Used in:** Every editorial section reveal, project cards, service rows, value cards.
**Theming:** No styling — pure motion wrapper.
**Reduced motion:** Renders at final state.

### SpotlightCard  — *essential*
**API:** `<SpotlightCard spotlightColor="rgba(232,99,31,.18)">…</SpotlightCard>`
**Used in:** Pillars rows (subtle row-surface treatment, NOT box cards), Services rows, Studio Values, Capability Clusters.
**Theming:** Spotlight color is saffron at low alpha to keep it warm, not radioactive.
**Reduced motion:** No fade — spotlight still works on hover (it's pointer-driven, not auto-animated).

### TiltedCard  — *selective use*
**API:** `<TiltedCard max={6}>…</TiltedCard>`
**Used in:** Featured Hauz Khas card on the homepage and any project with `featured: true` on /work — reserved for "hero" thumbnails, never for all cards.
**Theming:** None.
**Reduced motion:** No-op.

### CountUp  — *essential*
**API:** `<CountUp to={42} from={0} suffix="+" duration={1.8} />`
**Used in:** About snapshot metrics (Years active, Brands shaped, Impressions).
**Theming:** No styling — wrap in `font-display text-mustard` to match the brand.
**Note:** Seed values are flagged as demo in the UI (`* Demo seed values — replace via admin`).

### DarkVeil  — *essential, hero-only*
**API:** `<DarkVeil />`
**Used in:** Hero, About page hero, Final CTA, Contact hero. **Not** repeated globally to keep the effect premium.
**Theming:** Radial gradients composed of saffron, mustard and clay at low alpha. Slow 18s pseudo-rotation.
**Reduced motion:** Renders the static gradient layer without the rotation animation.

### TextPressure  — *optional*
**API:** `<TextPressure text="KALAAKAARI" />`
**Used in:** Not currently mounted on the homepage. Available for use on an interior page if/when needed. Brief explicitly says "use sparingly and keep readable" — we honored that by keeping it shelved by default.

## Components intentionally not implemented in MVP
The brief's optional list (Curved Loop circular seal, Circular Gallery for studio culture, Scroll Stack for capability storytelling) are documented in `08-roadmap.md` as next-phase work. The MVP keeps motion lean and editorial-first.

## Performance budget
- All bits components are `use-client`-equivalent (we are pure React, no SSR yet) and use `framer-motion`'s `useInView` to prevent off-screen animation work.
- Grain layer is a single fixed SVG using `feTurbulence` (no canvas, no JS animation loop).
- Marquee uses CSS-only keyframes with `transform: translateX` for GPU compositing.
- Magnetic CTAs cap movement at ≤20px deflection and snap back via spring instead of running continuous RAF.

## Accessibility
- Every animated text passage exposes the full string via `aria-label` (SplitText), so screen readers receive the sentence, not the per-letter spans.
- All CTAs are real `<button>` or `<a>` elements — Magnet wraps without breaking semantics.
- Color contrast: cream (#F4EDE0) on charcoal (#0B0A08) passes WCAG AA at body sizes. Saffron CTAs on dark pass AA Large; saffron text on dark is reserved for display sizes ≥24px to stay AA Large compliant.
- Reduced motion: `prefers-reduced-motion: reduce` disables marquee, grain, decorative reveals, and magnetic movement.
