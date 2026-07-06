/**
 * Données de démo de l'espace pro (Studio Bloom).
 * Les offres portent des heures relatives (`startsInHours`) comme côté client,
 * pour que les prix live « fondent » réellement pendant la démo.
 */

export interface VendorOffer {
  id: string;
  title: string;
  cat: string;
  capacity: number;
  placesLeft: number;
  basePrice: number;
  startsInHours: number;
  paused?: boolean;
}

export const initialVendorOffers: VendorOffer[] = [
  { id: "v-vinyasa", title: "Vinyasa Flow — 18h30", cat: "Yoga", capacity: 12, placesLeft: 6, basePrice: 24, startsInHours: 1.4 },
  { id: "v-reformer", title: "Reformer intensif — 7h30", cat: "Pilates", capacity: 8, placesLeft: 3, basePrice: 26, startsInHours: 9.5 },
  { id: "v-doux", title: "Pilates doux — 12h00", cat: "Pilates", capacity: 8, placesLeft: 0, basePrice: 22, startsInHours: 0 },
  { id: "v-debutant", title: "Yoga débutant — 20h00", cat: "Yoga", capacity: 10, placesLeft: 9, basePrice: 24, startsInHours: 52 },
];

export const vendorOrders = [
  { name: "Thomas L.", offer: "Vinyasa Flow — 18h30", ref: "FLO-STU-193", state: "à préparer" },
  { name: "Amélie R.", offer: "Vinyasa Flow — 18h30", ref: "FLO-STU-194", state: "à préparer" },
  { name: "Karim B.", offer: "Pilates doux — 12h00", ref: "FLO-STU-188", state: "retiré" },
  { name: "Julie M.", offer: "Pilates doux — 12h00", ref: "FLO-STU-187", state: "retiré" },
] as const;

export const payouts = [
  { date: "Aujourd'hui", amount: 126, state: "en route" },
  { date: "Hier", amount: 168, state: "reçu" },
  { date: "Samedi", amount: 214, state: "reçu" },
  { date: "Vendredi", amount: 97, state: "reçu" },
  { date: "Jeudi", amount: 143, state: "reçu" },
] as const;

export const revenueChart = [40, 55, 48, 70, 62, 88, 96];
export const revenueDays = ["L", "M", "M", "J", "V", "S", "D"];
