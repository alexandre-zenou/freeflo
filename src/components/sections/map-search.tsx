"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import { PillSelect } from "@/components/ui/pill-select";
import { RevealOnView } from "@/components/reveal-on-view";
import { RevealLines } from "@/components/reveal";
import { LeafletMap, type MapPoint } from "@/components/offers/leaflet-map";
import { distanceKm } from "@/lib/geo";
import { useGeolocation } from "@/components/use-geolocation";
import { categories, categoryOf, offers } from "@/lib/site";
import { computePrice } from "@/lib/pricing";
import { formatEuro } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Recherche cartographique de la maquette cliente :
 * deux filtres en pastille (type de cours / disponibilité), carte aux pastilles
 * de la charte, et panneau de résultats avec la disponibilité de chaque centre.
 *
 * Il n'y a PLUS de filtre « Localisation » par arrondissement : la position
 * réelle du visiteur, demandée au chargement, range déjà les résultats du plus
 * proche au plus loin et cadre la carte. Choisir un arrondissement à la main
 * faisait double emploi.
 *
 * Annotation client : « nouvelles couleurs de pastilles pour suivre charte
 * graphique » — les pastilles de prix sont rouges. Les repères jaunes de
 * monuments ont été retirés : ils encombraient la carte sans rien apprendre.
 */
function dayBucket(startsInHours: number): "today" | "tomorrow" | "later" {
  if (startsInHours <= 12) return "today";
  if (startsInHours <= 36) return "tomorrow";
  return "later";
}

/** « 850 m » en dessous du kilomètre, « 1,2 km » au-delà. */
function formatKm(km: number, t: (fr: string, en?: string) => string): string {
  if (km < 1) return `${Math.round(km * 100) * 10} m`;
  return t(`${km.toFixed(1).replace(".", ",")} km`, `${km.toFixed(1)} km`);
}

export function MapSearch() {
  const router = useRouter();
  const t = useT();
  const [cat, setCat] = useState("");
  const [avail, setAvail] = useState("");
  const [hover, setHover] = useState<string | null>(null);
  /*
    Sur l'accueil, la position est demandée au CHARGEMENT (le hook laisse la page
    peindre d'abord, et n'ouvre rien si la permission est déjà tranchée). Refus,
    échec ou navigateur sans géolocalisation : la carte reste sur Paris et rien
    ne le signale, personne n'ayant rien demandé.
  */
  const geo = useGeolocation({ auto: true });
  const me = geo.position;

  const list = useMemo(() => {
    const filtered = offers.filter((o) => {
      if (cat && o.category !== cat) return false;
      if (avail && dayBucket(o.startsInHours) !== avail) return false;
      return true;
    });
    if (!me) return filtered;
    /* Position connue : le plus proche d'abord, à heure de départ égale l'ordre
       du catalogue (déjà trié par imminence) départage. */
    return [...filtered].sort(
      (a, b) =>
        distanceKm(me, { lat: a.lat, lng: a.lng }) - distanceKm(me, { lat: b.lat, lng: b.lng }),
    );
  }, [cat, avail, me]);

  /* Sans filtre ET sans position, la carte reste sur la vue d'ensemble de
     Paris. Dès que le visiteur resserre sa recherche, elle suit ses résultats. */
  const hasFilters = Boolean(cat || avail);

  /* Les trois cours les plus proches : ils règlent le cadrage de la carte quand
     la position arrive, pour que le zoom montre le voisinage et non la France. */
  const focus = useMemo(() => (me ? list.slice(0, 3) : []), [list, me]);

  const points: MapPoint[] = useMemo(
    () =>
      list.map((o) => {
        const p = computePrice(o.basePrice, o.placesLeft, o.startsInHours);
        return { id: o.id, lat: o.lat, lng: o.lng, label: formatEuro(p.currentPrice), hot: p.heat > 0.6 };
      }),
    [list],
  );

  return (
    <section className="ff-container pb-16 pt-0 md:pb-20 md:pt-0">
      {/* Titre à gauche, raccourci vers le catalogue complet en haut à droite. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <RevealLines className="display text-[clamp(1.75rem,3.4vw,2.6rem)] text-brand">
          {t("Trouvez un cours autour de vous", "Find a class around you")}
        </RevealLines>

        <Link
          href="/offres"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand/35 px-4 py-2 text-sm text-brand transition-colors hover:bg-brand hover:text-white"
        >
          <Search className="h-4 w-4" /> {t("Voir toutes les offres", "See all offers")}
        </Link>
      </div>

      {/* Mêmes pastilles ovales que sur /offres (retour client : les listes
          déroulantes natives « font trop old school »). */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
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
      </div>

      {geo.state === "denied" && geo.askedByUser && (
        <p className="mt-2 text-xs text-brand">
          {t(
            "Localisation refusée. La carte reste sur la vue d'ensemble de Paris.",
            "Location denied. The map stays on the overview of Paris.",
          )}
        </p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.9fr_1fr]">
        <RevealOnView className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-line sm:aspect-[16/10] lg:aspect-auto lg:h-[720px]">
          <LeafletMap
            points={points}
            activeId={hover}
            onHover={setHover}
            onSelect={(id) => router.push(`/offres/${id}`)}
            showUser
            me={me}
            focus={focus}
            onLocate={() => geo.request()}
            locating={geo.state === "asking"}
            fitBounds={hasFilters}
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
                        {me && (
                          <>
                            {", "}
                            {formatKm(distanceKm(me, { lat: o.lat, lng: o.lng }), t)}
                          </>
                        )}
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
