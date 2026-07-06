"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Map as MapIcon, List, SlidersHorizontal } from "lucide-react";
import { OfferCard } from "@/components/offer-card";
import { LeafletMap, type MapPoint } from "@/components/offers/leaflet-map";
import { categories, type Offer } from "@/lib/site";
import { computePrice } from "@/lib/pricing";
import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/utils";

type Sort = "urgence" | "proximite" | "prix";
const sorts: { key: Sort; label: string }[] = [
  { key: "urgence", label: "Dernière chance" },
  { key: "proximite", label: "Plus proches" },
  { key: "prix", label: "Prix le plus bas" },
];

export function OffersExplorer({ offers }: { offers: Offer[] }) {
  const router = useRouter();
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("urgence");
  const [view, setView] = useState<"list" | "map">("map");
  const [hover, setHover] = useState<string | null>(null);

  const list = useMemo(() => {
    const filtered = cat ? offers.filter((o) => o.category === cat) : offers;
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "urgence") return a.startsInHours - b.startsInHours;
      if (sort === "proximite") return a.distanceKm - b.distanceKm;
      return a.basePrice - b.basePrice;
    });
    return sorted;
  }, [offers, cat, sort]);

  const points: MapPoint[] = useMemo(
    () =>
      list.map((o) => {
        const p = computePrice(o.basePrice, o.placesLeft, o.startsInHours);
        return { id: o.id, lat: o.lat, lng: o.lng, label: formatEuro(p.currentPrice), hot: p.heat > 0.6 };
      }),
    [list],
  );

  // one label per arrondissement present, placed just above that district's pins
  const districts = useMemo(() => {
    const groups = new Map<string, { lat: number; lng: number; n: number }>();
    list.forEach((o) => {
      const g = groups.get(o.arrondissement) ?? { lat: 0, lng: 0, n: 0 };
      groups.set(o.arrondissement, { lat: g.lat + o.lat, lng: g.lng + o.lng, n: g.n + 1 });
    });
    return [...groups.entries()].map(([arr, g]) => ({
      label: arr,
      lat: g.lat / g.n + 0.007,
      lng: g.lng / g.n,
    }));
  }, [list]);

  return (
    <div>
      {/* filters */}
      <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-bone/90 px-4 py-3 backdrop-blur md:top-[4.5rem]">
        <div className="ff-container flex flex-col gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            <button
              onClick={() => setCat(null)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors",
                cat === null ? "bg-ink text-bone" : "bg-secondary text-ink-soft hover:text-ink",
              )}
            >
              Tous
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setCat(c.slug)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  cat === c.slug ? "bg-ink text-bone" : "bg-secondary text-ink-soft hover:text-ink",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Trier :</span>
              {sorts.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm transition-colors",
                    sort === s.key ? "bg-peri-tint text-peri-deep" : "hover:text-ink",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex shrink-0 items-center rounded-full bg-secondary p-1">
              <button
                onClick={() => setView("list")}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm", view === "list" ? "bg-bone text-ink shadow-soft" : "text-ink-soft")}
              >
                <List className="h-4 w-4" /> Liste
              </button>
              <button
                onClick={() => setView("map")}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm", view === "map" ? "bg-bone text-ink shadow-soft" : "text-ink-soft")}
              >
                <MapIcon className="h-4 w-4" /> Carte
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="ff-container pt-8 pb-24 md:pb-32">
        <p className="mb-6 text-sm text-ink-soft">
          <span className="font-medium text-ink">{list.length} cours</span> disponibles près de vous
        </p>

        {view === "list" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="order-2 grid gap-4 sm:grid-cols-2 lg:order-1 lg:grid-cols-2">
              {list.map((o) => (
                <div
                  key={o.id}
                  onMouseEnter={() => setHover(o.id)}
                  onMouseLeave={() => setHover(null)}
                  className={cn("rounded-2xl transition-all", hover === o.id && "ring-2 ring-ink ring-offset-2 ring-offset-bone")}
                >
                  <OfferCard offer={o} />
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2 lg:sticky lg:top-40 lg:self-start">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-line lg:aspect-auto lg:h-[70vh] lg:min-h-[560px]">
                <LeafletMap
                  points={points}
                  districts={districts}
                  activeId={hover}
                  onHover={setHover}
                  onSelect={(id) => router.push(`/offres/${id}`)}
                  showUser
                  fitBounds
                />
                <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-full bg-white/85 px-3 py-1 text-xs text-ink-soft backdrop-blur">
                  {list.length} cours dans un rayon de 3 km
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
