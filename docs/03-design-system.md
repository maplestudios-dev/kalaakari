# 03 · Design System

## Type scale
| Token | Size | Use |
|---|---|---|
| Hero display | `clamp(72px, 16vw, 260px)` | Homepage / page H1 |
| Display L | `clamp(60px, 9vw, 160px)` | Section titles, manifesto |
| Display M | `clamp(36px, 5vw, 72px)` | Standard section heads |
| Display S | `clamp(28px, 3.5vw, 52px)` | Service rows |
| Body L | 18-22px / Fraunces italic 300 | Editorial body |
| Body | 16px / Archivo 400 | Default body |
| Label | 11px tracking .28em uppercase Archivo | All labels, eyebrows |
| Devanagari sub | clamp(14px, 1.4vw, 26px) Tiro Devanagari Hindi | Hindi sub-lines |

## Spacing
- Section padding: `py-32` (128px) for major sections; `py-44` (176px) for hero/manifesto/final CTA.
- Container max-width: `1320px` with `px-7` (28px gutters).
- Grid gap default: `gap-6` for cards, `gap-12` for editorial 2-col, `gap-20` for hero side-by-side.

## Components
| Component | Notes |
|---|---|
| Button (primary) | `bg-saffron` on dark, scale-hover via Magnet |
| Button (ghost) | `border-ink` with fill-on-hover (ink → bg swap) |
| Card | `bg-bg-2`, `border-line`, hover → `border-saffron` |
| Service row | Spotlight hover on row, `padding-left: 24px` on hover |
| Marquee | `animate-[kalaa-mq_38s_linear_infinite]`, paused under prefers-reduced-motion |
| Eyebrow label | small width swatch + label + Hindi sub |

## Grid system
- 12-column grid on `md:` and up. Featured work uses 6/6, 4/4/4, 8/4.
- Editorial sections use asymmetric 1fr / 1.4fr (about) or 80px / 1fr / 1fr (pillars).

## Motion rules
- Default ease: `cubic-bezier(.2,.8,.2,1)` (matches Framer Motion's `[0.2, 0.8, 0.2, 1]`).
- Reveal-on-scroll: `opacity 0→1` + `y +40 → 0` over 0.9s.
- Marquee: 38s linear infinite for culture ticker; 50s for brands strip.
- Magnetic CTAs: translate by `0.25–0.35` of mouse delta, spring back on leave.
- All motion respects `prefers-reduced-motion: reduce` (animation-duration → 0.01ms).

## Grain / noise
- A single fixed full-viewport SVG `feTurbulence` element at `opacity: .22`, `mix-blend-mode: overlay`, with an 8-step `steps(8)` shift over 7s.
- Hidden under reduced-motion to prevent flicker discomfort.

## Editorial layout guidance
- One accent per section. The saffron should never compete with itself.
- Devanagari and English never share the same baseline weight — Hindi is always one step softer.
- Numeric identifiers (01, 02, 03) are always Anton, always `--ink-mute` until hovered.
- Big numbers (CountUp metrics) always use Anton + `--mustard`.
