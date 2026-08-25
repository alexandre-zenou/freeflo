"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatEuro } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Filtre de budget en pastille, sur le modèle des filtres par nuit des sites
 * de réservation : un histogramme de la distribution des prix, et deux curseurs
 * posés dessus pour resserrer la plage.
 *
 * L'histogramme n'est pas décoratif. Sans lui, un visiteur qui tire un curseur
 * ne sait pas s'il vient d'écarter deux offres ou quinze : les barres lui
 * montrent où se trouve le gros de l'offre avant qu'il ne choisisse.
 *
 * L'habillage reprend `PillSelect` à la lettre (pastille ovale, panneau blanc
 * en `shadow-lift`, fermeture au clic extérieur et à Échap) pour que les deux
 * filtres se lisent comme une même famille.
 */
export function BudgetFilter({
  min,
  max,
  value,
  bins,
  active,
  onChange,
  onReset,
  className,
}: {
  min: number;
  max: number;
  /** Plage choisie, toujours comprise entre `min` et `max`. */
  value: [number, number];
  /** Nombre d'offres par tranche de prix, de la moins chère à la plus chère. */
  bins: number[];
  /** La plage a été resserrée : la pastille se remplit, comme un filtre actif. */
  active: boolean;
  onChange: (v: [number, number]) => void;
  onReset: () => void;
  className?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const [bas, haut] = value;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const etendue = Math.max(1, max - min);
  const pct = (v: number) => ((v - min) / etendue) * 100;
  const plusHaute = Math.max(1, ...bins);

  return (
    <div ref={root} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-brand text-white hover:bg-brand-deep"
            : "border border-brand/35 text-brand hover:bg-brand hover:text-white",
        )}
      >
        {active ? `${formatEuro(bas)} ${t("à", "to")} ${formatEuro(haut)}` : t("Budget", "Budget")}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t("Votre budget", "Your budget")}
          className="absolute left-0 top-full z-40 mt-2 w-[19rem] rounded-2xl bg-paper p-4 shadow-lift ring-1 ring-line"
        >
          <p className="text-sm font-bold text-ink">{t("Votre budget", "Your budget")}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {t("De", "From")} <span className="font-bold text-brand">{formatEuro(bas)}</span>{" "}
            {t("à", "to")} <span className="font-bold text-brand">{formatEuro(haut)}</span>
          </p>

          <div className="relative mt-5 h-24 select-none">
            {/* histogramme : les barres hors plage s'effacent, elles disent ce
                que le curseur vient d'écarter */}
            <div className="absolute inset-x-0 bottom-6 flex h-16 items-end gap-[2px]">
              {bins.map((n, i) => {
                const debut = min + (i / bins.length) * etendue;
                const fin = min + ((i + 1) / bins.length) * etendue;
                const dedans = fin > bas && debut < haut;
                return (
                  <span
                    key={i}
                    className={cn(
                      "flex-1 rounded-t-sm transition-colors",
                      dedans ? "bg-brand/45" : "bg-line",
                    )}
                    style={{ height: `${Math.max(6, (n / plusHaute) * 100)}%` }}
                  />
                );
              })}
            </div>

            {/* rail, portion retenue, puis les deux curseurs par-dessus */}
            <div className="absolute inset-x-0 bottom-5 h-1 rounded-full bg-line" />
            <div
              className="absolute bottom-5 h-1 rounded-full bg-brand"
              style={{ left: `${pct(bas)}%`, right: `${100 - pct(haut)}%` }}
            />

            <input
              type="range"
              aria-label={t("Prix minimum", "Minimum price")}
              min={min}
              max={max}
              value={bas}
              onChange={(e) => onChange([Math.min(Number(e.target.value), haut), haut])}
              className="range-dual absolute inset-x-0 bottom-2.5"
            />
            <input
              type="range"
              aria-label={t("Prix maximum", "Maximum price")}
              min={min}
              max={max}
              value={haut}
              onChange={(e) => onChange([bas, Math.max(Number(e.target.value), bas)])}
              className="range-dual absolute inset-x-0 bottom-2.5"
            />

            <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs text-ink-soft">
              <span>{formatEuro(min)}</span>
              <span>{formatEuro(max)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            disabled={!active}
            className="mt-3 text-sm text-brand underline underline-offset-4 transition-colors hover:text-brand-deep disabled:opacity-45 disabled:no-underline"
          >
            {t("Réinitialiser", "Reset")}
          </button>
        </div>
      )}
    </div>
  );
}
