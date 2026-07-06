import { describe, it, expect } from "vitest";
import {
  computePrice,
  stockBand,
  activeTier,
  hoursUntil,
} from "./pricing";

describe("stockBand", () => {
  it("classe le stock selon la grille §3", () => {
    expect(stockBand(9)).toBe("many");
    expect(stockBand(5)).toBe("many");
    expect(stockBand(4)).toBe("few");
    expect(stockBand(3)).toBe("few");
    expect(stockBand(2)).toBe("last");
    expect(stockBand(1)).toBe("last");
  });
});

describe("activeTier", () => {
  it("plein tarif au-delà de 48 h", () => {
    expect(activeTier(72).discount).toEqual([0, 0, 0]);
  });
  it("sélectionne le sprint final sous 2 h", () => {
    expect(activeTier(1).label).toContain("Sprint");
  });
  it("palier 12-24 h", () => {
    expect(activeTier(18).discount).toEqual([45, 30, 15]);
  });
});

describe("computePrice", () => {
  it("plein tarif loin de l'échéance", () => {
    const p = computePrice(40, 8, 72);
    expect(p.discountPct).toBe(0);
    expect(p.currentPrice).toBe(40);
  });

  it("applique -60% au plancher (sprint final, stock élevé)", () => {
    const p = computePrice(40, 9, 1);
    expect(p.discountPct).toBe(60);
    expect(p.currentPrice).toBe(16);
    expect(p.savings).toBe(24);
    expect(p.isFinalSprint).toBe(true);
  });

  it("dernière place à 24-48 h reste plein tarif (grille §3)", () => {
    const p = computePrice(30, 1, 36);
    expect(p.discountPct).toBe(0);
  });

  it("la commission baisse quand la remise augmente", () => {
    const plein = computePrice(40, 9, 72);
    const solde = computePrice(40, 9, 1);
    expect(solde.commissionPct).toBeLessThan(plein.commissionPct);
    expect(plein.commissionPct).toBe(25);
  });

  it("heat monte vers 1 à l'approche de l'échéance", () => {
    expect(computePrice(40, 5, 48).heat).toBeCloseTo(0, 5);
    expect(computePrice(40, 5, 0).heat).toBe(1);
  });
});

describe("hoursUntil", () => {
  it("calcule les heures restantes", () => {
    const now = Date.UTC(2026, 0, 1, 12, 0, 0);
    const iso = new Date(Date.UTC(2026, 0, 1, 15, 0, 0)).toISOString();
    expect(hoursUntil(iso, now)).toBeCloseTo(3, 5);
  });
});
