import { beforeEach, describe, expect, it } from "vitest";

/**
 * Comme `account.test.ts` : le magasin lit `window.localStorage` à chaque appel
 * et jamais au chargement, un faux `window` posé avant l'import suffit donc à
 * le tester en environnement Node, sans jsdom.
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

const { addToCart, cartTotal, clearCart, removeFromCart } = await import("./cart");

/** Le panier ne se lit que par un hook : on vérifie ce qui est écrit. */
function items(): { offerId: string; price: number }[] {
  return JSON.parse(store.get("ff-cart") ?? "[]");
}

beforeEach(() => store.clear());

describe("panier", () => {
  it("part vide", () => {
    expect(items()).toEqual([]);
  });

  it("ajoute une place au prix du moment", () => {
    expect(addToCart("hot-yoga-marais", 14)).toBe("ok");
    expect(items()).toEqual([expect.objectContaining({ offerId: "hot-yoga-marais", price: 14 })]);
  });

  it("refuse le même cours deux fois, sans le dupliquer", () => {
    addToCart("hot-yoga-marais", 14);
    expect(addToCart("hot-yoga-marais", 11)).toBe("already-in-cart");
    expect(items()).toHaveLength(1);
  });

  it("garde le prix bloqué à l'ajout, même si l'offre a fondu depuis", () => {
    addToCart("hot-yoga-marais", 14);
    addToCart("hot-yoga-marais", 9);
    expect(items()[0].price).toBe(14);
  });

  it("retire une ligne sans toucher aux autres", () => {
    addToCart("hot-yoga-marais", 14);
    addToCart("boxe-republique", 20);
    removeFromCart("hot-yoga-marais");
    expect(items()).toEqual([expect.objectContaining({ offerId: "boxe-republique" })]);
  });

  it("se vide", () => {
    addToCart("hot-yoga-marais", 14);
    clearCart();
    expect(items()).toEqual([]);
  });

  it("additionne les places", () => {
    expect(cartTotal([])).toBe(0);
    expect(
      cartTotal([
        { offerId: "a", price: 14, addedAt: 1 },
        { offerId: "b", price: 20.5, addedAt: 2 },
      ]),
    ).toBe(34.5);
  });

  it("repart d'un panier vide si le contenu stocké est illisible", () => {
    store.set("ff-cart", "{pas du json");
    expect(addToCart("hot-yoga-marais", 14)).toBe("ok");
    expect(items()).toHaveLength(1);
  });
});
