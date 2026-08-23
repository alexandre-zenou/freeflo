"use client";

import { useCallback, useState } from "react";
import type { PillOption } from "@/components/ui/pill-select";
import { NEARBY } from "@/lib/geo";

export type GeoState = "idle" | "asking" | "granted" | "denied";
export interface Coords {
  lat: number;
  lng: number;
}

/**
 * Position du visiteur, demandée au clic (jamais au chargement : le navigateur
 * afficherait sa fenêtre de permission avant que la page ait rien montré).
 *
 * `denied` couvre les trois échecs possibles, traités de la même façon côté
 * interface : navigateur sans `geolocation`, permission refusée, et délai
 * dépassé. Les composants passent leurs réactions en rappels plutôt que de
 * les déclencher dans un effet.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>("idle");
  const [position, setPosition] = useState<Coords | null>(null);

  const request = useCallback(
    (on?: { granted?: (c: Coords) => void; denied?: () => void }) => {
      if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
        setState("denied");
        on?.denied?.();
        return;
      }
      setState("asking");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(c);
          setState("granted");
          on?.granted?.(c);
        },
        () => {
          setPosition(null);
          setState("denied");
          on?.denied?.();
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
      );
    },
    [],
  );

  return { state, position, request };
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
