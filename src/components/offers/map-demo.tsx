"use client";

import type { Offer } from "@/lib/site";
import { useLivePrice } from "@/components/use-live-price";
import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Épingle carte : prix live, chauffe en ember quand ça urge. */
function Pin({
  offer,
  active,
  onHover,
}: {
  offer: Offer;
  active: boolean;
  onHover: (id: string | null) => void;
}) {
  const live = useLivePrice(offer.basePrice, offer.placesLeft, offer.startsInHours);
  const hot = live.heat > 0.6;
  return (
    <button
      onMouseEnter={() => onHover(offer.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(offer.id)}
      className="absolute -translate-x-1/2 -translate-y-full"
      style={{ left: `${offer.map.x}%`, top: `${offer.map.y}%`, zIndex: active ? 30 : 10 }}
      aria-label={`${offer.gym} — ${formatEuro(live.currentPrice)}`}
    >
      <span
        className={cn(
          "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-lift transition-all",
          hot ? "bg-ember text-white" : "bg-white text-ink",
          active && "scale-110 ring-2 ring-ink",
        )}
      >
        {formatEuro(live.currentPrice)}
      </span>
      <span
        className={cn(
          "mx-auto block h-2 w-2 -translate-y-[3px] rotate-45",
          hot ? "bg-ember" : "bg-white",
        )}
      />
    </button>
  );
}

export function MapDemo({
  offers,
  activeId,
  onHover,
}: {
  offers: Offer[];
  activeId: string | null;
  onHover: (id: string | null) => void;
}) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-line lg:aspect-auto lg:h-full lg:min-h-[560px]">
      {/* abstract Paris-ish canvas */}
      <div className="absolute inset-0 bg-peri-tint" />
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {/* blocks */}
        {Array.from({ length: 40 }).map((_, i) => {
          const x = (i * 37) % 100;
          const y = (i * 61) % 100;
          const w = 8 + ((i * 13) % 12);
          const h = 6 + ((i * 7) % 10);
          return (
            <rect key={i} x={x} y={y} width={w} height={h} rx={1.2} fill="#fff" opacity={0.5} />
          );
        })}
        {/* the Seine */}
        <path
          d="M-5 66 C 20 58, 34 78, 52 70 S 84 54, 108 64"
          stroke="#8b9ddb"
          strokeWidth="6"
          fill="none"
          opacity="0.7"
          strokeLinecap="round"
        />
        {/* avenues */}
        <line x1="50" y1="0" x2="50" y2="100" stroke="#fff" strokeWidth="1.4" opacity="0.7" />
        <line x1="0" y1="34" x2="100" y2="34" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
        <line x1="10" y1="0" x2="70" y2="100" stroke="#fff" strokeWidth="1" opacity="0.5" />
      </svg>

      {/* "you are here" */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="block h-4 w-4 rounded-full bg-ink ring-4 ring-ink/20" />
        <span className="mt-1 block whitespace-nowrap text-[0.65rem] font-medium text-ink">Vous êtes ici</span>
      </div>

      {offers.map((o) => (
        <Pin key={o.id} offer={o} active={activeId === o.id} onHover={onHover} />
      ))}

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs text-ink-soft backdrop-blur">
        {offers.length} cours dans un rayon de 3 km
      </div>
    </div>
  );
}
