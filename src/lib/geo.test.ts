import { describe, expect, it } from "vitest";
import { distanceKm, frameAround } from "./geo";

const republique = { lat: 48.8674, lng: 2.3636 };
const marais = { lat: 48.8592, lng: 2.3549 };
const lyon = { lat: 45.7640, lng: 4.8357 };

/** Centre du cadre renvoyé, pour vérifier qu'il tombe bien sur le visiteur. */
const centerOf = ([[s, w], [n, e]]: [[number, number], [number, number]]) => ({
  lat: (s + n) / 2,
  lng: (w + e) / 2,
});

describe("frameAround", () => {
  it("garde le visiteur au centre exact, avec ou sans voisinage", () => {
    for (const near of [[], [marais], [marais, republique]]) {
      const c = centerOf(frameAround(republique, near));
      expect(c.lat).toBeCloseTo(republique.lat, 10);
      expect(c.lng).toBeCloseTo(republique.lng, 10);
    }
  });

  it("s'ouvre assez pour montrer le cours voisin", () => {
    const [[s, w], [n, e]] = frameAround(republique, [marais]);
    expect(marais.lat).toBeGreaterThan(s);
    expect(marais.lat).toBeLessThan(n);
    expect(marais.lng).toBeGreaterThan(w);
    expect(marais.lng).toBeLessThan(e);
  });

  it("ne descend pas sous le rayon minimum quand tout est à deux pas", () => {
    const [[s], [n]] = frameAround(republique, [{ ...republique, lat: republique.lat + 0.0002 }]);
    expect(distanceKm({ lat: s, lng: republique.lng }, { lat: n, lng: republique.lng })).toBeGreaterThan(1.2);
  });

  it("ne dézoome pas sur la France quand le visiteur est loin du catalogue", () => {
    const [[s, w], [n, e]] = frameAround(lyon, [marais, republique]);
    const c = centerOf([[s, w], [n, e]]);
    expect(c.lat).toBeCloseTo(lyon.lat, 10);
    /* Le cadre reste un voisinage : moins de 12 km de diagonale, pas 400. */
    expect(distanceKm({ lat: s, lng: w }, { lat: n, lng: e })).toBeLessThan(16);
  });

  it("corrige la longitude par la latitude, sinon le cadre serait trop large", () => {
    const [[, w], [, e]] = frameAround(republique, []);
    const [[s], [n]] = frameAround(republique, []);
    /* Un cadre carré au sol : même distance en largeur qu'en hauteur. */
    const height = distanceKm({ lat: s, lng: republique.lng }, { lat: n, lng: republique.lng });
    const width = distanceKm({ lat: republique.lat, lng: w }, { lat: republique.lat, lng: e });
    expect(width).toBeCloseTo(height, 1);
  });
});
