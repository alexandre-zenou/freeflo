"use client";

import { Ticket, Star } from "lucide-react";
import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ActivityFeed } from "@/components/vendor/activity-feed";
import { payouts, type VendorOffer } from "@/components/vendor/vendor-data";
import { useT } from "@/lib/i18n";

/**
 * Tableau de bord du centre.
 *
 * Retour client 08/2026 — ont été retirés d'ici : l'alerte « sprint final » (elle
 * affichait un taux de remise), les KPI de chiffre d'affaires et le graphique des
 * revenus, la carte « Prochain virement » (ventes du jour / commission / net) et le
 * panneau « Commission dégressive ». Aucun pourcentage de remise ni de commission,
 * aucun chiffre d'affaires ne doit apparaître dans l'espace pro.
 */
const kpis = [
  { icon: Ticket, label: "Paniers vendus (mois)", labelEn: "Baskets sold (month)", value: "148" },
  { icon: Star, label: "Note moyenne", labelEn: "Average rating", value: "4,9", delta: "512 avis", deltaEn: "512 reviews" },
];

export function OverviewTab({ offers }: { offers: VendorOffer[] }) {
  const t = useT();
  return (
    <div className="space-y-6">
      {/* KPIs — hairline editorial, pas de pastilles */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {kpis.map((k) => (
          <div key={k.label} className="border-t border-ink/20 pt-4">
            <p className="pro-display text-3xl text-ink">{k.value}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
              <k.icon className="h-3.5 w-3.5 text-pro-accent" />
              {t(k.label, k.labelEn)}
              {k.delta && <span className="ml-auto text-pro-accent">{t(k.delta, k.deltaEn)}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          {/* créneaux du jour — l'état de remplissage en un regard */}
          <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
            <h3 className="font-medium text-ink">{t("Créneaux du jour", "Today's slots")}</h3>
            <ul className="mt-5 space-y-4">
              {offers.map((o) => {
                const sold = o.capacity - o.placesLeft;
                const pct = Math.round((sold / o.capacity) * 100);
                return (
                  <li key={o.id}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className={cn("truncate font-medium", pct === 100 ? "text-ink-soft" : "text-ink")}>
                        {o.title}
                      </span>
                      <span className="shrink-0 tabular-nums text-xs text-ink-soft">
                        {sold}/{o.capacity} {t("vendues", "sold")}{o.paused ? t(" (en pause)", " (paused)") : ""}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                      <div
                        className={cn("h-full rounded-full", pct === 100 ? "bg-gold" : "bg-brand")}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* fil d'activité — le studio vit, même quand on ne regarde pas */}
          <ActivityFeed />
        </div>

        {/* virements : la promesse « payé chaque mois », preuve à l'appui */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
          <h3 className="font-medium text-ink">{t("Derniers virements", "Latest payouts")}</h3>
          <ul className="mt-4 divide-y divide-line text-sm">
            {payouts.map((p) => (
              <li key={p.date} className="flex items-baseline justify-between py-2 first:pt-0 last:pb-0">
                <span className="text-ink-soft">{t(p.date, p.dateEn)}</span>
                <span className="tabular-nums font-medium text-ink">
                  {formatEuro(p.amount)}
                  <span
                    className={cn(
                      "ml-2 rounded-full px-2 py-0.5 text-xs font-normal",
                      p.state === "reçu" ? "bg-secondary text-ink-soft" : "bg-brand/12 text-brand-deep",
                    )}
                  >
                    {t(p.state, p.state === "reçu" ? "received" : "on the way")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
