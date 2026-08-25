"use client";

import { Sparkles } from "lucide-react";
import { formatEuro, isoDayLabel } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface CalendarDay {
  /** Jour au format `AAAA-MM-JJ`. */
  iso: string;
  /** Prix le plus bas ce jour-là, ou `null` si aucun cours. */
  from: number | null;
  /** Le meilleur prix de toute la période : un seul jour le porte. */
  best: boolean;
}

/**
 * Bande de jours à venir, avec le prix d'appel de chacun.
 *
 * Bande horizontale et non grille mensuelle : ce qu'on compare ici, ce sont des
 * PRIX, et une ligne les met côte à côte pour que l'œil trouve le moins cher
 * d'un balayage. Une grille de mois disperserait la comparaison sur six lignes.
 *
 * Le composant ne calcule rien : jours, prix et meilleur tarif lui arrivent
 * calculés. Les dates exigent `Date.now()`, absent du rendu serveur, et c'est à
 * l'écran appelant de décider quand il est légitime de les produire.
 */
export function PriceCalendar({
  days,
  selected,
  onSelect,
}: {
  days: CalendarDay[];
  selected: string | null;
  onSelect: (iso: string) => void;
}) {
  const t = useT();
  const { locale } = useLocale();

  return (
    <section aria-label={t("Prix par jour", "Price by day")}>
      <h2 className="text-sm font-bold text-ink">{t("Le prix par jour", "Price by day")}</h2>
      {/* Défilement horizontal : quatorze jours ne tiennent pas de front sur un
          téléphone, et les empiler ferait perdre la comparaison des prix. */}
      <ul className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto overscroll-x-contain pb-1">
        {days.map((d) => {
          const vide = d.from === null;
          const actif = selected === d.iso;
          return (
            <li key={d.iso} className="shrink-0">
              <button
                type="button"
                disabled={vide}
                aria-pressed={actif}
                onClick={() => onSelect(d.iso)}
                className={cn(
                  "relative flex w-[7.5rem] flex-col items-start gap-1 rounded-2xl px-3 py-2.5 text-left transition-colors",
                  "outline outline-1 -outline-offset-1",
                  actif
                    ? "bg-brand text-white outline-brand"
                    : vide
                      ? "cursor-not-allowed bg-secondary/60 text-ink-soft/50 outline-transparent"
                      : "bg-paper text-ink outline-line hover:outline-brand",
                )}
              >
                <span className="text-xs font-medium">{isoDayLabel(d.iso, locale)}</span>

                {vide ? (
                  <span className="text-sm">{t("Complet", "Full")}</span>
                ) : (
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      actif ? "text-gold" : d.best ? "text-brand" : "text-ink",
                    )}
                  >
                    {t("dès", "from")} {formatEuro(d.from as number)}
                  </span>
                )}

                {/* Le meilleur prix de la période, signalé une seule fois. */}
                {d.best && !vide && (
                  <span
                    className={cn(
                      "mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      actif ? "bg-gold-bright text-ink" : "bg-brand-tint text-brand",
                    )}
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    {t("Meilleur prix", "Best price")}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
