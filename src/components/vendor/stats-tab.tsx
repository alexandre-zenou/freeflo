"use client";

import { cn } from "@/lib/utils";
import { recovery, acquisition, heatRows, revenueDays } from "@/components/vendor/vendor-data";
import { useT } from "@/lib/i18n";

/**
 * Statistiques du centre.
 *
 * Retour client 08/2026 — retirés d'ici : « Valeur récupérée ce mois » (montant net,
 * places sauvées/perdues) et « À quel prix vos places partent-elles ? » (remise
 * moyenne et répartition par palier), jugés privés et désincitatifs. Reste ce qui
 * valorise le centre : remplissage, nouveaux clients, provenance, heures chaudes.
 */

/** Échelle de chaleur des ventes : crème → rouge → or. */
const HEAT = [
  "bg-ink/5",
  "bg-pro-surface",
  "bg-gold/55",
  "bg-brand",
  "bg-brand",
] as const;

function Panel({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="pro-display text-xl text-ink">{title}</h3>
        {aside}
      </div>
      {children}
    </div>
  );
}

export function StatsTab() {
  const t = useT();
  const returnedPct = Math.round((acquisition.returned / acquisition.newClients) * 100);

  return (
    <div className="space-y-4">
      {/* A — remplissage : ce que FREEFLO change au planning */}
      <Panel title={t("Taux de remplissage", "Occupancy rate")}>
        <div className="mt-4 space-y-4">
          {[
            { label: t("Avant FREEFLO", "Before FREEFLO"), pct: recovery.fillBefore, cls: "bg-ink/25" },
            { label: t("Avec FREEFLO", "With FREEFLO"), pct: recovery.fillWith, cls: "bg-brand" },
          ].map((r) => (
            <div key={r.label}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-ink-soft">{r.label}</span>
                <span className="tabular-nums font-medium text-ink">{r.pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                <div className={cn("h-full rounded-full", r.cls)} style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
          <p className="border-t border-line pt-3 text-xs leading-relaxed text-ink-soft">
            +{recovery.fillWith - recovery.fillBefore}{" "}
            {t(
              "points de remplissage sur les créneaux listés, sans toucher à vos abonnements.",
              "occupancy points on the slots you list, without touching your memberships.",
            )}
          </p>
        </div>
      </Panel>

      {/* B — acquisition : FREEFLO amène des clients */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title={t("Nouveaux clients via FREEFLO", "New customers via FREEFLO")}>
          <p className="mt-3 font-display text-4xl font-light text-ink">{acquisition.newClients}</p>
          <p className="mt-1 text-sm text-ink-soft">{t("ce mois, jamais venus chez vous auparavant.", "this month, never been to you before.")}</p>
          <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-ink">
            <strong className="text-pro-accent">{returnedPct}% {t("sont revenus", "came back")}</strong>{" "}
            {t("une deuxième fois, dont", "a second time, including")} {acquisition.returnedFullPrice}{" "}
            {t("au plein tarif.", "at full price.")}
          </p>
        </Panel>

        <Panel title={t("D'où viennent-ils ?", "Where do they come from?")}>
          <ul className="mt-4 space-y-3">
            {acquisition.origins.map((o) => (
              <li key={o.area} className="flex items-center gap-3 text-sm">
                <span className="w-14 shrink-0 text-ink-soft">{t(o.area, o.areaEn)}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${o.pct}%` }} />
                </div>
                <span className="w-9 shrink-0 text-right tabular-nums text-ink">{o.pct}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* C — heures chaudes : quand lister */}
      <Panel
        title={t("Vos heures chaudes", "Your busy hours")}
        aside={<span className="text-xs text-ink-soft">{t("intensité des ventes", "sales intensity")}</span>}
      >
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[430px] border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-36 text-left text-xs font-normal text-ink-soft" />
                {revenueDays.map((d, i) => (
                  <th key={`${d}-${i}`} className="pb-1 text-center text-xs font-normal text-ink-soft">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatRows.map((row) => (
                <tr key={row.slot}>
                  <td className="pr-2 text-xs text-ink-soft">{t(row.slot, row.slotEn)}</td>
                  {row.cells.map((c, i) => (
                    <td key={i} title={`${t("intensité", "intensity")} ${c}/4`} className={cn("h-8 rounded-md", HEAT[c])} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
