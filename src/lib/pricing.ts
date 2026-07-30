/**
 * FREEFLO — moteur de dégressivité tarifaire.
 *
 * Traduction directe de la grille du cahier des charges (§3).
 * La réduction s'approfondit à mesure que l'échéance approche ET que le
 * nombre de places restantes diminue. Fonction pure : mêmes entrées → même
 * sortie, calculable côté serveur (cron) comme côté client (affichage live).
 */

export type StockBand = "many" | "few" | "last"; // >5 | 3-5 | 1-2

export interface Tier {
  /** Borne supérieure exclusive, en heures avant l'échéance. */
  maxHoursBefore: number;
  label: string;
  /** Réduction (%) par bande de stock : [>5, 3-5, 1-2]. */
  discount: [number, number, number];
}

/** Grille §3, de la plus lointaine à la plus proche. `Infinity` = plein tarif. */
export const TIERS: Tier[] = [
  { maxHoursBefore: Infinity, label: "+ de 48 h", discount: [0, 0, 0] },
  { maxHoursBefore: 48, label: "24 – 48 h", discount: [25, 15, 0] },
  { maxHoursBefore: 24, label: "12 – 24 h", discount: [45, 30, 15] },
  { maxHoursBefore: 12, label: "2 – 12 h", discount: [55, 40, 25] },
  { maxHoursBefore: 2, label: "Sprint final (- de 2 h)", discount: [60, 50, 35] },
];

/** Commission plateforme de base (§6.2). Plancher plus bas quand la remise est forte. */
const COMMISSION_BASE = 25;
const COMMISSION_FLOOR = 8;

export function stockBand(placesLeft: number): StockBand {
  if (placesLeft >= 5) return "many";
  if (placesLeft >= 3) return "few";
  return "last";
}

function bandIndex(band: StockBand): 0 | 1 | 2 {
  return band === "many" ? 0 : band === "few" ? 1 : 2;
}

export function activeTier(hoursBefore: number): Tier {
  // Le premier palier dont la borne couvre l'échéance restante.
  return (
    [...TIERS]
      .sort((a, b) => a.maxHoursBefore - b.maxHoursBefore)
      .find((t) => hoursBefore < t.maxHoursBefore) ?? TIERS[0]
  );
}

export interface PriceState {
  basePrice: number;
  currentPrice: number;
  discountPct: number;
  savings: number;
  tierLabel: string;
  band: StockBand;
  hoursBefore: number;
  /** Urgence normalisée 0→1 (0 = loin, 1 = sprint final). Pilote la jauge d’urgence. */
  heat: number;
  isFinalSprint: boolean;
  commissionPct: number;
}

export function computePrice(
  basePrice: number,
  placesLeft: number,
  hoursBefore: number,
): PriceState {
  const band = stockBand(placesLeft);
  const tier = activeTier(Math.max(0, hoursBefore));
  const discountPct = tier.discount[bandIndex(band)];
  const currentPrice = round2(basePrice * (1 - discountPct / 100));
  const savings = round2(basePrice - currentPrice);

  // heat : 0 à +48 h, monte jusqu'à 1 à l'échéance (courbe douce).
  const heat = clamp01(1 - Math.max(0, hoursBefore) / 48);

  // Commission dégressive : plus la remise est forte, plus la commission baisse.
  const commissionPct = round2(
    COMMISSION_BASE - (COMMISSION_BASE - COMMISSION_FLOOR) * (discountPct / 60),
  );

  return {
    basePrice,
    currentPrice,
    discountPct,
    savings,
    tierLabel: tier.label,
    band,
    hoursBefore: Math.max(0, hoursBefore),
    heat,
    isFinalSprint: hoursBefore < 2,
    commissionPct,
  };
}

export function hoursUntil(iso: string, now: number = Date.now()): number {
  return (new Date(iso).getTime() - now) / 3_600_000;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
