"use client";

import { Ticket, TrendingUp, Wallet, Star, ArrowRight } from "lucide-react";
import { computePrice } from "@/lib/pricing";
import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ActivityFeed } from "@/components/vendor/activity-feed";
import {
  payouts,
  revenueChart,
  revenueDays,
  type VendorOffer,
} from "@/components/vendor/vendor-data";

const kpis = [
  { icon: Ticket, label: "Paniers vendus (mois)", value: "148", delta: "+22%" },
  { icon: TrendingUp, label: "CA généré (mois)", value: "3 240 €", delta: "+18%" },
  { icon: Wallet, label: "Valeur récupérée (mois)", value: "2 430 €", delta: "+31%" },
  { icon: Star, label: "Note moyenne", value: "4,9", delta: "512 avis" },
];

/** Paliers de commission, calculés par le vrai moteur (jamais codés en dur). */
const commissionLadder = [60, 30, 8, 1].map((h) => {
  const p = computePrice(24, 10, h);
  return { tier: p.tierLabel, discount: p.discountPct, commission: p.commissionPct };
});

export function OverviewTab({
  offers,
  onGoToOffers,
}: {
  offers: VendorOffer[];
  onGoToOffers: () => void;
}) {
  const sprint = offers.find((o) => !o.paused && o.placesLeft > 0 && o.startsInHours <= 2);
  const sprintPrice = sprint
    ? computePrice(sprint.basePrice, sprint.placesLeft, sprint.startsInHours)
    : null;

  return (
    <div className="space-y-6">
      {/* alerte sprint final — la minute où lister rapporte le plus */}
      {sprint && sprintPrice && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-ember/10 px-5 py-4 ring-1 ring-ember/25">
          <span className="flex h-2 w-2">
            <span className="h-2 w-2 rounded-full bg-ember pulse-dot" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-ink">
            <strong>Sprint final</strong> · {sprint.title} : {sprint.placesLeft} places restantes à{" "}
            <strong className="tabular-nums text-ember-deep">−{sprintPrice.discountPct}%</strong>.
            Chaque place vendue vaut mieux que zéro.
          </p>
          <button
            onClick={onGoToOffers}
            className="flex items-center gap-1 text-sm font-medium text-ember-deep transition-colors hover:text-ink"
          >
            Gérer l&apos;offre <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* KPIs — hairline editorial, pas de pastilles */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="border-t border-ink/20 pt-4">
            <p className="font-display text-3xl font-light text-ink">{k.value}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
              <k.icon className="h-3.5 w-3.5 text-peri-deep" />
              {k.label} <span className="ml-auto text-peri-deep">{k.delta}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl bg-paper p-6 ring-1 ring-line">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-ink">Revenus des 7 derniers jours</h3>
            <span className="text-sm text-peri-deep">+18%</span>
          </div>
          <div className="mt-6 flex h-40 items-end gap-3">
            {revenueChart.map((v, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full max-w-9 rounded-t-lg bg-gradient-to-t from-peri-deep to-peri"
                  style={{ height: `${v}%` }}
                />
                <span className="text-xs text-ink-soft">{revenueDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-ink p-6 text-bone">
          <h3 className="font-medium">Prochain virement</h3>
          <p className="mt-4 font-display text-4xl font-medium">{formatEuro(126)}</p>
          <p className="mt-1 text-sm text-white/60">Demain · virement quotidien automatique</p>
          <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
            <p className="flex justify-between"><span className="text-white/60">Ventes du jour</span><span>168 €</span></p>
            <p className="flex justify-between"><span className="text-white/60">Commission FREEFLO</span><span>− 42 €</span></p>
            <p className="flex justify-between font-medium"><span>Net à recevoir</span><span className="text-ember">126 €</span></p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
        {/* créneaux du jour — l'état de remplissage en un regard */}
        <div className="rounded-2xl bg-paper p-6 ring-1 ring-line">
          <h3 className="font-medium text-ink">Créneaux du jour</h3>
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
                      {sold}/{o.capacity} vendues{o.paused ? " · en pause" : ""}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                    <div
                      className={cn("h-full rounded-full", pct === 100 ? "bg-peri" : "bg-peri-deep")}
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

        <div className="flex flex-col gap-4">
          {/* commission dégressive — l'économie du deal, chiffrée par le moteur */}
          <div className="rounded-2xl bg-paper p-6 ring-1 ring-line">
            <h3 className="font-medium text-ink">Commission dégressive</h3>
            <ul className="mt-4 space-y-1.5 text-xs text-ink-soft">
              {commissionLadder.map((l) => (
                <li key={l.tier} className="flex items-baseline justify-between gap-3">
                  <span>{l.tier}</span>
                  <span className="tabular-nums">
                    {l.discount > 0 ? <strong className="text-ember-deep">−{l.discount}%</strong> : "plein tarif"}
                    <span className="ml-2">→ {l.commission}%</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-soft">
              Plus vous bradez tard, moins on prélève. Lister jusqu&apos;au dernier moment reste
              toujours votre intérêt.
            </p>
          </div>

          {/* virements — la promesse « payé chaque jour », preuve à l'appui */}
          <div className="rounded-2xl bg-paper p-6 ring-1 ring-line">
            <h3 className="font-medium text-ink">Derniers virements</h3>
            <ul className="mt-4 divide-y divide-line text-sm">
              {payouts.map((p) => (
                <li key={p.date} className="flex items-baseline justify-between py-2 first:pt-0 last:pb-0">
                  <span className="text-ink-soft">{p.date}</span>
                  <span className="tabular-nums font-medium text-ink">
                    {formatEuro(p.amount)}
                    <span
                      className={cn(
                        "ml-2 rounded-full px-2 py-0.5 text-xs font-normal",
                        p.state === "reçu" ? "bg-secondary text-ink-soft" : "bg-ember/12 text-ember-deep",
                      )}
                    >
                      {p.state}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
