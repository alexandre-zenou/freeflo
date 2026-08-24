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

/**
 * Vue par défaut : le centre de Paris, à défaut de mieux.
 *
 * Ce n'est PAS une position de repli pour le visiteur : rien ne s'affiche à cet
 * endroit, aucune distance ne s'en déduit. C'est le cadrage de la carte quand
 * on ne sait pas où est le visiteur, au même titre qu'une carte papier de la
 * ville, et il ne sert que si aucun cadrage sur les cours n'est demandé.
 */
export const PARIS_CENTER = { lat: 48.8566, lng: 2.3522 } as const;

/**
 * Les limites de Paris intra-muros, `[[sud, ouest], [nord, est]]`.
 *
 * C'est la vue par défaut de la carte : la ville entière, comme un plan de
 * Paris qu'on déplierait. On cadre sur ELLE plutôt que sur un niveau de zoom
 * choisi à l'avance, pour que le résultat tienne quelle que soit la taille du
 * conteneur, et plutôt que sur les pastilles des cours, qui donneraient un
 * zoom serré sur deux ou trois arrondissements.
 */
export const PARIS_BOUNDS: [[number, number], [number, number]] = [
  [48.8156, 2.2241],
  [48.9022, 2.4699],
];

/** Les 20 arrondissements de Paris, libellés comme dans les adresses du site. */
export const PARIS_ARRONDISSEMENTS: string[] = Array.from({ length: 20 }, (_, i) =>
  i === 0 ? "1er" : `${i + 1}e`,
);

/**
 * Cadre CENTRÉ sur le visiteur, assez large pour englober les points donnés.
 *
 * Cadrer sur « moi + les trois cours les plus proches » ne suffit pas : le
 * rectangle obtenu contient bien le visiteur, mais ne le met pas au milieu, et
 * si aucun cours n'est près de lui (jeu de démonstration parisien, visiteur
 * ailleurs) il s'ouvre sur la France entière. Ici le rayon est mesuré puis
 * appliqué des quatre côtés : la position reste au centre exact, quoi qu'il
 * arrive, et le zoom s'adapte au voisinage dans les bornes ci-dessous.
 *
 * Renvoie `[[sud, ouest], [nord, est]]`, la forme attendue par Leaflet.
 */
export function frameAround(
  me: { lat: number; lng: number },
  near: { lat: number; lng: number }[],
  { minKm = 0.7, maxKm = 5 }: { minKm?: number; maxKm?: number } = {},
): [[number, number], [number, number]] {
  const farthest = near.reduce((max, p) => Math.max(max, distanceKm(me, p)), 0);
  const km = Math.min(Math.max(farthest * 1.25, minKm), maxKm);

  const dLat = km / 111;
  /* Un degré de longitude rétrécit à mesure qu'on monte en latitude : sans ce
     cosinus, le cadre serait une fois et demie trop large à Paris. */
  const dLng = km / (111 * Math.cos((me.lat * Math.PI) / 180));
  return [
    [me.lat - dLat, me.lng - dLng],
    [me.lat + dLat, me.lng + dLng],
  ];
}

/**
 * Jusqu'où la carte peut être déplacée : Paris plus une marge de respiration.
 *
 * Sans cette limite, un geste franc envoie la carte à quarante kilomètres, très
 * au-delà de ce qui est chargé : on regarde alors du vide gris le temps que les
 * tuiles arrivent, pour voir une campagne où FREEFLO n'a aucun cours. La borne
 * garde le visiteur sur la ville, donc sur des tuiles déjà en mémoire.
 *
 * `me` étend la limite jusqu'au visiteur quand il est hors de Paris : la borne
 * est là pour éviter le vide, pas pour l'empêcher de se voir.
 */
export function panBounds(me?: { lat: number; lng: number } | null): [[number, number], [number, number]] {
  /*
    Marge généreuse À DESSEIN. Avec 10 km, la zone autorisée (28 km de large)
    était à peine plus large que ce qu'un téléphone affiche au zoom minimum :
    la carte butait de tous les côtés et semblait bloquée. Ici le visiteur a de
    la place, tout en restant sur ce qui est préchargé.
  */
  const PAD_LAT = 0.25; // ~28 km
  const PAD_LNG = 0.35; // ~26 km à la latitude de Paris
  const [[south, west], [north, east]] = PARIS_BOUNDS;
  return [
    [Math.min(south, me?.lat ?? south) - PAD_LAT, Math.min(west, me?.lng ?? west) - PAD_LNG],
    [Math.max(north, me?.lat ?? north) + PAD_LAT, Math.max(east, me?.lng ?? east) + PAD_LNG],
  ];
}
