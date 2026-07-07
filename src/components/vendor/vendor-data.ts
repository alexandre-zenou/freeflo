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

export interface VendorOrder {
  name: string;
  offer: string;
  ref: string;
  state: "à préparer" | "retiré";
}

export const vendorOrders: VendorOrder[] = [
  { name: "Thomas L.", offer: "Vinyasa Flow — 18h30", ref: "FLO-STU-193", state: "à préparer" },
  { name: "Amélie R.", offer: "Vinyasa Flow — 18h30", ref: "FLO-STU-194", state: "à préparer" },
  { name: "Léa S.", offer: "Vinyasa Flow — 18h30", ref: "FLO-STU-196", state: "à préparer" },
  { name: "Sofia M.", offer: "Yoga débutant — 20h00", ref: "FLO-STU-195", state: "à préparer" },
  { name: "Karim B.", offer: "Pilates doux — 12h00", ref: "FLO-STU-188", state: "retiré" },
  { name: "Julie M.", offer: "Pilates doux — 12h00", ref: "FLO-STU-187", state: "retiré" },
];

/* ——— Avis (cohérents avec le KPI : 4,9 · 512 avis) ——— */

export const ratingBreakdown = [
  { stars: 5, count: 465 },
  { stars: 4, count: 35 },
  { stars: 3, count: 8 },
  { stars: 2, count: 2 },
  { stars: 1, count: 2 },
] as const;

export const recentReviews = [
  {
    name: "Amélie R.",
    course: "Vinyasa Flow",
    rating: 5,
    date: "il y a 2 jours",
    text: "Réservé à −45% une heure avant, accueil au QR nickel. Le cours était complet et l'énergie incroyable.",
    reply: null,
  },
  {
    name: "Thomas L.",
    course: "Pilates doux",
    rating: 5,
    date: "il y a 4 jours",
    text: "Première fois chez Studio Bloom grâce à FREEFLO — j'ai repris une carte de 10 depuis.",
    reply: "Merci Thomas, à très vite au studio !",
  },
  {
    name: "Inès K.",
    course: "Yoga débutant",
    rating: 4,
    date: "il y a 6 jours",
    text: "Très bon cours, vestiaires un peu petits quand on arrive à 3 en même temps.",
    reply: null,
  },
] as const;

/** Fil d'activité — minutes relatives « au chargement », le composant fait vivre le temps. */
export const activitySeed = [
  { minutesAgo: 2, text: "Thomas L. a réservé Vinyasa Flow — 18h30", kind: "sale" },
  { minutesAgo: 9, text: "Vinyasa Flow est passé en sprint final (−50%)", kind: "melt" },
  { minutesAgo: 21, text: "Nouvel avis 5★ d'Amélie R. sur Vinyasa Flow", kind: "review" },
  { minutesAgo: 34, text: "Sofia M. a réservé Yoga débutant — 20h00", kind: "sale" },
  { minutesAgo: 58, text: "Virement quotidien de 168 € envoyé", kind: "payout" },
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

/* ——— Statistiques (démo, cohérentes avec les KPIs : 148 paniers · 3 240 € CA) ——— */

export const recovery = {
  /** Net encaissé sur des places qui partaient à la poubelle (après commission). */
  recoveredNet: 2430,
  recoveredDelta: "+31%",
  placesSaved: 148,
  placesLost: 43,
  fillBefore: 61,
  fillWith: 78,
} as const;

export const meltStats = {
  avgDiscount: 34,
  avgLeadTime: "5 h 40",
  /** Répartition des ventes par palier de remise. */
  byTier: [
    { tier: "Plein tarif", pct: 18, hot: false },
    { tier: "−15 à −25%", pct: 27, hot: false },
    { tier: "−30 à −45%", pct: 33, hot: false },
    { tier: "Sprint final (−50/−60%)", pct: 22, hot: true },
  ],
} as const;

export const acquisition = {
  newClients: 64,
  returned: 26,
  returnedFullPrice: 19,
  origins: [
    { area: "11e", pct: 32 },
    { area: "4e", pct: 21 },
    { area: "10e", pct: 14 },
    { area: "15e", pct: 9 },
    { area: "Autres", pct: 24 },
  ],
} as const;

/** Intensité des ventes (0–4) par jour (L→D) et tranche horaire. */
export const heatRows = [
  { slot: "Matin (6h–11h)", cells: [1, 2, 1, 1, 2, 3, 2] },
  { slot: "Midi (11h–14h)", cells: [2, 2, 3, 2, 2, 1, 1] },
  { slot: "Après-midi (14h–18h)", cells: [1, 1, 2, 2, 3, 2, 3] },
  { slot: "Soir (18h–22h)", cells: [3, 4, 4, 3, 4, 2, 1] },
] as const;
