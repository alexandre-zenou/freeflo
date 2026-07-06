"use client";

import { useEffect, useRef, useState } from "react";
import { computePrice, type PriceState } from "@/lib/pricing";

/**
 * Temps accéléré pour la démo : 1 seconde réelle ≈ 1,5 min « offre »,
 * pour qu'on voie réellement le prix fondre en regardant une carte.
 */
const DEMO_SPEED = 90;
const FLOOR_HOURS = 0.05;

export interface LivePrice extends PriceState {
  remainingHours: number;
}

export function useLivePrice(
  basePrice: number,
  placesLeft: number,
  startsInHours: number,
): LivePrice {
  const mountedAt = useRef<number | null>(null);
  const compute = (remaining: number): LivePrice => ({
    ...computePrice(basePrice, placesLeft, remaining),
    remainingHours: remaining,
  });

  const [state, setState] = useState<LivePrice>(() => compute(startsInHours));

  useEffect(() => {
    mountedAt.current = Date.now();
    const tick = () => {
      const elapsedRealMs = Date.now() - (mountedAt.current ?? Date.now());
      const elapsedOfferHours = (elapsedRealMs * DEMO_SPEED) / 3_600_000;
      const remaining = Math.max(FLOOR_HOURS, startsInHours - elapsedOfferHours);
      setState(compute(remaining));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePrice, placesLeft, startsInHours]);

  return state;
}
