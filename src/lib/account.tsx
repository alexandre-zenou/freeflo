"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Session « membre » de DÉMONSTRATION.
 *
 * Phase 1 : pas de backend. Ce module tient donc lieu d'authentification, avec
 * des comptes en dur (`demoMembers`) plus ceux créés depuis le formulaire, le
 * tout dans `localStorage`. Ce n'est PAS de la sécurité : le mot de passe est
 * lisible dans le navigateur et rien n'est vérifié côté serveur. Aucune page
 * n'est d'ailleurs protégée par ce module, seulement habillée par lui.
 *
 * Phase 2 : `src/lib/supabase/*` remplace tout ce fichier. Les composants n'ont
 * alors qu'à échanger `useMember()` / `signIn` / `signOut` contre leurs
 * équivalents Supabase, la forme des données est déjà la bonne.
 *
 * Le magasin suit le patron de `i18n.tsx` : `useSyncExternalStore` sur
 * `localStorage`, donc pas de `setState` dans un effet, un rendu serveur
 * toujours déconnecté, et la session qui se propage aux autres onglets.
 */

const SESSION_KEY = "ff-session";
const MEMBERS_KEY = "ff-members";
const BOOKINGS_KEY = "ff-bookings";
const EVENT = "ff-account-change";

export type Role = "member" | "admin";

export interface Member {
  firstName: string;
  lastName: string;
  email: string;
  /**
   * `admin` ouvre l'espace pro, et rien d'autre : c'est un accès aux DONNÉES de
   * l'application (offres des centres, commandes, planning), pas un pouvoir sur
   * les comptes des membres. Toute inscription depuis le site crée un `member`.
   */
  role: Role;
}

interface StoredMember extends Member {
  password: string;
}

export interface Booking {
  offerId: string;
  /** Prix payé au moment du clic : la dégressivité continue, la réservation non. */
  price: number;
  ref: string;
  bookedAt: number;
}

/**
 * Comptes de test internes. Ils servent à parcourir la partie membre sans rien
 * installer, et restent valables sur la démo en ligne (la cliente peut donc se
 * connecter elle-même). À supprimer le jour où Supabase prend le relais.
 */
export const demoMembers: StoredMember[] = [
  { firstName: "Thomas", lastName: "Durand", email: "demo@freeflo.fr", password: "freeflo", role: "member" },
  { firstName: "Flore", lastName: "Lemaire", email: "flore@freeflo.fr", password: "freeflo", role: "member" },
  { firstName: "Admin", lastName: "FREEFLO", email: "admin@freeflo.fr", password: "freeflo-admin", role: "admin" },
];

/** Le compte d'administration, seul à ouvrir l'espace pro. */
export const adminMember = demoMembers.find((m) => m.role === "admin")!;

function read(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    /* localStorage indisponible (navigation privée) : session vide */
    return "";
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* non persisté : la session ne survivra pas au rechargement, sans plus */
  }
}

function parse<T>(raw: string, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const normalize = (email: string) => email.trim().toLowerCase();

function allMembers(): StoredMember[] {
  return [...demoMembers, ...parse<StoredMember[]>(read(MEMBERS_KEY), [])];
}

export interface AccountState {
  member: Member | null;
  bookings: Booking[];
}

/** Objet figé : `useSyncExternalStore` compare les snapshots par référence. */
const SIGNED_OUT: AccountState = { member: null, bookings: [] };

/*
  Le snapshot doit garder la MÊME référence tant que rien n'a bougé, sinon React
  boucle. On mémorise donc les trois chaînes brutes lues et l'objet qu'elles ont
  produit, et on ne reconstruit que si l'une d'elles a changé.
*/
let cacheKey: string | null = null;
let cached: AccountState = SIGNED_OUT;

function getSnapshot(): AccountState {
  const session = read(SESSION_KEY);
  const members = read(MEMBERS_KEY);
  const bookings = read(BOOKINGS_KEY);
  const key = `${session} ${members} ${bookings}`;
  if (key === cacheKey) return cached;

  cacheKey = key;
  const email = normalize(session);
  const found = email ? allMembers().find((m) => normalize(m.email) === email) : undefined;
  cached = found
    ? {
        /* `lastName` et `role` sont arrivés après : les comptes déjà créés en
           local n'en ont pas, et un compte sans rôle n'est PAS administrateur. */
        member: {
          firstName: found.firstName,
          lastName: found.lastName ?? "",
          email: found.email,
          role: found.role === "admin" ? "admin" : "member",
        },
        bookings: parse<Record<string, Booking[]>>(bookings, {})[email] ?? [],
      }
    : SIGNED_OUT;
  return cached;
}

/** Le serveur rend toujours la page déconnectée, la session s'applique après hydratation. */
const getServerSnapshot = (): AccountState => SIGNED_OUT;

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const announce = () => window.dispatchEvent(new Event(EVENT));

export type SignInResult = "ok" | "unknown-email" | "wrong-password";

export function signIn(email: string, password: string): SignInResult {
  const found = allMembers().find((m) => normalize(m.email) === normalize(email));
  if (!found) return "unknown-email";
  if (found.password !== password) return "wrong-password";
  write(SESSION_KEY, normalize(found.email));
  announce();
  return "ok";
}

export type SignUpResult = "ok" | "email-taken";

export function signUp(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): SignUpResult {
  if (allMembers().some((m) => normalize(m.email) === normalize(email))) return "email-taken";
  const created = parse<StoredMember[]>(read(MEMBERS_KEY), []);
  created.push({
    firstName: firstName.trim() || "Membre",
    lastName: lastName.trim(),
    email: normalize(email),
    password,
    /* Jamais d'administrateur par inscription : le rôle ne se donne qu'ici,
       dans le code, et passera par Supabase en phase 2. */
    role: "member",
  });
  write(MEMBERS_KEY, JSON.stringify(created));
  write(SESSION_KEY, normalize(email));
  announce();
  return "ok";
}

export function signOut() {
  write(SESSION_KEY, "");
  announce();
}

function saveBookings(email: string, list: Booking[]) {
  const all = parse<Record<string, Booking[]>>(read(BOOKINGS_KEY), {});
  all[normalize(email)] = list;
  write(BOOKINGS_KEY, JSON.stringify(all));
  announce();
}

/** Enregistre la réservation sur le compte connecté. Sans session, ne fait rien. */
export function addBooking(booking: Booking) {
  const { member, bookings } = getSnapshot();
  if (!member) return;
  if (bookings.some((b) => b.ref === booking.ref)) return;
  saveBookings(member.email, [booking, ...bookings]);
}

export function cancelBooking(ref: string) {
  const { member, bookings } = getSnapshot();
  if (!member) return;
  saveBookings(
    member.email,
    bookings.filter((b) => b.ref !== ref),
  );
}

/** Référence de réservation, identique à celle qu'affiche le tunnel de paiement. */
export function bookingRef(offerId: string, basePrice: number, placesLeft: number): string {
  return `FLO-${offerId.slice(0, 3).toUpperCase()}-${String(basePrice * 7 + placesLeft)}`;
}

/** `{ member, bookings }`, `member` vaut `null` tant que personne n'est connecté. */
export function useAccount(): AccountState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/*
  Le serveur rend toujours la page déconnectée : sans ce garde-fou, une page
  réservée aux membres afficherait « connectez-vous » le temps d'un éclair avant
  que la session ne s'applique. `false` au rendu serveur et au premier rendu
  client, `true` juste après l'hydratation.
*/
const noopSubscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Raccourci pour les composants qui n'ont besoin que de « qui est connecté ». */
export function useMember(): Member | null {
  return useAccount().member;
}

/** `true` seulement pour le compte d'administration, qui ouvre l'espace pro. */
export function useIsAdmin(): boolean {
  return useMember()?.role === "admin";
}

/** Déconnexion stable en référence, pour un `onClick` ou un effet. */
export function useSignOut() {
  return useCallback(() => signOut(), []);
}
