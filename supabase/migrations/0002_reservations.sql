-- ============================================================================
-- FREEFLO, phase 2 — tranche 2 : les réservations
--
-- Jusqu'ici les réservations vivaient dans le navigateur (`lib/account.tsx`,
-- clé `ff-bookings`). Deux défauts, et le second est le plus grave :
--
-- 1. un client ne les retrouvait pas d'un appareil à l'autre ;
-- 2. c'était le NAVIGATEUR qui inscrivait la réservation après le paiement.
--    N'importe qui pouvait donc s'en fabriquer une depuis la console, sans
--    avoir rien payé. Rien côté serveur ne le vérifiait.
--
-- Ici, une réservation ne peut être CRÉÉE que par le serveur, avec la clé
-- `service_role`, après que Stripe a confirmé l'encaissement. Il n'y a
-- volontairement AUCUNE policy INSERT pour les utilisateurs connectés.
--
-- Les offres, elles, sont encore dans `src/lib/site.ts` : `offer_id` est donc
-- un texte et non une clé étrangère. Il deviendra une vraie référence quand
-- les offres passeront en base, dans la tranche suivante.
--
-- À exécuter dans Supabase → SQL Editor, APRÈS 0001.
-- ============================================================================

create type public.booking_status as enum ('confirmed', 'cancelled');

create table public.bookings (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references public.profiles (id) on delete cascade,
  -- Identifiant de l'offre dans `site.ts`. Texte tant que les offres ne sont
  -- pas en base ; voir l'en-tête.
  offer_id         text not null,
  -- Référence affichée au client et à l'accueil du centre, `FLO-XXX-0000`.
  ref              text not null,
  -- En CENTIMES entiers, comme Stripe. Un prix en euros flottants finirait
  -- tôt ou tard par un 13,199999 dans une facture.
  price_paid_cents integer not null check (price_paid_cents > 0),
  -- Début du cours, figé à la réservation. C'est lui qui fait passer un cours
  -- de « À venir » à « Historique ».
  starts_at        timestamptz not null,
  status           public.booking_status not null default 'confirmed',
  -- La session Stripe qui a payé. UNIQUE : c'est ce qui empêche qu'un même
  -- paiement soit transformé deux fois en réservation, par un double clic,
  -- un rechargement de la page de retour ou un rejeu malveillant.
  stripe_session_id text not null,
  created_at       timestamptz not null default now(),

  -- Un paiement peut couvrir plusieurs cours (le panier), d'où l'unicité sur
  -- le COUPLE session + offre, et non sur la session seule.
  unique (stripe_session_id, offer_id)
);

comment on table public.bookings is
  'Réservations payées. Créées UNIQUEMENT côté serveur après confirmation Stripe.';

create index bookings_client_idx on public.bookings (client_id, starts_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.bookings enable row level security;

-- Chacun ne voit que SES réservations.
create policy "réservations lisibles par leur titulaire"
  on public.bookings for select
  using (client_id = auth.uid());

create policy "réservations lisibles par l'administration"
  on public.bookings for select
  using (public.is_admin());

-- Annuler, oui : le client peut passer SA réservation en « cancelled ».
-- Seule la colonne `status` lui est ouverte, et seulement vers l'annulation.
create policy "annulation par le titulaire"
  on public.bookings for update
  using (client_id = auth.uid())
  with check (client_id = auth.uid() and status = 'cancelled');

revoke update on public.bookings from authenticated;
grant update (status) on public.bookings to authenticated;

-- Aucune policy INSERT ni DELETE : ni créer ni effacer une réservation depuis
-- le navigateur. Seule la clé `service_role`, côté serveur, le peut, et elle
-- contourne la RLS par construction.
