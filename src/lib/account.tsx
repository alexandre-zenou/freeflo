"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { currentMember, signOut as deconnecter, useMember, type Member } from "@/lib/auth";
import { createClient, supabaseConfigure } from "@/lib/supabase/client";

/**
 * Réservations du membre, et pont vers l'authentification.
 *
 * Ce module ne gère PLUS l'identité : elle vient de Supabase depuis le
 * 28/08/2026 (`lib/auth.tsx`). Les comptes en dur et la session dans
 * `localStorage` ont disparu, avec eux la fiction d'une authentification.
 *
 * Il reste ici les RÉSERVATIONS, qui vivent encore dans le navigateur faute de
 * table `bookings` : c'est la tranche suivante de la phase 2. Elles sont donc
 * toujours propres à un appareil, et un même compte ne les retrouve pas d'un
 * téléphone à l'autre. À dire à la cliente tant que ce n'est pas migré.
 *
 * Les crochets d'identité (`useMember`, `useHydrated`, `useIsPro`…) sont
 * ré-exportés tels quels : quinze composants les importent depuis
 * `@/lib/account` et n'ont pas à savoir que le socle a changé.
 */
export {
  AuthProvider,
  currentMember,
  dernierDetailInscription,
  signIn,
  signOut,
  signUp,
  useHydrated,
  useIsAdmin,
  useIsPro,
  useMember,
  type Member,
  type Role,
  type SignInResult,
  type SignUpResult,
} from "@/lib/auth";

const EVENT = "ff-bookings-change";

export interface Booking {
  /** Identifiant en base. Absent des réservations d'avant la migration. */
  id?: string;
  offerId: string;
  /** Prix payé, en euros. La base le garde en centimes, voir `enEuros`. */
  price: number;
  ref: string;
  bookedAt: number;
  /** Début du cours, horodatage absolu, fixé par le SERVEUR au paiement. */
  startsAt?: number;
}

/*
  Les réservations viennent désormais de la BASE, table `bookings`, depuis le
  22/09/2026. Elles vivaient auparavant dans le navigateur, ce qui avait deux
  défauts : un client ne les retrouvait pas d'un appareil à l'autre, et
  surtout le navigateur les inscrivait lui-même après le paiement, si bien
  qu'on pouvait s'en fabriquer depuis la console.

  Ici, on ne fait que LIRE. Créer une réservation est l'affaire du serveur,
  après confirmation de Stripe (`lib/reservations-serveur.ts`), et la base
  refuse toute insertion venue d'un navigateur, même connecté.

  La RLS ne renvoie que les réservations du compte connecté : pas de filtre
  `client_id` à ajouter ici, et surtout pas à confier au navigateur.
*/
const VIDE: Booking[] = [];

let cache: { email: string; liste: Booking[] } = { email: "", liste: VIDE };
const abonnes = new Set<() => void>();
const prevenir = () => abonnes.forEach((f) => f());

function subscribe(onChange: () => void) {
  abonnes.add(onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    abonnes.delete(onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

interface LigneBase {
  id: string;
  offer_id: string;
  ref: string;
  price_paid_cents: number;
  created_at: string;
  starts_at: string;
}

const enEuros = (cents: number) => Math.round(cents) / 100;

function versReservation(r: LigneBase): Booking {
  return {
    id: r.id,
    offerId: r.offer_id,
    ref: r.ref,
    price: enEuros(r.price_paid_cents),
    bookedAt: Date.parse(r.created_at),
    startsAt: Date.parse(r.starts_at),
  };
}

/**
 * Relit les réservations du compte connecté.
 *
 * À appeler après un paiement confirmé ou une annulation : c'est le seul moyen
 * d'être à jour, puisque plus rien n'est écrit localement.
 */
export async function rechargerReservations(): Promise<void> {
  const m = currentMember();
  if (!m || !supabaseConfigure()) {
    cache = { email: "", liste: VIDE };
    prevenir();
    return;
  }
  const { data, error } = await createClient()
    .from("bookings")
    .select("id, offer_id, ref, price_paid_cents, created_at, starts_at")
    .eq("status", "confirmed")
    .order("starts_at", { ascending: false });

  if (error) {
    console.error("rechargerReservations:", error.message);
    return;
  }
  cache = { email: normalize(m.email), liste: (data as LigneBase[]).map(versReservation) };
  prevenir();
}

const normalize = (email: string) => email.trim().toLowerCase();

export interface AccountState {
  member: Member | null;
  bookings: Booking[];
}

/**
 * `{ member, bookings }`.
 *
 * Le membre vient du contexte d'authentification, les réservations de la base.
 * L'effet ne fait QUE déclencher la lecture : il ne pose aucun état React, il
 * alimente un magasin extérieur, et `useSyncExternalStore` fait le reste. C'est
 * ce qui le tient hors de la règle `react-hooks/set-state-in-effect`.
 */
export function useAccount(): AccountState {
  const member = useMember();
  const email = member ? normalize(member.email) : "";

  useEffect(() => {
    void rechargerReservations();
  }, [email]);

  const bookings = useSyncExternalStore(
    subscribe,
    /* Garde-fou : on ne montre pas les réservations d'un compte à un autre le
       temps que la relecture arrive, après un changement de session. */
    () => (email && cache.email === email ? cache.liste : VIDE),
    () => VIDE,
  );
  return { member, bookings };
}

/**
 * Ne crée PLUS rien : une réservation naît côté serveur, après Stripe.
 *
 * Conservée pour ne pas casser ses appelants, elle se contente désormais de
 * relire la base. L'ancienne version inscrivait la réservation dans le
 * navigateur, et c'était précisément la faille.
 */
export function addBooking(_booking?: Booking) {
  void rechargerReservations();
}

/**
 * Annule une réservation du compte connecté.
 *
 * Passe par la base, qui n'autorise qu'un seul geste au titulaire : faire
 * passer `status` à `cancelled`. Ni le prix ni la date ne sont modifiables
 * depuis le navigateur, la migration n'ouvre que cette colonne.
 */
export async function cancelBooking(refOuId: string): Promise<void> {
  if (!supabaseConfigure()) return;
  const cible = cache.liste.find((b) => b.id === refOuId || b.ref === refOuId);
  if (!cible?.id) return;
  const { error } = await createClient()
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", cible.id);
  if (error) console.error("cancelBooking:", error.message);
  await rechargerReservations();
}

/**
 * Un cours est-il déjà passé ?
 *
 * `now` en paramètre par défaut, comme les fonctions de `lib/format.ts` : cela
 * garde l'impureté hors des composants, où la règle `react-hooks/purity`
 * interdit `Date.now()` pendant le rendu.
 *
 * Sans `startsAt`, la réservation a été écrite avant l'ajout du champ : elle
 * compte comme à venir, ce qui est le défaut le moins surprenant.
 */
export function isPastBooking(b: Booking, now: number = Date.now()): boolean {
  return (b.startsAt ?? Infinity) <= now;
}

/* Déplacée dans `lib/booking-ref.ts`, lisible par le serveur. */
export { bookingRef } from "@/lib/booking-ref";

/** Déconnexion stable en référence, pour un `onClick` ou un effet. */
export function useSignOut() {
  return useCallback(() => void deconnecter(), []);
}
