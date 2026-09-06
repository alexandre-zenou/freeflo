"use client";

import { useCallback, useSyncExternalStore } from "react";
import { currentMember, signOut as deconnecter, useMember, type Member } from "@/lib/auth";

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

const BOOKINGS_KEY = "ff-bookings";
const EVENT = "ff-account-change";

export interface Booking {
  offerId: string;
  /** Prix payé au moment du clic : la dégressivité continue, la réservation non. */
  price: number;
  ref: string;
  bookedAt: number;
  /**
   * Début du cours, en horodatage ABSOLU, figé à la réservation.
   *
   * Les offres de démo ne portent qu'un `startsInHours` relatif à « maintenant »
   * (voir `site.ts`) : lu deux jours plus tard, il annonce toujours le même
   * délai, et une réservation ne deviendrait donc jamais passée. C'est ce champ
   * qui fait basculer un cours de « À venir » vers « Historique ».
   *
   * Facultatif : les réservations déjà dans le navigateur d'un visiteur ont été
   * écrites avant lui. Sans valeur, un cours est traité comme à venir, ce qui
   * est le défaut le moins surprenant.
   */
  startsAt?: number;
}

const normalize = (email: string) => email.trim().toLowerCase();

function read(): string {
  try {
    return window.localStorage.getItem(BOOKINGS_KEY) ?? "";
  } catch {
    return "";
  }
}

function write(value: string) {
  try {
    window.localStorage.setItem(BOOKINGS_KEY, value);
  } catch {
    /* stockage indisponible : la réservation ne survivra pas au rechargement */
  }
}

function parse(raw: string): Record<string, Booking[]> {
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? (v as Record<string, Booking[]>) : {};
  } catch {
    return {};
  }
}

/** Tableau figé : `useSyncExternalStore` compare les instantanés par référence. */
const VIDE: Booking[] = [];

let cleCache: string | null = null;
let cache: Record<string, Booking[]> = {};

function toutes(): Record<string, Booking[]> {
  const brut = read();
  if (brut === cleCache) return cache;
  cleCache = brut;
  cache = parse(brut);
  return cache;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const annoncer = () => window.dispatchEvent(new Event(EVENT));

export interface AccountState {
  member: Member | null;
  bookings: Booking[];
}

/**
 * `{ member, bookings }`.
 *
 * Le membre vient du contexte d'authentification, les réservations du
 * navigateur : deux sources, réunies ici pour que les composants existants
 * n'aient pas à connaître ce détail.
 */
export function useAccount(): AccountState {
  const member = useMember();
  const email = member ? normalize(member.email) : "";
  const bookings = useSyncExternalStore(
    subscribe,
    () => (email ? (toutes()[email] ?? VIDE) : VIDE),
    () => VIDE,
  );
  return { member, bookings };
}

/*
  L'e-mail du compte sert de clé : les réservations restent cloisonnées quand
  deux personnes se connectent tour à tour sur le même navigateur.

  `currentMember()` et non un crochet : ces fonctions sont appelées depuis des
  gestionnaires d'événements, hors rendu.
*/
function emailCourant(): string {
  const m = currentMember();
  return m ? normalize(m.email) : "";
}

/** Enregistre la réservation sur le compte connecté. Sans session, ne fait rien. */
export function addBooking(booking: Booking) {
  const email = emailCourant();
  if (!email) return;
  const all = toutes();
  const liste = all[email] ?? [];
  if (liste.some((b) => b.ref === booking.ref)) return;
  write(JSON.stringify({ ...all, [email]: [booking, ...liste] }));
  annoncer();
}

export function cancelBooking(ref: string) {
  const email = emailCourant();
  if (!email) return;
  const all = toutes();
  const liste = all[email] ?? [];
  write(JSON.stringify({ ...all, [email]: liste.filter((b) => b.ref !== ref) }));
  annoncer();
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

/** Référence lisible, stable pour une même offre au même prix. */
export function bookingRef(offerId: string, basePrice: number, placesLeft: number): string {
  const graine = `${offerId}${basePrice}${placesLeft}`;
  let n = 0;
  for (let i = 0; i < graine.length; i++) n = (n * 31 + graine.charCodeAt(i)) % 10000;
  return `FLO-${offerId.slice(0, 3).toUpperCase()}-${String(n).padStart(4, "0")}`;
}

/** Déconnexion stable en référence, pour un `onClick` ou un effet. */
export function useSignOut() {
  return useCallback(() => void deconnecter(), []);
}
