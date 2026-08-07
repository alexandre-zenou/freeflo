"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import { PillSelect } from "@/components/ui/pill-select";
import { RevealOnView } from "@/components/reveal-on-view";
import { RevealLines } from "@/components/reveal";
import { LeafletMap, type MapPoint, type Monument } from "@/components/offers/leaflet-map";
import { PARIS_ARRONDISSEMENTS } from "@/lib/geo";
import { categories, categoryOf, offers } from "@/lib/site";
import { computePrice } from "@/lib/pricing";
import { formatEuro } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Recherche cartographique de la maquette cliente :
 * trois filtres en pastille (localisation / type de cours / disponibilité),
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

export function MapSearch() {
  const router = useRouter();
  const t = useT();
  const [loc, setLoc] = useState("");
  const [cat, setCat] = useState("");
  const [avail, setAvail] = useState("");
  const [hover, setHover] = useState<string | null>(null);

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
      <RevealLines className="display text-[clamp(1.75rem,3.4vw,2.6rem)] text-brand">
        {t("Trouvez un cours autour de vous", "Find a class around you")}
      </RevealLines>

      {/* Mêmes pastilles ovales que sur /offres (retour client : les listes
          déroulantes natives « font trop old school »). */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
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

        <Link
          href="/offres"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand/35 px-4 py-2 text-sm text-brand transition-colors hover:bg-brand hover:text-white"
        >
          <Search className="h-4 w-4" /> {t("Voir toutes les offres", "See all offers")}
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.9fr_1fr]">
        <RevealOnView className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-line sm:aspect-[16/10] lg:aspect-auto lg:h-[720px]">
          <LeafletMap
            points={points}
            monuments={MONUMENTS}
            activeId={hover}
            onHover={setHover}
            onSelect={(id) => router.push(`/offres/${id}`)}
            showUser
            fitBounds
          />
        </RevealOnView>

        {/* panneau de résultats, avec la disponibilité de chaque centre */}
        <div className="flex flex-col overflow-hidden rounded-3xl bg-paper ring-1 ring-line lg:h-[720px]">
          <p className="shrink-0 border-b border-line px-5 py-3 text-sm font-medium text-ink">
            {list.length} {list.length > 1 ? t("emplacements", "locations") : t("emplacement", "location")}
          </p>
          <ul className="divide-y divide-line overflow-y-auto">
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
                        {o.rating.toFixed(1)} {t(categoryOf(o.category).label, categoryOf(o.category).labelEn)}
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
