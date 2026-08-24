"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { PillOption } from "@/components/ui/pill-select";
import { NEARBY } from "@/lib/geo";

export type GeoState = "idle" | "asking" | "granted" | "denied";
export interface Coords {
  lat: number;
  lng: number;
}

/**
 * Position du visiteur, tenue par un MAGASIN partagé plutôt que par l'état d'un
 * composant.
 *
 * Le magasin vit au niveau du module : toutes les cartes du site lisent la même
 * position, et changer de page ne la perd pas. Il est doublé d'une trace dans
 * `localStorage`, pour qu'un rechargement complet ou un nouvel onglet reparte
 * de la dernière position connue au lieu de la vue par défaut. Même patron que
 * `i18n.tsx` et `account.tsx` : `useSyncExternalStore`, donc pas de `setState`
 * dans un effet et un rendu serveur toujours sans position.
 *
 * Ce que le magasin ne fait jamais : inventer une position. Il ne contient que
 * ce que le navigateur a répondu, et un refus le vide.
 */

const STORAGE_KEY = "ff-geo";
/** En deçà, la position est réputée à jour : aucun appel n'est refait. */
const FRESH_MS = 300_000;
/** Au-delà, la trace stockée est jetée : le visiteur a eu le temps de bouger. */
const KEEP_MS = 6 * 3_600_000;

interface Snapshot {
  state: GeoState;
  position: Coords | null;
  /** Vrai si le visiteur a cliqué : un échec spontané ne dit rien à l'écran. */
  askedByUser: boolean;
  /** Horodatage de la position, pour savoir si elle mérite un rafraîchissement. */
  at: number;
}

const EMPTY: Snapshot = { state: "idle", position: null, askedByUser: false, at: 0 };

let snapshot: Snapshot = EMPTY;
const listeners = new Set<() => void>();

function set(patch: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const getSnapshot = () => snapshot;
/** Le serveur ne sait jamais où est le visiteur : il rend la page sans position. */
const getServerSnapshot = () => EMPTY;

function store(position: Coords | null, at: number) {
  try {
    if (!position) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...position, at }));
  } catch {
    /* Stockage indisponible (navigation privée) : la position vivra le temps
       de la visite, ce qui suffit. */
  }
}

/*
  Reprise de la position stockée, une fois par chargement de page.

  Elle est adoptée AVANT la permission : la vérifier d'abord ferait attendre un
  aller-retour asynchrone, et la carte se serait déjà ouverte sur Paris. Si la
  permission a été retirée entre-temps, la vérification qui suit efface tout.
*/
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as { lat: number; lng: number; at: number };
    if (typeof saved?.lat !== "number" || typeof saved?.lng !== "number") return;
    if (Date.now() - saved.at > KEEP_MS) return store(null, 0);
    set({ position: { lat: saved.lat, lng: saved.lng }, state: "granted", at: saved.at });
  } catch {
    /* Trace illisible : on repart de zéro, sans bruit. */
  }
}

function locate(byUser: boolean, on?: { granted?: (c: Coords) => void; denied?: () => void }) {
  if (byUser) set({ askedByUser: true });
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    set({ state: "denied", position: null, at: 0 });
    store(null, 0);
    on?.denied?.();
    return;
  }
  set({ state: "asking" });
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const at = Date.now();
      set({ position: c, state: "granted", at });
      store(c, at);
      on?.granted?.(c);
    },
    () => {
      set({ state: "denied", position: null, at: 0 });
      store(null, 0);
      on?.denied?.();
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: FRESH_MS },
  );
}

/**
 * Ce que le navigateur pense de la permission, demandé une seule fois par
 * chargement de page. Safari ne l'implémente pas pour la géolocalisation :
 * `null` signifie « on ne sait pas », pas « refusé ».
 */
let permission: PermissionState | null | undefined;

async function readPermission(): Promise<PermissionState | null> {
  if (permission !== undefined) return permission ?? null;
  try {
    const status = await navigator.permissions?.query({ name: "geolocation" });
    permission = status?.state ?? null;
    /* La permission peut être retirée depuis les réglages du navigateur, sans
       recharger la page : on écoute, et on efface alors la position. */
    status?.addEventListener?.("change", () => {
      permission = status.state;
      if (status.state === "denied") {
        set({ state: "denied", position: null, at: 0 });
        store(null, 0);
      }
    });
  } catch {
    permission = null;
  }
  return permission ?? null;
}

/**
 * Met la position à jour sans jamais rouvrir de fenêtre de permission inutile.
 *
 * `mayPrompt` distingue les deux cas :
 *   · l'accueil, qui a le droit de demander au chargement (`auto`) ;
 *   · toutes les autres pages, qui se contentent de ce qui est déjà accordé.
 *
 * Un refus, qu'il vienne du navigateur ou de cette visite, arrête tout : on ne
 * relance jamais la demande de page en page.
 */
let pending = false;

async function ensure(mayPrompt: boolean) {
  if (pending || snapshot.state === "asking") return;
  const fresh = snapshot.position && Date.now() - snapshot.at < FRESH_MS;
  if (fresh || snapshot.state === "denied") return;

  pending = true;
  try {
    const perm = await readPermission();
    if (perm === "denied") {
      set({ state: "denied", position: null, at: 0 });
      store(null, 0);
      return;
    }
    /* Permission acquise : on rafraîchit en silence, aucune fenêtre ne s'ouvre.
       Permission encore à demander : seul l'accueil a le droit de le faire, et
       après un souffle, pour ne pas ouvrir la fenêtre sur une page blanche. */
    if (perm === "granted") return locate(false);
    if (!mayPrompt) return;
    await new Promise((r) => window.setTimeout(r, 400));
    /* Relu après l'attente : le visiteur a pu refuser entre-temps. */
    if (getSnapshot().state !== "denied") locate(false);
  } finally {
    pending = false;
  }
}

/**
 * `{ state, position, askedByUser, request }`, partagé par toutes les pages.
 *
 * `auto` autorise la demande spontanée au chargement (l'accueil). Sans lui, le
 * hook se contente de la position déjà connue et la rafraîchit en silence si la
 * permission est acquise.
 */
export function useGeolocation({ auto = false }: { auto?: boolean } = {}) {
  const { state, position, askedByUser } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  /*
    Reprise du stockage en effet de mise en page, pas au rendu : le rendu client
    doit être identique à celui du serveur, sinon l'hydratation se plaint. Comme
    la carte se construit après un `import()`, la position est en place avant
    elle et l'on n'aperçoit pas la vue par défaut au passage.
  */
  useEffect(() => {
    hydrate();
    void ensure(auto);
  }, [auto]);

  const request = useCallback(
    (on?: { granted?: (c: Coords) => void; denied?: () => void }) => locate(true, on),
    [],
  );

  return { state, position, askedByUser, request };
}

/**
 * L'option « Autour de moi », en tête du filtre Localisation des deux écrans qui
 * le portent. Un refus la laisse visible mais inactive, avec sa raison : c'est
 * le navigateur qui garde la permission refusée pour le domaine, la reproposer
 * ne rouvrirait aucune fenêtre.
 */
export function nearbyOption(
  state: GeoState,
  t: (fr: string, en?: string) => string,
): PillOption {
  return {
    value: NEARBY,
    label:
      state === "asking"
        ? t("Localisation…", "Locating…")
        : t("Autour de moi", "Around me"),
    disabled: state === "asking" || state === "denied",
    hint:
      state === "denied"
        ? t("Géolocalisation indisponible", "Location unavailable")
        : undefined,
  };
}
