"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { computePrice } from "@/lib/pricing";
import { categories } from "@/lib/site";
import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VendorOffer } from "@/components/vendor/vendor-data";

const SLOTS = [
  { label: "Aujourd'hui · 18h30", startsInHours: 2.5 },
  { label: "Aujourd'hui · 20h00", startsInHours: 4 },
  { label: "Demain · 7h30", startsInHours: 15 },
  { label: "Demain · 12h00", startsInHours: 20 },
  { label: "Après-demain · 18h30", startsInHours: 44 },
];

/** Points d'échantillonnage de la courbe (heures avant le cours, décroissant). */
const CURVE_HOURS = [72, 60, 48, 36, 24, 18, 12, 8, 6, 4, 2, 1, 0.25];

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-peri-deep";

export function CreateOfferDrawer({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (offer: VendorOffer) => void;
}) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState(categories[0].label);
  const [slot, setSlot] = useState(0);
  const [capacity, setCapacity] = useState(10);
  const [basePrice, setBasePrice] = useState(24);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const curve = useMemo(
    () => CURVE_HOURS.map((h) => ({ h, ...computePrice(basePrice, capacity, h) })),
    [basePrice, capacity],
  );
  const minPrice = curve[curve.length - 1].currentPrice;

  // Repères commission aux quatre paliers (la commission baisse quand la remise monte).
  const ladder = useMemo(
    () =>
      [60, 30, 8, 1].map((h) => {
        const p = computePrice(basePrice, capacity, h);
        return { tier: p.tierLabel, discount: p.discountPct, commission: p.commissionPct };
      }),
    [basePrice, capacity],
  );

  const submit = () => {
    if (!title.trim()) return setError("Donnez un titre à l'offre — c'est ce que voient les sportifs.");
    if (basePrice <= 0 || capacity < 1) return setError("Prix plein et places doivent être positifs.");
    onCreate({
      id: `v-${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: `${title.trim()} — ${SLOTS[slot].label.split("· ")[1]}`,
      cat,
      capacity,
      placesLeft: capacity,
      basePrice,
      startsInHours: SLOTS[slot].startsInHours,
    });
    setTitle("");
    setError(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto bg-bone p-6 shadow-lift sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-peri-deep">Nouvelle offre</p>
            <h2 className="display mt-1 text-2xl text-ink">Deux minutes, montre en main.</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le panneau"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-ink-soft transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-7 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink">Titre du cours</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vinyasa Flow"
              className={inputCls}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">Catégorie</span>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className={inputCls}>
                {categories.map((c) => (
                  <option key={c.slug}>{c.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">Créneau</span>
              <select value={slot} onChange={(e) => setSlot(Number(e.target.value))} className={inputCls}>
                {SLOTS.map((s, i) => (
                  <option key={s.label} value={i}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">Places à libérer</span>
              <input
                type="number"
                min={1}
                max={40}
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, Number(e.target.value)))}
                className={inputCls}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">Prix plein (€)</span>
              <input
                type="number"
                min={1}
                max={200}
                value={basePrice}
                onChange={(e) => setBasePrice(Math.max(1, Number(e.target.value)))}
                className={inputCls}
              />
            </label>
          </div>
        </div>

        {/* la courbe de fonte — l'argument de vente, en direct */}
        <div className="mt-8 border-t border-ink/20 pt-5">
          <div className="flex items-baseline justify-between">
            <h3 className="font-medium text-ink">Votre prix fondra ainsi</h3>
            <span className="text-xs text-ink-soft">
              de <strong className="text-ink">{formatEuro(basePrice)}</strong> à{" "}
              <strong className="text-ember-deep">{formatEuro(minPrice)}</strong>
            </span>
          </div>
          <svg viewBox="0 0 260 84" className="mt-3 w-full" aria-hidden>
            <defs>
              <linearGradient id="melt" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b9ddb" />
                <stop offset="55%" stopColor="#4f61a8" />
                <stop offset="100%" stopColor="#e8431c" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="url(#melt)"
              strokeWidth="2.5"
              strokeLinecap="round"
              points={curve
                .map((p, i) => {
                  const x = 4 + (i / (curve.length - 1)) * 252;
                  const y = 8 + (1 - p.currentPrice / basePrice) * 68;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>
          <div className="flex justify-between text-[0.68rem] uppercase tracking-wide text-ink-soft">
            <span>J−3</span><span>24 h</span><span>Sprint final</span>
          </div>

          <ul className="mt-4 space-y-1.5 text-xs text-ink-soft">
            {ladder.map((l) => (
              <li key={l.tier} className="flex items-baseline justify-between gap-3">
                <span>{l.tier}</span>
                <span className="tabular-nums">
                  {l.discount > 0 ? <strong className="text-ember-deep">−{l.discount}%</strong> : "plein tarif"}
                  <span className="ml-2 text-ink-soft">commission {l.commission}%</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="mt-4 text-sm text-ember-deep">{error}</p>}

        <div className="mt-6 flex items-center gap-3 border-t border-ink/20 pt-5">
          <button
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-medium text-white ember-glow transition-colors hover:bg-ember-deep"
          >
            Publier l&apos;offre
          </button>
          <button onClick={onClose} className="text-sm text-ink-soft transition-colors hover:text-ink">
            Annuler
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          Aucun coût fixe. La commission ne s&apos;applique que si la place se vend — et elle baisse
          quand la remise monte.
        </p>
      </aside>
    </div>
  );
}
