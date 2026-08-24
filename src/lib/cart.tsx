"use client";

import { useSyncExternalStore } from "react";

/**
 * Panier de DÉMONSTRATION.
 *
 * « Réserver » ne paie plus dans la foulée : la place entre au panier, et le
 * paiement se fait une seule fois, depuis `/panier`.
 *
 * Le panier est celui du NAVIGATEUR, pas celui du compte : on peut remplir son
 * panier sans être connecté, et le retrouver après s'être identifié au moment
 * de payer. C'est aussi ce qui permet d'arriver par un lien d'offre, d'ajouter,
 * puis de créer son compte sans rien perdre.
 *
 * Même patron que `i18n.tsx` et `account.tsx` : `useSyncExternalStore` sur
 * `localStorage`, rendu serveur toujours vide, propagation entre onglets.
 */

const CART_KEY = "ff-cart";
const EVENT = "ff-cart-change";

export interface CartItem {
  offerId: string;
  /**
   * Prix au moment de la mise au panier. La dégressivité continue de courir,
   * mais le montant annoncé au panier doit être celui qui sera débité, sinon il
   * changerait entre deux visites de la page.
   */
  price: number;
  addedAt: number;
}

function read(): string {
  try {
    return window.localStorage.getItem(CART_KEY) ?? "";
  } catch {
    /* localStorage indisponible (navigation privée) : panier vide */
    return "";
  }
}

function write(value: string) {
  try {
    window.localStorage.setItem(CART_KEY, value);
  } catch {
    /* non persisté : le panier ne survivra pas au rechargement, sans plus */
  }
}

/** Tableau figé : `useSyncExternalStore` compare les snapshots par référence. */
const EMPTY: CartItem[] = [];

let cacheKey: string | null = null;
let cached: CartItem[] = EMPTY;

function getSnapshot(): CartItem[] {
  const raw = read();
  if (raw === cacheKey) return cached;
  cacheKey = raw;
  if (!raw) {
    cached = EMPTY;
    return cached;
  }
  try {
    const parsed = JSON.parse(raw);
    cached = Array.isArray(parsed) ? (parsed as CartItem[]) : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

const getServerSnapshot = (): CartItem[] => EMPTY;

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function save(items: CartItem[]) {
  write(JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export type AddResult = "ok" | "already-in-cart";

/**
 * Une place par cours : les offres FREEFLO sont des places isolées de dernière
 * minute, et le nombre restant fond en même temps que le prix. Ajouter deux fois
 * le même cours ne fait donc rien, l'appelant s'en sert pour changer son bouton.
 */
export function addToCart(offerId: string, price: number): AddResult {
  const items = getSnapshot();
  if (items.some((i) => i.offerId === offerId)) return "already-in-cart";
  save([...items, { offerId, price, addedAt: Date.now() }]);
  return "ok";
}

export function removeFromCart(offerId: string) {
  save(getSnapshot().filter((i) => i.offerId !== offerId));
}

export function clearCart() {
  save([]);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price, 0);
}

/** Les lignes du panier, dans l'ordre d'ajout. */
export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Nombre de places au panier, pour la pastille de l'en-tête. */
export function useCartCount(): number {
  return useCart().length;
}
