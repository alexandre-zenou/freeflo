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
  /** Jour de la semaine, 0 = lundi (pour l'onglet Planning). */
  day: number;
  time: string;
  paused?: boolean;
  /** Champ facultatif ajouté à la demande de la cliente. */
  description?: string;
  /** Uniquement proposé pour le Pilates et le Yoga (annotation cliente). */
  nonSlipSocks?: boolean;
}

/** Activités pour lesquelles la question des chaussettes antidérapantes se pose. */
export const SOCKS_ACTIVITIES = ["Pilates", "Yoga"];

export const ACTIVITIES = ["Yoga", "Pilates", "Boxe", "HIIT", "Cycling"];

/** Semaine affichée dans le Planning, comme la maquette (lun → dim). */
export const weekDays = [
  { short: "LUN", date: 14 },
  { short: "MAR", date: 15 },
  { short: "MER", date: 16 },
  { short: "JEU", date: 17 },
  { short: "VEN", date: 18 },
  { short: "SAM", date: 19 },
  { short: "DIM", date: 20 },
] as const;

export const initialVendorOffers: VendorOffer[] = [
  { id: "v-reformer", title: "Reformer intensif", cat: "Pilates", capacity: 8, placesLeft: 3, basePrice: 26, startsInHours: 9.5, day: 3, time: "07:30" },
  { id: "v-doux", title: "Pilates doux", cat: "Pilates", capacity: 8, placesLeft: 0, basePrice: 22, startsInHours: 0, day: 3, time: "12:00" },
  { id: "v-vinyasa", title: "Vinyasa Flow", cat: "Yoga", capacity: 12, placesLeft: 6, basePrice: 24, startsInHours: 1.4, day: 3, time: "18:30" },
  { id: "v-debutant", title: "Yoga débutant", cat: "Yoga", capacity: 10, placesLeft: 9, basePrice: 24, startsInHours: 52, day: 3, time: "20:00" },
  { id: "v-hiit", title: "HIIT express", cat: "HIIT", capacity: 14, placesLeft: 5, basePrice: 20, startsInHours: 30, day: 1, time: "09:00" },
  { id: "v-boxe", title: "Boxe cardio", cat: "Boxe", capacity: 16, placesLeft: 0, basePrice: 25, startsInHours: 44, day: 4, time: "19:00" },
];

/* ——— Rendez-vous individuels ———
   Un centre ne vend pas que des places de cours collectif : il vend aussi du
   temps en tête à tête (coaching, bilan, séance d'essai). C'est une place pour
   une personne, à une heure donnée, à un prix fixe. Pas de dégressivité ici :
   un rendez-vous n'a pas de salle à remplir, il est pris ou il ne l'est pas. */

export interface VendorAppointment {
  id: string;
  /** Type de rendez-vous, choisi dans `APPOINTMENT_TYPES`. */
  kind: string;
  kindEn: string;
  /** Coach ou praticien qui reçoit, facultatif. */
  coach?: string;
  /** Jour de la semaine affichée, 0 = lundi (même repère que `weekDays`). */
  day: number;
  time: string;
  durationMin: number;
  price: number;
  /** Nom du client quand le créneau est déjà pris, sinon `undefined`. */
  bookedBy?: string;
}

/** Les trois formats que la cliente cite : essai, coaching, bilan. */
export const APPOINTMENT_TYPES = [
  { fr: "Coaching individuel", en: "One-to-one coaching" },
  { fr: "Séance d'essai", en: "Trial session" },
  { fr: "Bilan et objectifs", en: "Assessment and goals" },
] as const;

export const APPOINTMENT_DURATIONS = [30, 45, 60, 90] as const;

export const initialVendorAppointments: VendorAppointment[] = [
  { id: "rdv-1", kind: "Coaching individuel", kindEn: "One-to-one coaching", coach: "Camille", day: 2, time: "08:00", durationMin: 60, price: 45 },
  { id: "rdv-2", kind: "Séance d'essai", kindEn: "Trial session", coach: "Camille", day: 2, time: "17:00", durationMin: 30, price: 15, bookedBy: "Sofia M." },
  { id: "rdv-3", kind: "Bilan et objectifs", kindEn: "Assessment and goals", coach: "Nadia", day: 4, time: "13:30", durationMin: 45, price: 35 },
];

/** Colonnes et statuts repris de la maquette : client · cours · créneau · statut. */
export interface VendorOrder {
  name: string;
  offer: string;
  slot: string;
  slotEn: string;
  ref: string;
  state: "confirmée" | "arrivée" | "annulée";
}

export const vendorOrders: VendorOrder[] = [
  { name: "Thomas L.", offer: "Vinyasa Flow", slot: "Mer 18h30", slotEn: "Wed 18:30", ref: "FLO-STU-193", state: "confirmée" },
  { name: "Sofia M.", offer: "Yoga débutant", slot: "Mer 20h00", slotEn: "Wed 20:00", ref: "FLO-STU-195", state: "confirmée" },
  { name: "Amélie R.", offer: "Reformer intensif", slot: "Lun 07h30", slotEn: "Mon 07:30", ref: "FLO-STU-194", state: "confirmée" },
  { name: "Karim B.", offer: "Boxe cardio", slot: "Ven 19h00", slotEn: "Fri 19:00", ref: "FLO-STU-188", state: "annulée" },
  { name: "Julie P.", offer: "Pilates doux", slot: "Lun 12h00", slotEn: "Mon 12:00", ref: "FLO-STU-187", state: "arrivée" },
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
    dateEn: "2 days ago",
    text: "Réservé une heure avant, accueil impeccable. Le cours était complet et l'énergie incroyable.",
    textEn: "Booked an hour before, faultless welcome. The class was full and the energy incredible.",
    reply: null,
    replyEn: null,
  },
  {
    name: "Thomas L.",
    course: "Pilates doux",
    rating: 5,
    date: "il y a 4 jours",
    dateEn: "4 days ago",
    text: "Première fois chez Studio Bloom grâce à FREEFLO, j'ai repris une carte de 10 depuis.",
    textEn: "First time at Studio Bloom thanks to FREEFLO, I have bought a 10-class pass since.",
    reply: "Merci Thomas, à très vite au studio !",
    replyEn: "Thanks Thomas, see you very soon at the studio!",
  },
  {
    name: "Inès K.",
    course: "Yoga débutant",
    rating: 4,
    date: "il y a 6 jours",
    dateEn: "6 days ago",
    text: "Très bon cours, vestiaires un peu petits quand on arrive à 3 en même temps.",
    textEn: "Very good class, changing rooms a little tight when three of us arrive at once.",
    reply: null,
    replyEn: null,
  },
] as const;

/** Fil d'activité — minutes relatives « au chargement », le composant fait vivre le temps. */
export const activitySeed = [
  { minutesAgo: 2, text: "Thomas L. a réservé Vinyasa Flow de 18h30", textEn: "Thomas L. booked the 18:30 Vinyasa Flow", kind: "sale" },
  { minutesAgo: 9, text: "Vinyasa Flow est passé en sprint final", textEn: "Vinyasa Flow entered the final sprint", kind: "melt" },
  { minutesAgo: 21, text: "Nouvel avis 5★ d'Amélie R. sur Vinyasa Flow", textEn: "New 5★ review from Amélie R. on Vinyasa Flow", kind: "review" },
  { minutesAgo: 34, text: "Sofia M. a réservé Yoga débutant de 20h00", textEn: "Sofia M. booked the 20:00 Yoga for beginners", kind: "sale" },
  { minutesAgo: 58, text: "Virement mensuel de 168 € envoyé", textEn: "Monthly payout of 168 € sent", kind: "payout" },
] as const;

/* Virements mensuels : la liste portait des jours (« Aujourd'hui », « Hier »),
   ce qui contredisait la promesse de reversement à la fin du mois. */
export const payouts = [
  { date: "Août", dateEn: "August", amount: 126, state: "en route" },
  { date: "Juillet", dateEn: "July", amount: 168, state: "reçu" },
  { date: "Juin", dateEn: "June", amount: 214, state: "reçu" },
  { date: "Mai", dateEn: "May", amount: 97, state: "reçu" },
  { date: "Avril", dateEn: "April", amount: 143, state: "reçu" },
] as const;

/** Jours de la semaine, réutilisés par la grille des heures chaudes. */
export const revenueDays = ["L", "M", "M", "J", "V", "S", "D"];

/* ——— Statistiques (démo) ———
   Retour client 08/2026 : `revenueChart` (graphique de revenus), les montants
   récupérés et `meltStats` (remise moyenne, répartition par palier) ont été
   supprimés. Seul le remplissage subsiste ici. */

export const recovery = {
  fillBefore: 61,
  fillWith: 78,
} as const;

export const acquisition = {
  newClients: 64,
  returned: 26,
  returnedFullPrice: 19,
  origins: [
    { area: "11e", areaEn: "11e", pct: 32 },
    { area: "4e", areaEn: "4e", pct: 21 },
    { area: "10e", areaEn: "10e", pct: 14 },
    { area: "15e", areaEn: "15e", pct: 9 },
    { area: "Autres", areaEn: "Other", pct: 24 },
  ],
} as const;

/** Intensité des ventes (0–4) par jour (L→D) et tranche horaire. */
export const heatRows = [
  { slot: "Matin (6h–11h)", slotEn: "Morning (6–11)", cells: [1, 2, 1, 1, 2, 3, 2] },
  { slot: "Midi (11h–14h)", slotEn: "Midday (11–14)", cells: [2, 2, 3, 2, 2, 1, 1] },
  { slot: "Après-midi (14h–18h)", slotEn: "Afternoon (14–18)", cells: [1, 1, 2, 2, 3, 2, 3] },
  { slot: "Soir (18h–22h)", slotEn: "Evening (18–22)", cells: [3, 4, 4, 3, 4, 2, 1] },
] as const;
