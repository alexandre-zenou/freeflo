"use client";

import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  recovery,
  meltStats,
  acquisition,
  heatRows,
  revenueDays,
} from "@/components/vendor/vendor-data";

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
        <h3 className="serif-display text-xl text-ink">{title}</h3>
        {aside}
      </div>
      {children}
    </div>
  );
}

export function StatsTab() {
  const savedPct = Math.round(
    (recovery.placesSaved / (recovery.placesSaved + recovery.placesLost)) * 100,
  );
  const returnedPct = Math.round((acquisition.returned / acquisition.newClients) * 100);

  return (
    <div className="space-y-4">
      {/* A — récupération : l'argent retrouvé */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Valeur récupérée ce mois" aside={<span className="text-sm text-pro-accent">{recovery.recoveredDelta}</span>}>
          <p className="mt-3 font-display text-4xl font-light text-ink">{formatEuro(recovery.recoveredNet)}</p>
          <p className="mt-1 text-sm text-ink-soft">
            nets, encaissés sur des places qui partaient à la poubelle. Une place vide vaut 0 €.
          </p>
          <div className="mt-5 border-t border-line pt-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-ink">
                <strong>{recovery.placesSaved}</strong> places sauvées
              </span>
              <span className="text-ink-soft">{recovery.placesLost} perdues</span>
            </div>
            <div className="mt-2 flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
              <div className="h-full rounded-l-full bg-brand" style={{ width: `${savedPct}%` }} />
              <div className="h-full flex-1 rounded-r-full bg-ink/10" />
            </div>
          </div>
        </Panel>

        <Panel title="Taux de remplissage">
          <div className="mt-4 space-y-4">
            {[
              { label: "Avant FREEFLO", pct: recovery.fillBefore, cls: "bg-ink/25" },
              { label: "Avec FREEFLO", pct: recovery.fillWith, cls: "bg-brand" },
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
              +{recovery.fillWith - recovery.fillBefore} points de remplissage sur les créneaux
              listés, sans toucher à vos abonnements.
            </p>
          </div>
        </Panel>
      </div>

      {/* B — dégressivité : « est-ce que je brade ? » non. */}
      <Panel title="À quel prix vos places partent-elles ?">
        <div className="mt-4 grid gap-6 sm:grid-cols-[auto_1fr]">
          <div className="flex gap-8 sm:flex-col sm:gap-5">
            <div>
              <p className="serif-display text-3xl text-ink">−{meltStats.avgDiscount}%</p>
              <p className="mt-0.5 text-xs text-ink-soft">remise moyenne à la vente</p>
            </div>
            <div>
              <p className="serif-display text-3xl text-ink">{meltStats.avgLeadTime}</p>
              <p className="mt-0.5 text-xs text-ink-soft">avant le cours, en moyenne</p>
            </div>
          </div>
          <ul className="space-y-3 self-center">
            {meltStats.byTier.map((t) => (
              <li key={t.tier}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-ink-soft">{t.tier}</span>
                  <span className="tabular-nums font-medium text-ink">{t.pct}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                  <div
                    className={cn("h-full rounded-full", t.hot ? "bg-brand" : "bg-brand")}
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-soft">
          78% de vos ventes partent au-dessus de −45%. Le sprint final ne brade pas votre
          planning : il rattrape les dernières places.
        </p>
      </Panel>

      {/* C — acquisition : FREEFLO amène des clients, pas juste des remises */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Nouveaux clients via FREEFLO">
          <p className="mt-3 font-display text-4xl font-light text-ink">{acquisition.newClients}</p>
          <p className="mt-1 text-sm text-ink-soft">ce mois, jamais venus chez vous auparavant.</p>
          <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-ink">
            <strong className="text-pro-accent">{returnedPct}% sont revenus</strong> une deuxième
            fois — dont {acquisition.returnedFullPrice} au plein tarif.
          </p>
        </Panel>

        <Panel title="D'où viennent-ils ?">
          <ul className="mt-4 space-y-3">
            {acquisition.origins.map((o) => (
              <li key={o.area} className="flex items-center gap-3 text-sm">
                <span className="w-14 shrink-0 text-ink-soft">{o.area}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${o.pct}%` }} />
                </div>
                <span className="w-9 shrink-0 text-right tabular-nums text-ink">{o.pct}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* D — heures chaudes : quand lister */}
      <Panel
        title="Vos heures chaudes"
        aside={<span className="text-xs text-ink-soft">intensité des ventes</span>}
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
                  <td className="pr-2 text-xs text-ink-soft">{row.slot}</td>
                  {row.cells.map((c, i) => (
                    <td key={i} title={`intensité ${c}/4`} className={cn("h-8 rounded-md", HEAT[c])} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-soft">
          Le soir en semaine part le plus vite — listez ces créneaux tôt pour vendre avant le
          sprint final. Le dimanche soir dort : tarif plein inutile.
        </p>
      </Panel>
    </div>
  );
}
