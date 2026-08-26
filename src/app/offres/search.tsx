"use client";

import { useSearchParams } from "next/navigation";
import { MapSearch } from "@/components/sections/map-search";
import { categories } from "@/lib/site";

/**
 * Enveloppe cliente de la recherche, chargée de lire `?sport=` dans l'URL.
 *
 * Pourquoi ici et non dans `MapSearch` : ce composant sert AUSSI l'accueil, qui
 * n'a pas de paramètre. Y appeler `useSearchParams` obligerait les deux pages à
 * porter une frontière `Suspense` et ferait sortir l'accueil du rendu statique
 * sans rien y gagner.
 *
 * La valeur est validée contre le catalogue : un `?sport=nimportequoi` forgé
 * n'installerait sinon qu'un filtre invisible qui ne correspond à rien, et la
 * page s'ouvrirait vide sans que le visiteur comprenne pourquoi.
 */
export function OffresSearch() {
  const brut = useSearchParams().get("sport");
  const sport = categories.some((c) => c.slug === brut) ? (brut as string) : undefined;

  return (
    <MapSearch
      titre={{
        fr: "Voir les meilleurs prix autour de vous",
        en: "See the best prices around you",
        h1: true,
        ton: "ink",
      }}
      sportInitial={sport}
      lienCatalogue={false}
      calendrier
    />
  );
}
