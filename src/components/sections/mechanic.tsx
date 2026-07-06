"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { UrgencyMeter } from "@/components/urgency-meter";
import { computePrice, TIERS, type StockBand } from "@/lib/pricing";
import { formatEuro, formatCountdown } from "@/lib/format";
import { cn } from "@/lib/utils";

const BASE = 35;
const bands: { key: StockBand; label: string; col: string }[] = [
  { key: "many", label: "+ de 5 places", col: "> 5 places libres" },
  { key: "few", label: "3 à 5 places", col: "3 à 5 places libres" },
  { key: "last", label: "1 à 2 places", col: "1 à 2 places libres" },
];

function placesFor(band: StockBand) {
  return band === "many" ? 8 : band === "few" ? 4 : 2;
}

export function Mechanic() {
  const [hours, setHours] = useState(48);
  const [band, setBand] = useState<StockBand>("last");
  const [playing, setPlaying] = useState(true);
  const dir = useRef(-1);

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setHours((h) => {
        let next = h + dir.current * 0.7;
        if (next <= 0) { next = 0; dir.current = 1; }
        if (next >= 48) { next = 48; dir.current = -1; }
        return next;
      });
    }, 90);
    return () => window.clearInterval(id);
  }, [playing]);

  const price = computePrice(BASE, placesFor(band), hours);
  const activeTierLabel = price.tierLabel;

  return (
    <section className="bg-ink py-24 text-bone md:py-32">
      <div className="ff-container">
        <SectionHeading
          onDark
          eyebrow="Le moteur de dégressivité"
          title={<>Le prix fond<br />quand le temps brûle.</>}
          intro="Une place vide ne rapporte rien. Alors plus l'heure du cours approche, plus la remise s'approfondit — automatiquement, en temps réel. Faites glisser le temps."
        />

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* live meter */}
          <div className="rounded-3xl bg-white/[0.04] p-8 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-peri">Cours de Pilates · plein tarif {formatEuro(BASE)}</span>
              <button
                onClick={() => setPlaying((p) => !p)}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 hover:bg-white/10"
              >
                {playing ? "Pause" : "Lecture"}
              </button>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span
                className={cn(
                  "font-display text-7xl font-medium tabular-nums transition-colors duration-300",
                  price.discountPct > 0 ? "text-ember" : "text-bone",
                )}
              >
                {formatEuro(price.currentPrice)}
              </span>
              {price.discountPct > 0 && (
                <span className="text-2xl text-white/40 line-through tabular-nums">{formatEuro(BASE)}</span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className={cn("rounded-full px-2.5 py-0.5 font-semibold", price.discountPct > 0 ? "bg-ember text-white" : "bg-white/10 text-white/60")}>
                −{price.discountPct}%
              </span>
              <span className="text-white/60">{activeTierLabel}</span>
            </div>

            <div className="mt-7">
              <UrgencyMeter heat={price.heat} remainingHours={hours} showLabel={false} />
              <div className="mt-2 flex justify-between text-xs text-white/50">
                <span>+ 48 h</span>
                <span className="tabular-nums text-white/80">départ dans {formatCountdown(hours)}</span>
                <span>0 h</span>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={48}
              step={0.5}
              value={hours}
              onChange={(e) => { setPlaying(false); setHours(Number(e.target.value)); }}
              className="mt-4 w-full accent-ember"
              aria-label="Temps avant le créneau"
            />

            <div className="mt-6 flex gap-2">
              {bands.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setBand(b.key)}
                  className={cn(
                    "flex-1 rounded-full border px-3 py-2 text-xs transition-colors",
                    band === b.key ? "border-ember bg-ember/15 text-ember" : "border-white/15 text-white/60 hover:border-white/40",
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-white/45">
              Côté centre, la commission suit l&apos;inverse : forte remise = commission plus faible
              ({price.commissionPct}% ici). L&apos;intérêt est toujours de lister jusqu&apos;au dernier moment.
            </p>
          </div>

          {/* the grid, straight from the cahier */}
          <div className="overflow-x-auto rounded-3xl bg-white/[0.03] p-2 ring-1 ring-white/10">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-white/55">
                  <th className="p-3 font-medium">Temps avant l&apos;échéance</th>
                  {bands.map((b) => (
                    <th key={b.key} className="p-3 text-center font-medium">{b.col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...TIERS].reverse().map((tier) => {
                  const rowActive = tier.label === activeTierLabel;
                  return (
                    <tr key={tier.label} className={cn("border-t border-white/8", rowActive && "bg-white/[0.06]")}>
                      <td className={cn("p-3", rowActive ? "text-bone" : "text-white/60")}>{tier.label}</td>
                      {bands.map((b, i) => {
                        const d = tier.discount[i];
                        const cellActive = rowActive && b.key === band;
                        return (
                          <td key={b.key} className="p-2 text-center">
                            <span
                              className={cn(
                                "inline-block min-w-14 rounded-full px-2 py-1 tabular-nums transition-colors",
                                cellActive
                                  ? "bg-ember font-semibold text-white"
                                  : d > 0
                                  ? "text-ember/80"
                                  : "text-white/35",
                              )}
                            >
                              {d === 0 ? "plein tarif" : `−${d}%`}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
