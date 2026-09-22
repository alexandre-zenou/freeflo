/**
 * Référence lisible d'une réservation, `FLO-XXX-0000`.
 *
 * Dans un module SANS `"use client"` : le serveur la calcule désormais au
 * moment de créer la réservation en base (`lib/reservations-serveur.ts`), et
 * un module serveur ne peut pas importer une fonction d'un module client.
 * `lib/account.tsx` la ré-exporte, les imports existants ne bougent pas.
 *
 * Stable pour une même offre au même prix, ce qui permet de la retrouver à
 * l'accueil du centre sans base de données commune.
 */
export function bookingRef(offerId: string, basePrice: number, placesLeft: number): string {
  const graine = `${offerId}${basePrice}${placesLeft}`;
  let n = 0;
  for (let i = 0; i < graine.length; i++) n = (n * 31 + graine.charCodeAt(i)) % 10000;
  return `FLO-${offerId.slice(0, 3).toUpperCase()}-${String(n).padStart(4, "0")}`;
}
