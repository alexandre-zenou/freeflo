import { describe, expect, it, vi } from "vitest";

/**
 * Ce fichier ne teste PLUS la session : elle est passée à Supabase le
 * 28/08/2026 (`lib/auth.tsx`), donc à un service distant, signé et hors de
 * portée d'un test unitaire. Les anciens cas (« refuse un mauvais mot de
 * passe », « une inscription ne crée jamais un administrateur ») testaient une
 * mécanique de démonstration qui n'existe plus ; la garantie correspondante est
 * désormais dans la migration SQL, portée par le déclencheur
 * `handle_new_user` et par `revoke update (role)`.
 *
 * Restent ici les RÉSERVATIONS, qui vivent encore dans le navigateur, et les
 * deux fonctions pures qui les accompagnent.
 */
const store = new Map<string, string>();

Object.defineProperty(globalThis, "window", {
  value: {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  },
  writable: true,
});

/* Qui est connecté est décidé par `lib/auth`, qu'on remplace : le brancher pour
   de vrai demanderait un réseau et une base, ce qui n'est pas l'objet ici. */

vi.mock("@/lib/auth", () => ({
  currentMember: () => null,
  signOut: async () => {},
  useMember: () => null,
  useHydrated: () => true,
  useIsAdmin: () => false,
  useIsPro: () => false,
  AuthProvider: ({ children }: { children: unknown }) => children,
  signIn: async () => "ok",
  signUp: async () => "ok",
  ROLE_COOKIE: "ff-role",
}));

const { bookingRef, isPastBooking } = await import("./account");



const booking = { offerId: "the-new-me-pilates", price: 12, ref: "FLO-THE-99", bookedAt: 1 };

/*
  Les tests « attache la réservation au compte », « cloisonne par compte » et
  « ignore la casse » ont été RETIRÉS le 22/09/2026. Ils vérifiaient que le
  navigateur inscrivait lui-même une réservation dans son stockage : c'était
  précisément la faille, puisqu'on pouvait s'en fabriquer une sans payer.

  Une réservation naît désormais côté serveur, après Stripe. Les garanties
  correspondantes sont testées dans `reservations-serveur.test.ts`, et le
  cloisonnement par compte est tenu par la RLS de Postgres, vérifiée contre la
  vraie base au moment de la migration.
*/

describe("référence de réservation", () => {
  it("reste stable pour une même offre au même prix", () => {
    expect(bookingRef("the-new-me-pilates", 24, 3)).toBe(bookingRef("the-new-me-pilates", 24, 3));
  });

  it("change quand le prix change", () => {
    expect(bookingRef("x", 24, 3)).not.toBe(bookingRef("x", 25, 3));
  });

  it("porte les trois premières lettres de l'offre", () => {
    expect(bookingRef("boxe-republique", 20, 2)).toMatch(/^FLO-BOX-\d{4}$/);
  });
});

describe("cours passé", () => {
  const maintenant = 1_700_000_000_000;

  it("passé si le début est derrière nous", () => {
    expect(isPastBooking({ ...booking, startsAt: maintenant - 1 }, maintenant)).toBe(true);
  });

  it("à venir si le début est devant", () => {
    expect(isPastBooking({ ...booking, startsAt: maintenant + 1 }, maintenant)).toBe(false);
  });

  it("à venir par défaut quand `startsAt` manque, réservation écrite avant le champ", () => {
    expect(isPastBooking(booking, maintenant)).toBe(false);
  });
});
