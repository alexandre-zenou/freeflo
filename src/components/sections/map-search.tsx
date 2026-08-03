"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import { LeafletMap, type MapPoint, type Monument } from "@/components/offers/leaflet-map";
import { categories, categoryOf, offers } from "@/lib/site";
import { computePrice } from "@/lib/pricing";
import { formatEuro } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Recherche cartographique de la maquette cliente :
 * trois listes déroulantes (localisation / type de cours / disponibilité),
 * carte aux pastilles de la charte, et panneau de résultats avec la
 * disponibilité de chaque centre.
 *
 * Annotation client : « nouvelles couleurs de pastilles pour suivre charte
 * graphique + jaune pour monument » — les prix sont rouges, les repères jaunes.
 */
const MONUMENTS: Monument[] = [
  { label: "Tour Eiffel", lat: 48.8584, lng: 2.2945 },
  { label: "Louvre", lat: 48.8606, lng: 2.3376 },
  { label: "Notre-Dame", lat: 48.8530, lng: 2.3499 },
  { label: "Sacré-Cœur", lat: 48.8867, lng: 2.3431 },
  { label: "Arc de Triomphe", lat: 48.8738, lng: 2.2950 },
];

function dayBucket(startsInHours: number): "today" | "tomorrow" | "later" {
  if (startsInHours <= 12) return "today";
  if (startsInHours <= 36) return "tomorrow";
  return "later";
}

const selectCls =
  "shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white outline-none transition-colors hover:bg-brand-deep focus-visible:ring-2 focus-visible:ring-brand-deep focus-visible:ring-offset-2";

export function MapSearch() {
  const router = useRouter();
  const t = useT();
  const [loc, setLoc] = useState("");
  const [cat, setCat] = useState("");
  const [avail, setAvail] = useState("");
  const [hover, setHover] = useState<string | null>(null);

  const arrondissements = useMemo(
    () => [...new Set(offers.map((o) => o.arrondissement))].sort(),
    [],
  );

  const list = useMemo(
    () =>
      offers.filter((o) => {
        if (loc && o.arrondissement !== loc) return false;
        if (cat && o.category !== cat) return false;
        if (avail && dayBucket(o.startsInHours) !== avail) return false;
        return true;
      }),
    [loc, cat, avail],
  );

  const points: MapPoint[] = useMemo(
    () =>
      list.map((o) => {
        const p = computePrice(o.basePrice, o.placesLeft, o.startsInHours);
        return { id: o.id, lat: o.lat, lng: o.lng, label: formatEuro(p.currentPrice), hot: p.heat > 0.6 };
      }),
    [list],
  );

  return (
    <section className="ff-container py-16 md:py-20">
      <h2 className="display text-[clamp(1.75rem,3.4vw,2.6rem)] text-brand">
        {t("Trouvez un cours autour de vous", "Find a class around you")}
      </h2>

      {/* listes déroulantes de la maquette */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="m-loc">{t("Localisation", "Location")}</label>
        <select id="m-loc" value={loc} onChange={(e) => setLoc(e.target.value)} className={selectCls}>
          <option value="">{t("Localisation", "Location")}</option>
          {arrondissements.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="m-cat">{t("Type de cours", "Class type")}</label>
        <select id="m-cat" value={cat} onChange={(e) => setCat(e.target.value)} className={selectCls}>
          <option value="">{t("Type de cours", "Class type")}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="m-avail">{t("Disponibilité", "Availability")}</label>
        <select id="m-avail" value={avail} onChange={(e) => setAvail(e.target.value)} className={selectCls}>
          <option value="">{t("Disponibilité", "Availability")}</option>
          <option value="today">{t("Aujourd'hui", "Today")}</option>
          <option value="tomorrow">{t("Demain", "Tomorrow")}</option>
        </select>

        <button
          onClick={() => { setLoc(""); setCat(""); setAvail(""); }}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand/35 px-4 py-2 text-sm text-brand transition-colors hover:bg-brand hover:text-white"
        >
          <Search className="h-4 w-4" /> {t("Rechercher ici", "Search here")}
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-line lg:aspect-auto lg:h-[520px]">
          <LeafletMap
            points={points}
            monuments={MONUMENTS}
            activeId={hover}
            onHover={setHover}
            onSelect={(id) => router.push(`/offres/${id}`)}
            showUser
            fitBounds
          />
        </div>

        {/* panneau de résultats, avec la disponibilité de chaque centre */}
        <div className="overflow-hidden rounded-3xl bg-paper ring-1 ring-line">
          <p className="border-b border-line px-5 py-3 text-sm font-medium text-ink">
            {list.length} {list.length > 1 ? t("emplacements", "locations") : t("emplacement", "location")}
          </p>
          <ul className="divide-y divide-line">
            {list.map((o) => {
              const available = o.placesLeft > 0;
              return (
                <li key={o.id}>
                  <button
                    onMouseEnter={() => setHover(o.id)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => router.push(`/offres/${o.id}`)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-secondary"
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <Image src={o.image} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{o.gym}</span>
                      <span className="flex items-center gap-1 text-xs text-ink-soft">
                        <Star className="h-3 w-3 text-gold" fill="currentColor" />
                        {o.rating.toFixed(1)} · {categoryOf(o.category).label}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-xs font-medium",
                          available ? "text-emerald-700" : "text-brand",
                        )}
                      >
                        {available ? t("Disponible", "Available") : t("Non disponible", "Unavailable")}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            {list.length === 0 && (
              <li className="px-5 py-6 text-sm text-ink-soft">
                {t("Aucun cours sur ces critères.", "No class matches these filters.")}
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
