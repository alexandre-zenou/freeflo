import { beforeEach, describe, expect, it } from "vitest";

/**
 * Le magasin de session lit `window.localStorage` à chaque appel, jamais au
 * chargement du module : un faux `window` posé avant l'import suffit donc à le
 * tester en environnement Node, sans jsdom.
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

const { addBooking, adminMember, bookingRef, cancelBooking, demoMembers, signIn, signOut, signUp } =
  await import("./account");

/* L'état ne se lit que par un hook, inappelable hors React : on vérifie donc ce
   que le magasin a effectivement écrit dans `localStorage`. */
function state() {
  const session = store.get("ff-session") ?? "";
  const bookings: Record<string, unknown[]> = JSON.parse(store.get("ff-bookings") ?? "{}");
  return { session, bookings: bookings[session] ?? [] };
}

beforeEach(() => store.clear());

describe("session de démonstration", () => {
  it("refuse un email inconnu", () => {
    expect(signIn("personne@nulle-part.fr", "freeflo")).toBe("unknown-email");
  });

  it("refuse un mauvais mot de passe", () => {
    expect(signIn(demoMembers[0].email, "pas-le-bon")).toBe("wrong-password");
  });

  it("connecte le compte de démonstration, casse et espaces compris", () => {
    expect(signIn(`  ${demoMembers[0].email.toUpperCase()} `, demoMembers[0].password)).toBe("ok");
    expect(state().session).toBe(demoMembers[0].email);
  });

  it("déconnecte", () => {
    signIn(demoMembers[0].email, demoMembers[0].password);
    signOut();
    expect(state().session).toBe("");
  });

  it("crée un compte, puis refuse le doublon", () => {
    expect(signUp("Alex", "Zenou", "Alex@Studio.fr", "motdepasse")).toBe("ok");
    expect(signUp("Alex", "Zenou", "alex@studio.fr", "motdepasse")).toBe("email-taken");
  });

  it("l'espace pro tient à un seul compte, marqué admin", () => {
    expect(adminMember.role).toBe("admin");
    expect(demoMembers.filter((m) => m.role === "admin")).toHaveLength(1);
    expect(signIn(adminMember.email, adminMember.password)).toBe("ok");
  });

  it("une inscription ne crée jamais un administrateur", () => {
    signUp("Alex", "Zenou", "alex@studio.fr", "motdepasse");
    const created = JSON.parse(store.get("ff-members") ?? "[]");
    expect(created[0].role).toBe("member");
  });

  it("connecte un compte créé", () => {
    signUp("Alex", "Zenou", "alex@studio.fr", "motdepasse");
    signOut();
    expect(signIn("alex@studio.fr", "motdepasse")).toBe("ok");
  });
});

describe("réservations", () => {
  const booking = { offerId: "the-new-me-pilates", price: 12, ref: "FLO-THE-99", bookedAt: 1 };

  it("n'enregistre rien sans session", () => {
    addBooking(booking);
    expect(store.get("ff-bookings")).toBeUndefined();
  });

  it("attache la réservation au compte connecté, sans doublon", () => {
    signIn(demoMembers[0].email, demoMembers[0].password);
    addBooking(booking);
    addBooking(booking);
    expect(state().bookings).toHaveLength(1);
  });

  it("annule par référence", () => {
    signIn(demoMembers[0].email, demoMembers[0].password);
    addBooking(booking);
    cancelBooking(booking.ref);
    expect(state().bookings).toHaveLength(0);
  });

  it("cloisonne les réservations par compte", () => {
    signIn(demoMembers[0].email, demoMembers[0].password);
    addBooking(booking);
    signOut();
    signIn(demoMembers[1].email, demoMembers[1].password);
    expect(state().bookings).toHaveLength(0);
  });

  it("reprend la référence affichée par le tunnel de paiement", () => {
    expect(bookingRef("the-new-me-pilates", 20, 3)).toBe("FLO-THE-143");
  });
});
