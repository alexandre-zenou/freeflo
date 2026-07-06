# CLAUDE.md — FREEFLO

Client project inside the **orvane** studio. This file is the source of truth for
FREEFLO and overrides the studio-level `CLAUDE.md` for anything in this folder.

## What FREEFLO is

A two-sided marketplace — **"Too Good To Go for unsold gym / sport-class slots."**
Sports centres list last-minute empty places; the discount deepens as the class
start-time approaches (dégressivité engine). Clients grab them cheap, nearby.

Reference doc: the client's `Cahier des charges — FREEFLO` (17 sections). Visual
reference the client liked: a Canva concept page — *editorial, dusty-periwinkle,
oversized thin headline "Burn Calories, Not Cash.", ghost buttons.*

## Scope of THIS build (phase 1)

**Landing + clickable product demo.** Marketing site on-brand with the Canva, PLUS
high-fidelity, seed-data product screens the client can click through. **No auth, no
real Stripe, no backend** — all data is in `src/lib/site.ts`, prices are computed live
by a pure engine (`src/lib/pricing.ts`).

The full transactional MVP (Supabase auth + PostGIS, Stripe Connect, cron pricing,
KYC, admin) is **phase 2** — designed in `docs/ARCHITECTURE.md`, not built here.

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Tailwind v4** (`@theme inline` tokens in `src/app/globals.css`)
- **GSAP** available; hero/scroll reveals use **CSS + IntersectionObserver** (see note below)
- shadcn-style `Button` (CVA), **lucide-react** icons
- **vitest** for unit tests (the pricing engine is tested)
- Deployed to **Vercel** (not yet deployed)

## Brand tokens (per-client — do not import from other clients)

| Token | Value | Use |
|---|---|---|
| `--peri` | `#8b9ddb` | signature periwinkle |
| `--peri-deep` | `#4f61a8` | depth, accents on light |
| `--peri-tint` | `#dfe4f5` | pale washes, map canvas |
| `--ink` | `#16182b` | text, dark sections |
| `--bone` | `#f3f2ee` | page background |
| `--paper` | `#fbfaf7` | cards |
| `--ember` / `--ember-deep` | `#ff6a45` / `#e8431c` | **discounts & urgency only** |

**Type:** `Hanken Grotesk` (display, thin/wide) + `Instrument Serif` italic (editorial
flourish, `.serif-em`). Utilities: `.display`, `.eyebrow`, `.peri-mesh`, `.grain`, `.rise`.

**The signature idea:** the dégressivité grid made *alive* — prices tick down, an
**ember gauge** shows urgency. Cool calm brand, hot urgent discount.

## Routes

| Route | What |
|---|---|
| `/` | Marketing home (hero, how-it-works, live mechanic, live offers, vendor CTA, FAQ) |
| `/offres` | Product: list + stylized map, filters, sort — the core client screen |
| `/offres/[id]` | Offer detail + booking flow (reserve → mock pay → QR) — SSG per offer |
| `/comment-ca-marche` | Concept / how-it-works |
| `/inscrire-son-centre` | Vendor recruitment + commission grid + mock signup |
| `/pro` | Vendor dashboard mockup ("espace pro" / MyStore) |
| `/mentions-legales` | Legal (CGU/CGV/RGPD scaffold from §12) |

## Conventions & gotchas

- **All content lives in `src/lib/site.ts`.** Offers use relative `startsInHours` so the
  live pricing always looks active. Swap for real data at phase 2.
- **`src/lib/pricing.ts` is the dégressivité engine** — a pure translation of cahier §3.
  It's unit-tested; keep it pure so it can run server-side (cron) later. Edit the grid
  in `TIERS`.
- **Reveal animations use CSS + IntersectionObserver, not GSAP `.from()`.** GSAP's
  `.from()` strands elements at `opacity: 0` under React 19 StrictMode. Don't reintroduce
  `gsap.from` for entrance reveals — use `.rise` (CSS) or the `Reveal` component.
- Remote images: **Unsplash only** (whitelisted in `next.config.ts`). Replace with the
  client's real photography before launch.
- Run: `npm run dev` (port 3222 via studio `launch.json`), `npm run build`, `npm test`.

## Open items before launch (from the cahier)

Final logo, real photography, real copy per centre, definitive legal text (juriste),
FR/EN decision, domain. Then phase 2 (see `docs/ARCHITECTURE.md`).
