# FREEFLO

*Burn Calories, Not Cash.* — Le sport de dernière minute, à prix qui fond.

A two-sided marketplace (Too Good To Go for unsold gym/sport-class slots). This repo is
the **phase-1 deliverable: an on-brand marketing site + a clickable, seed-data product
demo** (no auth, no real payments). The full transactional platform is designed in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Run

```bash
npm run dev      # http://localhost:3222
npm run build    # production build (all 18 routes)
npm test         # pricing-engine unit tests
```

## What's inside

- **Marketing home** — hero, how-it-works, a *live* dégressivité demo, live offer grid, vendor CTA, FAQ
- **`/offres`** — list + stylized map, filters, sort (the core client screen)
- **`/offres/[id]`** — offer detail + booking flow (reserve → mock pay → QR confirmation)
- **`/inscrire-son-centre`** — vendor recruitment + commission grid + mock signup
- **`/pro`** — vendor dashboard mockup (MyStore-style: KPIs, offers, orders, daily payouts)
- **`src/lib/pricing.ts`** — the dégressivité engine (cahier §3), pure + unit-tested

See [`CLAUDE.md`](CLAUDE.md) for stack, brand tokens, conventions and gotchas.

Built by the **Orvane** studio.
