/** Distance à vol d'oiseau entre deux points, en kilomètres (formule de haversine). */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/**
 * Valeur du filtre « Localisation » qui ne désigne pas un arrondissement mais
 * la position du visiteur. Partagée par les deux écrans qui portent ce filtre,
 * pour qu'aucun ne la confonde avec un libellé d'arrondissement.
 */
export const NEARBY = "autour-de-moi";

/** Les 20 arrondissements de Paris, libellés comme dans les adresses du site. */
export const PARIS_ARRONDISSEMENTS: string[] = Array.from({ length: 20 }, (_, i) =>
  i === 0 ? "1er" : `${i + 1}e`,
);
