"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Map as MapIcon, List, SlidersHorizontal, Search, MapPin, X } from "lucide-react";
import { OfferCard } from "@/components/offer-card";
import { PillSelect } from "@/components/ui/pill-select";
import { RevealOnView } from "@/components/reveal-on-view";
import { LeafletMap, type MapPoint, type Monument } from "@/components/offers/leaflet-map";
import { categories, type Offer } from "@/lib/site";
import { computePrice } from "@/lib/pricing";
import { distanceKm, PARIS_ARRONDISSEMENTS } from "@/lib/geo";
import { formatEuro } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Sort = "urgence" | "proximite" | "prix";
const sorts: { key: Sort; label: string; labelEn: string }[] = [
  { key: "urgence", label: "Dernière chance", labelEn: "Last chance" },
  { key: "proximite", label: "Plus proches", labelEn: "Closest" },
  { key: "prix", label: "Prix le plus bas", labelEn: "Lowest price" },
];

/** Repères jaunes demandés par la cliente pour situer la carte. */
const MONUMENTS: Monument[] = [
  { label: "Tour Eiffel", lat: 48.8584, lng: 2.2945 },
  { label: "Louvre", lat: 48.8606, lng: 2.3376 },
  { label: "Notre-Dame", lat: 48.8530, lng: 2.3499 },
  { label: "Sacré-Cœur", lat: 48.8867, lng: 2.3431 },
  { label: "Arc de Triomphe", lat: 48.8738, lng: 2.2950 },
];

/**
 * Disponibilité déduite du seul `startsInHours` (jamais de `Date` au rendu),
 * pour que serveur et client produisent le même balisage.
 */
function dayBucket(startsInHours: number): "today" | "tomorrow" | "later" {
  if (startsInHours <= 12) return "today";
  if (startsInHours <= 36) return "tomorrow";
  return "later";
}

type GeoState = "idle" | "asking" | "granted" | "denied";

export function OffersExplorer({ offers }: { offers: Offer[] }) {
  const router = useRouter();
  const t = useT();
  const [loc, setLoc] = useState("");
  const [cat, setCat] = useState("");
  const [avail, setAvail] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("urgence");
  const [view, setView] = useState<"list" | "map">("map");
  const [hover, setHover] = useState<string | null>(null);
  const [geo, setGeo] = useState<GeoState>("idle");
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);

  /*
    Retour client : « bien mettre la case activez la géolocalisation et ajouter tous
    les arrondissements ». La position réelle sert à recalculer les distances par
    haversine, et bascule le tri sur « Plus proches ».
  */
  const askGeo = () => {
    if (!("geolocation" in navigator)) return setGeo("denied");
    setGeo("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeo("granted");
        setSort("proximite");
      },
      () => setGeo("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
  };

  const list = useMemo(() => {
    /** Distance réelle si la position est connue, sinon celle du jeu de démo. */
    const distanceOf = (o: Offer) =>
      me ? distanceKm(me, { lat: o.lat, lng: o.lng }) : o.distanceKm;

    const q = query.trim().toLowerCase();
    const filtered = offers.filter((o) => {
      if (loc && o.arrondissement !== loc) return false;
      if (cat && o.category !== cat) return false;
      if (avail && dayBucket(o.startsInHours) !== avail) return false;
      if (q) {
        const haystack =
          `${o.title} ${o.gym} ${o.category} ${o.address} ${o.arrondissement} ${o.coach}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "urgence") return a.startsInHours - b.startsInHours;
      if (sort === "proximite") return distanceOf(a) - distanceOf(b);
      return a.basePrice - b.basePrice;
    });
  }, [offers, loc, cat, avail, query, sort, me]);

  const points: MapPoint[] = useMemo(
    () =>
      list.map((o) => {
        const p = computePrice(o.basePrice, o.placesLeft, o.startsInHours);
        return { id: o.id, lat: o.lat, lng: o.lng, label: formatEuro(p.currentPrice), hot: p.heat > 0.6 };
      }),
    [list],
  );

  // une étiquette par arrondissement présent, posée juste au-dessus de ses pastilles
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

  const hasFilters = Boolean(loc || cat || avail || query);

  return (
    <div>
      {/* filtres : pastilles ovales, comme les puces de tri en dessous */}
      <div className="sticky top-16 z-30 border-b border-line bg-cream/90 py-3 backdrop-blur md:top-[4.5rem]">
        <div className="ff-container flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <PillSelect
              label={t("Localisation", "Location")}
              value={loc}
              onChange={setLoc}
              options={PARIS_ARRONDISSEMENTS.map((a) => ({ value: a, label: a }))}
            />
            <PillSelect
              label={t("Type de cours", "Class type")}
              value={cat}
              onChange={setCat}
              options={categories.map((c) => ({ value: c.slug, label: c.label }))}
            />
            <PillSelect
              label={t("Disponibilité", "Availability")}
              value={avail}
              onChange={setAvail}
              options={[
                { value: "today", label: t("Aujourd'hui", "Today") },
                { value: "tomorrow", label: t("Demain", "Tomorrow") },
              ]}
            />

            <button
              type="button"
              onClick={askGeo}
              disabled={geo === "asking"}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                geo === "granted"
                  ? "bg-brand-deep text-white"
                  : "border border-brand/35 text-brand hover:bg-brand hover:text-white disabled:opacity-60",
              )}
            >
              <MapPin className="h-3.5 w-3.5" />
              {geo === "granted"
                ? t("Autour de vous", "Around you")
                : geo === "asking"
                  ? t("Localisation…", "Locating…")
                  : t("Activez la géolocalisation", "Turn on location")}
            </button>

            {/* recherche réelle : elle filtre, au lieu de remettre les filtres à zéro */}
            <label className="ml-auto flex min-w-[13rem] flex-1 items-center gap-2 rounded-full border border-brand/35 px-4 py-2 text-sm text-ink focus-within:border-brand sm:flex-none">
              <Search className="h-4 w-4 shrink-0 text-brand" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Rechercher ici", "Search here")}
                className="w-full bg-transparent outline-none placeholder:text-ink-soft/70"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label={t("Effacer", "Clear")}>
                  <X className="h-3.5 w-3.5 text-ink-soft hover:text-ink" />
                </button>
              )}
            </label>
          </div>

          {geo === "denied" && (
            <p className="text-xs text-brand">
              {t(
                "Localisation refusée. Choisissez un arrondissement pour filtrer.",
                "Location denied. Pick a district to filter instead.",
              )}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">{t("Trier :", "Sort:")}</span>
              {sorts.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm transition-colors",
                    sort === s.key ? "bg-brand-tint text-brand" : "hover:text-ink",
                  )}
                >
                  {t(s.label, s.labelEn)}
                </button>
              ))}
              {hasFilters && (
                <button
                  onClick={() => { setLoc(""); setCat(""); setAvail(""); setQuery(""); }}
                  className="rounded-full px-3 py-1 text-sm text-brand underline underline-offset-4 hover:text-brand-deep"
                >
                  {t("Tout effacer", "Clear all")}
                </button>
              )}
            </div>

            <div className="flex shrink-0 items-center rounded-full bg-secondary p-1">
              <button
                onClick={() => setView("list")}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm", view === "list" ? "bg-paper text-ink shadow-soft" : "text-ink-soft")}
              >
                <List className="h-4 w-4" /> {t("Liste", "List")}
              </button>
              <button
                onClick={() => setView("map")}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm", view === "map" ? "bg-paper text-ink shadow-soft" : "text-ink-soft")}
              >
                <MapIcon className="h-4 w-4" /> {t("Carte", "Map")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="ff-container pt-8 pb-24 md:pb-32">
        <p className="mb-6 text-sm text-ink-soft">
          <span className="font-medium text-ink">
            {list.length} {t("cours", "classes")}
          </span>{" "}
          {list.length > 0
            ? t("disponibles près de vous", "available near you")
            : t("élargissez vos filtres", "widen your filters")}
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
                  className={cn("rounded-2xl transition-all", hover === o.id && "ring-2 ring-brand ring-offset-2 ring-offset-cream")}
                >
                  <OfferCard offer={o} />
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2 lg:sticky lg:top-40 lg:self-start">
              <RevealOnView className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-line lg:aspect-auto lg:h-[70vh] lg:min-h-[560px]">
                <LeafletMap
                  points={points}
                  districts={districts}
                  monuments={MONUMENTS}
                  activeId={hover}
                  onHover={setHover}
                  onSelect={(id) => router.push(`/offres/${id}`)}
                  showUser
                  fitBounds
                />
                <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-full bg-white/85 px-3 py-1 text-xs text-ink-soft backdrop-blur">
                  {list.length} {t("cours dans un rayon de 3 km", "classes within 3 km")}
                </div>
              </RevealOnView>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
