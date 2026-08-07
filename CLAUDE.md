# CLAUDE.md — FREEFLO

Client project inside the **orvane** studio. This file is the source of truth for
FREEFLO and overrides the studio-level `CLAUDE.md` for anything in this folder.

## What FREEFLO is

A two-sided marketplace — **"Too Good To Go for unsold gym / sport-class slots."**
Sports centres list last-minute empty places; the discount deepens as the class
start-time approaches (dégressivité engine). Clients grab them cheap, nearby.

Reference doc: the client's `Cahier des charges — FREEFLO` (17 sections).

**Charte visuelle (juillet 2026) — la maquette Canva du client fait foi :**
`studentdeal.my.canva.site/freeflo-burn-calories-not-cash`. Elle a REMPLACÉ la
direction « périwinkle éditorial » du premier brief : le site est désormais
**rouge / or / crème**, titres gras. La maquette est un re-skin de notre propre
build (elle reprend nos données de démo), donc la structure est validée ; ce sont
l'identité et quelques ajouts qui changent.

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

Deux niveaux assumés : **public** (rouge/or franc) et **espace pro** (fond blanc,
bordeaux, serif — plus calme, cf. annotation client « mettre un fond blanc »).

| Token | Value | Use |
|---|---|---|
| `--brand` | `#a51c1e` | rouge FREEFLO : pastilles, chiffres, liens |
| `--brand-deep` | `#830606` | bandeaux pleins, carte de confirmation, héros |
| `--brand-tint` | `#f8e7e5` | lavis rouge pâle |
| `--gold` / `--gold-bright` | `#f4d26e` / `#ffe067` | prix, boutons d'action |
| `--gold-deep` | `#9a6c12` | or en **texte** sur fond clair (contraste AA) |
| `--cream` | `#fffdfa` | fond de page public |
| `--paper` | `#ffffff` | cartes |
| `--ink` / `--ink-soft` | `#1c1e26` / `#6a6560` | texte |
| `--pro-accent` / `--pro-surface` / `--pro-tan` | `#7b2624` / `#faf7f2` / `#d5c7b4` | espace pro |

**Type — `Inter`, et Inter seul** (retour client 08/2026 : « Inter light pour texte,
Inter gras pour titres »). Hanken Grotesk et Instrument Serif ont été RETIRÉS : il n'y
a plus de serif nulle part, espace pro compris. Corps de page en 300 ; le petit texte
(`.text-xs`, `.text-sm`) remonte à 400, sinon Inter Light devient illisible sur rouge.
Utilities : `.display` (gras), `.display-italic` (accroche), `.pro-display` (titres
espace pro, ex-`.serif-display`), `.accent-em` (ex-`.serif-em`), `.eyebrow`,
`.brand-mesh`, `.grain`, `.rise`, `.gold-glow`.

**Pas d'interlettrage, pas de tirets cadratins, pas de points médians** dans le texte
visible : le client les identifie comme « des marqueurs de Claude ». `.eyebrow` a un
`letter-spacing: 0`, et les séparateurs `—` / `·` ont été remplacés par des virgules,
deux-points ou des phrases séparées. Ne pas les réintroduire.

**Logo :** wordmark bicolore — « FREE » rouge + « FLO » or.

**The signature idea:** la dégressivité rendue *vivante* — les prix descendent, une
jauge chauffe. Or = la bonne affaire, rouge = l'urgence.

## Routes

| Route | What |
|---|---|
| `/` | Marketing home (hero, how-it-works, live mechanic, live offers, vendor CTA, FAQ) |
| `/offres` | Product: list + stylized map, filters, sort — the core client screen |
| `/offres/[id]` | Offer detail + booking flow (reserve → mock pay → confirmation) — SSG per offer |
| `/qui-sommes-nous` | À propos (demandé par la maquette) |
| `/comment-ca-marche` | Concept / how-it-works |
| `/inscrire-son-centre` | Vendor recruitment + commission grid + mock signup |
| `/pro` | Vendor dashboard mockup ("espace pro" / MyStore) |
| `/mentions-legales` | Legal (CGU/CGV/RGPD scaffold from §12) |

## Retour client du 07/08/2026 (`docs/FEEDBACK-2026-08.md`)

76 remarques inventoriées. **Règle qui prime sur tout le reste : aucun taux de remise,
aucune commission, aucun chiffre d'affaires affiché — ni côté public, ni dans l'espace
pro.** Les prix (plein barré + prix du moment) restent, eux, visibles.

Déjà supprimés à ce titre : `sections/mechanic.tsx` et `melt-curve.tsx` (fichiers
effacés), `sections/vendor-cta.tsx` (effacé), la grille de commission de
`/inscrire-son-centre`, l'alerte sprint + les KPI de CA + le graphique de revenus + la
carte « Prochain virement » + le panneau « Commission dégressive » du tableau de bord,
la courbe du tiroir « Créer une offre », et deux panneaux de `stats-tab`. Ne pas les
réintroduire. **Ne jamais nommer Too Good To Go ni Treatwell.**

Reste à faire : copie (§ lot C), en-tête et pied de page (D), parcours sportif (E),
espace pro (F), page « Inscrire votre centre » (G), fluidité façon microsoft.ai (I),
anglais réel (H). Détail et questions ouvertes dans `docs/FEEDBACK-2026-08.md`.

## Conventions & gotchas

- **All content lives in `src/lib/site.ts`.** Offers use relative `startsInHours` so the
  live pricing always looks active. Swap for real data at phase 2.
- **`src/lib/pricing.ts` is the dégressivité engine** — a pure translation of cahier §3.
  It's unit-tested; keep it pure so it can run server-side (cron) later. Edit the grid
  in `TIERS`.
- **Reveal animations use CSS + IntersectionObserver, not GSAP `.from()`.** GSAP's
  `.from()` strands elements at `opacity: 0` under React 19 StrictMode. Don't reintroduce
  `gsap.from` for entrance reveals — use `.rise` (CSS) or the `Reveal` component.
- **Photos du client** dans `public/categories/` (Canva) : yoga, pilates, boxe, hiit,
  cycling, reformer. Elles servent les catégories ET les offres. Natation / danse /
  coaching perso ont été **retirés** faute de visuels — pour les rétablir, remettre la
  catégorie *et* son offre dans `site.ts`.
- **Vidéo du héros** : `public/video/hero.{mp4,webm}` + `hero-poster.jpg`, encodées depuis
  la capture du client (audio retiré, faststart). Poster affiché si `prefers-reduced-motion`.
- **Pas de QR code** : le client a tranché pour une confirmation d'identité à l'accueil.
  `components/qr.tsx` a été supprimé — ne pas le réintroduire sans validation.
- **i18n maison** dans `src/lib/i18n.tsx` : `t("français", "english")`, pas de fichiers de
  traduction. **Le site est intégralement bilingue depuis 08/2026** (espace pro et données
  de démo compris). Les composants passent leurs deux versions inline ; les **données**
  (`site.ts`, `legal.ts`, `vendor-data.ts`) portent des champs jumeaux `*En`
  (`titleEn`, `textEn`, `labelEn`, `pEn`…). En ajoutant une chaîne visible, fournir
  systématiquement les deux langues.
  · La préférence est lue via `useSyncExternalStore` sur `localStorage` : pas de setState
  dans un effet, rendu serveur toujours en français, et la langue se propage aux onglets.
  · **Limite connue** : les métadonnées SEO (`<title>`, `description`) restent en français.
  Les localiser demanderait un routage `/fr` `/en`, écarté pour ne pas casser les URLs.
  · **Piège** : `RevealLines` réécrit le DOM du titre. Il doit lire le texte depuis sa
  **prop**, jamais depuis `el.textContent`, sinon le titre reste figé dans la langue
  précédente au changement FR/EN.
- Run: `npm run dev` (port 3222 via studio `launch.json`), `npm run build`, `npm test`.

## Open items before launch (from the cahier)

Copie anglaise complète (le sélecteur FR/EN est en place), photos pour natation /
danse / coaching perso si ces sports reviennent, vraie copie par centre, texte légal
définitif (juriste), domaine. Puis phase 2 (voir `docs/ARCHITECTURE.md`).

Points à confirmer avec le client sur la maquette : sa carte de confirmation affiche
« Total €35.00 » alors que l'offre est à €20 (prix plein vs prix remisé) ; et
« mettre un fond blanc » a été appliqué au fond de page de l'espace pro.
