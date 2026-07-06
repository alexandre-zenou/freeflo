# FREEFLO — Architecture de la plateforme (MVP complet, phase 2)

> Ce document traduit le cahier des charges (17 sections) en une architecture technique.
> Le site actuel (`/`, `/offres`, `/pro`…) en est la **vitrine + démo cliquable** (phase 1,
> sans backend). Ce doc décrit le **produit transactionnel** à construire ensuite.

## 1. Vue d'ensemble

Marketplace à deux faces (centres ↔ clients) + back-office admin. Trois surfaces :

```
┌─ App cliente (web responsive, PWA) ──┐   ┌─ Espace pro « MyStore » ─┐   ┌─ Admin interne ─┐
│ découvrir · carte · réserver · payer │   │ offres · ventes · payouts │   │ KYC · litiges   │
└──────────────┬───────────────────────┘   └───────────┬──────────────┘   └────────┬────────┘
               └───────────────┬───────────────────────┴─────────────────────────── ┘
                     Next.js (App Router) + Server Actions / Route Handlers
                               │
        ┌──────────────────────┼───────────────────────────────────────┐
   Supabase (Postgres+PostGIS, Auth, RLS, Storage)   Stripe Connect   Moteur dégressivité (cron)
```

**Principe directeur (cahier) :** simplicité d'usage, rapidité de mise en ligne côté
centre, taux de conversion côté client. Le parcours client copie la logique 4 étapes de
Too Good To Go : découvrir → réserver/payer → se présenter (QR) → profiter.

## 2. Stack recommandée

| Couche | Choix | Pourquoi |
|---|---|---|
| Front + API | **Next.js 16** (App Router, Server Actions) sur **Vercel** | déjà le socle studio ; SSR/SEO ; edge |
| Données | **Supabase Postgres + PostGIS** | Auth intégrée, RLS, requêtes géo natives, temps réel |
| Auth | **Supabase Auth** (email+mdp, vérif email ; Google/Apple en V2) | 2 rôles séparés client/centre |
| Paiement | **Stripe Connect** (comptes connectés par centre) | commission auto + payouts quotidiens |
| Fichiers | **Supabase Storage** | photos de cours, pièces KYC |
| Jobs | **Vercel Cron** (ou Supabase `pg_cron`) | recalcul des prix, déclenchement payouts |
| Notifs | **Resend** (email) + **Web Push** (PWA) ; SMS optionnel (OVH/Twilio) | MVP sans app native |
| Cartes | **MapLibre + tuiles** (ou Google Maps) + géocodage | vue carte + rayon |
| Analytics | **PostHog** (produit) + table interne KPIs | conversion, no-show, LTV |

App native React Native/Flutter : **V2**. La PWA (Web Push) couvre les notifications du MVP
sans imposer l'app native tout de suite.

## 3. Modèle de données (Postgres)

```
profiles            (id → auth.users, role: 'client'|'vendor'|'admin', email_verified)
vendors             (id, profile_id, name, siret, iban_last4, stripe_account_id,
                     kyc_status: 'pending'|'verified'|'rejected', address, geo geography(Point),
                     rating_avg, suspended_at)
categories          (slug, label)
offers              (id, vendor_id, category, title, description, base_price_cents,
                     qty_total, qty_sold, starts_at, duration_min, geo, photos[],
                     status: 'draft'|'live'|'sold_out'|'expired', created_at)
price_snapshots     (offer_id, computed_at, current_price_cents, discount_pct, commission_pct)
bookings            (id, offer_id, client_id, price_paid_cents, commission_cents,
                     status: 'pending'|'confirmed'|'redeemed'|'cancelled'|'refunded',
                     qr_token, stripe_payment_intent, created_at, cancel_deadline)
reviews             (id, booking_id, vendor_id, stars, comment, moderated_at)
payouts             (id, vendor_id, amount_cents, period, status, stripe_transfer_id)
claims              (id, booking_id, reason, evidence_url, status)
referrals           (code, referrer_id, referred_id, reward_status)
notifications       (id, user_id, type, sent_at)
```

Index géo : `CREATE INDEX ON offers USING GIST (geo)` → requêtes `ST_DWithin` par rayon.
RLS : un centre ne voit que ses offres/commandes ; un client que ses réservations ;
l'admin voit tout.

## 4. Le moteur de dégressivité (cahier §3) — cœur produit

Déjà implémenté en phase 1 comme **fonction pure** (`src/lib/pricing.ts`, testée). En
production, elle tourne aux **deux** endroits :

1. **Affichage temps réel** côté client : recalcul à la volée (la fonction pure, exécutée
   à chaque rendu / tick) → le prix affiché = prix payé à l'instant T.
2. **Cron serveur** (`/api/cron/reprice`, toutes les 5–15 min) : écrit un `price_snapshot`
   par offre live, passe les offres échues en `expired`, déclenche les notifs « il reste
   2 paniers près de toi ».

La **commission** est l'inverse de la remise (25 % plein tarif → plancher ~8 % en sprint
final) pour inciter à lister jusqu'au dernier moment. Calculée au moment du paiement à
partir du `price_snapshot` verrouillé.

## 5. Réservation & concurrence (cahier §6.3)

Race sur la dernière place → **verrou transactionnel** :

```sql
BEGIN;
UPDATE offers SET qty_sold = qty_sold + 1
  WHERE id = $1 AND qty_sold < qty_total
  RETURNING *;             -- 0 ligne → plus de place → 409
-- créer booking 'pending', créer PaymentIntent Stripe
COMMIT;
```

La réservation n'est **confirmée qu'après webhook `payment_intent.succeeded`**. Un job
libère les `pending` non payés au bout de N minutes. Annulation : remboursement intégral
jusqu'à `cancel_deadline` (6 h avant le créneau) ; au-delà, place due. No-show et litiges
→ table `claims` + formulaire preuve.

## 6. Paiement (Stripe Connect, cahier §6.2)

- Chaque centre = **compte connecté Stripe** (onboarding KYC via Stripe).
- Paiement client → `PaymentIntent` avec `application_fee_amount` = commission FREEFLO.
- **Payouts quotidiens** aux centres (argument commercial vs. mensuel — modèle Treatwell).
- Webhooks Stripe = source de vérité (succeeded, refunded, transfer.paid).
- FREEFLO ne stocke aucune donnée de carte.

## 7. Géolocalisation (cahier §6.4)

- Permission navigateur → position ; **fallback** ville/code postal si refusée.
- `ST_DWithin(offers.geo, user_point, radius)` trié par proximité **ou** urgence de remise.
- Vue carte (MapLibre) + vue liste, filtre rayon modifiable.
- Notifs géolocalisées à la publication d'une offre proche, **fréquence plafonnée** (anti-spam).

## 8. Back-office admin (cahier §7)

Dashboard interne : validation KYC (SIRET/IBAN) avant activation, vue transactions /
litiges / remboursements, suspension/bannissement, export comptable (commission 25 %),
pilotage des payouts, modération avis, KPIs globaux.

## 9. Analytics & KPIs internes (cahier §11)

Taux de conversion (vues→réservations), panier moyen, taux de no-show, LTV, rétention
centres & clients, répartition géographique. PostHog pour l'événementiel + vues SQL
matérialisées pour les KPIs business.

## 10. Légal & conformité (cahier §12)

CGU distinctes client / centre, CGV (grille de commission), RGPD (consentement, droit à
l'oubli, export), mentions légales, clause de non-responsabilité blessure (à valider par
juriste), vérification assurances RC pro des centres.

## 11. Roadmap

**MVP (V1)** — comptes client/centre, création d'offre, Stripe Connect + payouts
quotidiens, carte+liste+géoloc, moteur de dégressivité (cron), notation simple, admin
basique, CGU/RGPD, PWA + Web Push.

**V2** — app native, connexion Google/Apple, parrainage avancé, notifs IA (« il reste 2
paniers près de toi »), recommandations, commission différenciée nouveaux/fidèles
(Treatwell), boutons réseaux sociaux, « réserver pour un ami ».

## 12. Ce que la phase 1 (ce repo) valide déjà

- La marque, le ton, l'aesthetic (validés visuellement avec la cliente).
- Le parcours client complet, cliquable : liste/carte → détail → réservation → QR.
- L'espace pro (MyStore) : KPIs, offres du jour, commandes, payouts quotidiens.
- **Le moteur de dégressivité, en code pur et testé** — repris tel quel en phase 2.
