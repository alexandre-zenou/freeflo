"use client";

import { Copy, Pencil, Pause, Play, Plus } from "lucide-react";
import { useLivePrice } from "@/components/use-live-price";
import { UrgencyMeter } from "@/components/urgency-meter";
import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VendorOffer } from "@/components/vendor/vendor-data";

/** Cellule prix vivante — le même moteur que côté sportif, vu du centre. */
function LivePriceCell({ offer }: { offer: VendorOffer }) {
  const live = useLivePrice(offer.basePrice, offer.placesLeft, offer.startsInHours);
  return (
    <div className="min-w-0">
      {live.discountPct > 0 ? (
        <span className="tabular-nums text-sm font-medium text-ember-deep">
          {formatEuro(live.currentPrice)}{" "}
          <span className="font-normal text-ink-soft line-through">{formatEuro(offer.basePrice)}</span>
        </span>
      ) : (
        <span className="tabular-nums text-sm text-ink">{formatEuro(live.currentPrice)} · plein tarif</span>
      )}
      <UrgencyMeter heat={live.heat} remainingHours={live.remainingHours} className="mt-1.5" />
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-ink-soft transition-colors hover:text-ink"
    >
      {children}
    </button>
  );
}

export function OffersTab({
  offers,
  onTogglePause,
  onDuplicate,
  onCreate,
}: {
  offers: VendorOffer[];
  onTogglePause: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
      <div className="hidden grid-cols-[2fr_0.8fr_1.4fr_0.9fr] gap-4 border-b border-line px-5 py-3 text-xs font-medium uppercase tracking-wide text-ink-soft sm:grid">
        <span>Offre du jour</span><span>Places</span><span>Prix live</span><span className="text-right">Actions</span>
      </div>

      {offers.map((o) => {
        const sold = o.capacity - o.placesLeft;
        const soldOut = o.placesLeft === 0;
        return (
          <div
            key={o.id}
            className="grid grid-cols-2 items-center gap-4 border-b border-line px-5 py-4 last:border-0 sm:grid-cols-[2fr_0.8fr_1.4fr_0.9fr]"
          >
            <span className={cn("font-medium", soldOut ? "text-ink-soft" : "text-ink")}>
              {o.title}
              <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-ink-soft">{o.cat}</span>
            </span>

            <span className="text-sm tabular-nums text-ink-soft">
              {sold} / {o.capacity} vendues
            </span>

            {soldOut ? (
              <span className="w-fit rounded-full bg-ink/10 px-2.5 py-1 text-xs text-ink-soft">Épuisé — bien joué</span>
            ) : o.paused ? (
              <span className="text-sm text-ink-soft">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-ink">En pause</span>
                <span className="ml-2 tabular-nums">{formatEuro(o.basePrice)} figé</span>
              </span>
            ) : (
              <LivePriceCell offer={o} />
            )}

            <div className="col-span-2 flex justify-end gap-2 sm:col-span-1">
              {!soldOut && (
                <ActionButton
                  label={o.paused ? "Relancer la dégressivité" : "Mettre en pause"}
                  onClick={() => onTogglePause(o.id)}
                >
                  {o.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </ActionButton>
              )}
              <ActionButton label="Dupliquer" onClick={() => onDuplicate(o.id)}>
                <Copy className="h-4 w-4" />
              </ActionButton>
              <ActionButton label="Modifier">
                <Pencil className="h-4 w-4" />
              </ActionButton>
            </div>
          </div>
        );
      })}

      <div className="p-5">
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-full border border-dashed border-line px-4 py-2.5 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          <Plus className="h-4 w-4" /> Créer une offre
        </button>
      </div>
    </div>
  );
}
