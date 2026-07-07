"use client";

import { useMemo, useRef } from "react";
import { computePrice, type StockBand } from "@/lib/pricing";
import { formatEuro } from "@/lib/format";

/**
 * La courbe de fonte — le moteur de dégressivité dessiné en direct.
 * Escalier calculé point par point par pricing.ts (jamais codé en dur),
 * synchronisé avec le slider et les pastilles de stock de la carte voisine.
 * Cliquer / glisser sur la courbe déplace aussi le temps.
 */
const W = 640;
const H = 300;
const PAD_T = 30;
const PAD_B = 40;
const PAD_L = 64; // place pour l'ordonnée des prix
const PAD_R = 16;
const MAX_HOURS = 48;

/** Bornes de paliers visibles dans la fenêtre 0–48 h. */
const BOUNDARIES = [24, 12, 2];

export function MeltCurve({
  base,
  band,
  places,
  hours,
  onScrub,
}: {
  base: number;
  band: StockBand;
  places: number;
  hours: number;
  onScrub: (h: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  const pts = useMemo(() => {
    const arr: { h: number; p: number }[] = [];
    for (let h = MAX_HOURS; h >= 0; h -= 0.25) {
      arr.push({ h, p: computePrice(base, places, h).currentPrice });
    }
    return arr;
  }, [base, places]);

  const minPrice = Math.min(...pts.map((p) => p.p));
  const x = (h: number) => PAD_L + (1 - h / MAX_HOURS) * (W - PAD_L - PAD_R);
  const y = (p: number) => {
    const lo = minPrice * 0.9;
    const hi = base * 1.03;
    return PAD_T + (1 - (p - lo) / (hi - lo)) * (H - PAD_T - PAD_B);
  };

  const line = pts.map((pt) => `${x(pt.h).toFixed(1)},${y(pt.p).toFixed(1)}`).join(" ");
  const area = `${PAD_L},${H - PAD_B} ${line} ${W - PAD_R},${H - PAD_B}`;

  // Étiquettes de remise au milieu de chaque palier (pour la bande sélectionnée).
  const segments = [
    { lo: 24, hi: 48 },
    { lo: 12, hi: 24 },
    { lo: 2, hi: 12 },
    { lo: 0, hi: 2 },
  ].map(({ lo, hi }) => {
    const mid = (lo + hi) / 2;
    const state = computePrice(base, places, mid);
    return { mid, discount: state.discountPct, price: state.currentPrice };
  });

  const now = computePrice(base, places, hours);
  const hot = now.heat > 0.6;

  // Ordonnée : un tick par prix de palier réellement atteint (dédupliqués).
  const priceTicks = [...new Set([base, ...segments.map((s) => s.price)])];

  const scrub = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * W;
    const ratio = (relX - PAD_L) / (W - PAD_L - PAD_R);
    onScrub(Math.min(MAX_HOURS, Math.max(0, (1 - ratio) * MAX_HOURS)));
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full cursor-crosshair select-none touch-none"
      role="img"
      aria-label={`Courbe du prix : de ${formatEuro(base)} à ${formatEuro(minPrice)} selon le temps restant, bande ${band}`}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); scrub(e.clientX); }}
      onPointerMove={(e) => { if (e.buttons > 0) scrub(e.clientX); }}
    >
      <defs>
        <linearGradient id="melt-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b9ddb" />
          <stop offset="55%" stopColor="#8b9ddb" />
          <stop offset="82%" stopColor="#ff6a45" />
          <stop offset="100%" stopColor="#e8431c" />
        </linearGradient>
        <linearGradient id="melt-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b9ddb" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#8b9ddb" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* ordonnée des prix — un tick par palier atteint */}
      {priceTicks.map((p) => (
        <g key={p}>
          <line x1={PAD_L} y1={y(p)} x2={W - PAD_R} y2={y(p)} stroke="rgba(255,255,255,0.07)" />
          <text x={PAD_L - 8} y={y(p) + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,0.55)">
            {formatEuro(p)}
          </text>
        </g>
      ))}

      {/* bornes de paliers — pas d'étiquette sur « 2 h », trop proche de « cours » */}
      {BOUNDARIES.map((b) => (
        <g key={b}>
          <line x1={x(b)} y1={PAD_T - 6} x2={x(b)} y2={H - PAD_B} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 5" />
          {b > 2 && (
            <text x={x(b)} y={H - PAD_B + 18} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.45)">
              {b} h
            </text>
          )}
        </g>
      ))}
      <text x={PAD_L} y={H - PAD_B + 18} textAnchor="start" fontSize="11" fill="rgba(255,255,255,0.45)">48 h</text>
      <text x={W - PAD_R} y={H - PAD_B + 18} textAnchor="end" fontSize="11" fill="rgba(243,242,238,0.85)">cours</text>

      {/* aire + escalier */}
      <polygon points={area} fill="url(#melt-fill)" />
      <polyline points={line} fill="none" stroke="url(#melt-stroke)" strokeWidth="2.5" strokeLinejoin="round" />

      {/* étiquettes de remise par palier */}
      {segments.map((s) => (
        <text
          key={s.mid}
          x={Math.min(x(s.mid), W - PAD_R - 22)}
          y={y(s.price) - 12}
          textAnchor="middle"
          fontSize="12"
          fontWeight={s.discount > 0 ? 600 : 400}
          fill={s.discount > 0 ? "#ff8a3d" : "rgba(255,255,255,0.4)"}
        >
          {s.discount > 0 ? `−${s.discount}%` : "plein tarif"}
        </text>
      ))}

      {/* l'axe couvre départ et plancher — pas d'étiquettes redondantes */}

      {/* le point « maintenant », porté par le slider */}
      {hot && <circle cx={x(hours)} cy={y(now.currentPrice)} r="12" fill="#ff6a45" opacity="0.25" />}
      <circle
        cx={x(hours)}
        cy={y(now.currentPrice)}
        r="6"
        fill={hot ? "#ff6a45" : "#8b9ddb"}
        stroke="#16182b"
        strokeWidth="2"
      />
    </svg>
  );
}
