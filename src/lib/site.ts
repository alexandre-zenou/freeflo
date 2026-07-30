/**
 * FREEFLO — modèle de contenu unique (démo à données fictives).
 * Aucune vraie API : les offres portent des décalages temporels relatifs
 * (`startsInHours`) pour que le moteur de dégressivité (§3) reste « live ».
 */

export const site = {
  name: "FREEFLO",
  tagline: "Burn Calories, Not Cash.",
  taglineFr: "Le sport de dernière minute, à prix qui fond.",
  domain: "freeflo.fr",
  description:
    "FREEFLO libère les places de cours de sport invendues près de chez vous. Plus l'heure approche, plus le prix fond. Réservez en dernière minute, transpirez pour moins cher.",
  city: "Paris",
  email: "hello@freeflo.fr",
  social: {
    instagram: "https://instagram.com/freeflo",
    tiktok: "https://tiktok.com/@freeflo",
    linkedin: "https://linkedin.com/company/freeflo",
  },
} as const;

/** Navigation de la maquette cliente : à propos · connexion · espace pro · FR/EN. */
export const nav = {
  primary: [
    { label: "Qui sommes nous ?", href: "/qui-sommes-nous" },
    { label: "Connexion", href: "/connexion" },
    { label: "Espace pro", href: "/pro" },
  ],
  vendorCta: { label: "Inscrire mon centre", href: "/inscrire-son-centre" },
  auth: [
    { label: "Connexion", href: "/connexion" },
    { label: "Inscription", href: "/connexion?mode=signup" },
  ],
  locales: [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
  ],
} as const;

export interface Category {
  slug: string;
  label: string;
  image: string;
}

/**
 * Catalogue des sports — chaque catégorie porte un visuel fourni par le client
 * (direction artistique Canva : rouge / jaune saturé, studio).
 * Natation, danse et coaching perso sont retirés en attendant leurs photos ;
 * les rétablir ici *et* dans `offers` dès que les visuels arrivent.
 */
export const categories: Category[] = [
  { slug: "yoga", label: "Yoga", image: "/categories/yoga.jpg" },
  { slug: "pilates", label: "Pilates", image: "/categories/pilates.jpg" },
  { slug: "boxe", label: "Boxe", image: "/categories/boxe.jpg" },
  { slug: "hiit", label: "HIIT", image: "/categories/hiit.jpg" },
  { slug: "cycling", label: "Cycling", image: "/categories/cycling.jpg" },
];

export function categoryOf(slug: string): Category {
  return categories.find((c) => c.slug === slug) ?? categories[0];
}

export interface Offer {
  id: string;
  title: string;
  gym: string;
  category: string; // slug
  basePrice: number;
  placesLeft: number;
  /** Heures avant le créneau, à partir de « maintenant » (démo live). */
  startsInHours: number;
  durationMin: number;
  address: string;
  arrondissement: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  image: string;
  coach: string;
  description: string;
  /** Coordonnées réelles (Paris) pour la carte Leaflet. */
  lat: number;
  lng: number;
}

/** Point « vous êtes ici » de la démo — centre de Paris (Marais). */
export const userLocation = { lat: 48.8592, lng: 2.3549 } as const;

export const offers: Offer[] = [
  {
    id: "the-new-me-pilates",
    title: "Pilates Reformer — À vous le summer body",
    gym: "The New Me",
    category: "pilates",
    basePrice: 35,
    placesLeft: 2,
    startsInHours: 1.5,
    durationMin: 60,
    address: "4 rue du Zédé, 75015 Paris",
    arrondissement: "15e",
    distanceKm: 0.8,
    rating: 4.9,
    reviews: 214,
    image: "/categories/reformer.jpg",
    coach: "Camille",
    description:
      "Un reformer exigeant et fluide pour gainer tout le corps. Serviette et chaussettes antidérapantes fournies.",
    lat: 48.8412,
    lng: 2.3177,
  },
  {
    id: "boxe-republique",
    title: "Boxe anglaise — Cardio & technique",
    gym: "Ring 11",
    category: "boxe",
    basePrice: 28,
    placesLeft: 4,
    startsInHours: 3,
    durationMin: 75,
    address: "12 rue Oberkampf, 75011 Paris",
    arrondissement: "11e",
    distanceKm: 1.6,
    rating: 4.8,
    reviews: 388,
    image: "/categories/boxe.jpg",
    coach: "Sofiane",
    description:
      "Gants de location dispo. Un cours qui envoie : shadow, sac, corde. Tous niveaux, ambiance club.",
    lat: 48.8656,
    lng: 2.3705,
  },
  {
    id: "hot-yoga-marais",
    title: "Vinyasa Flow au coucher du soleil",
    gym: "Studio Bloom",
    category: "yoga",
    basePrice: 24,
    placesLeft: 8,
    startsInHours: 20,
    durationMin: 60,
    address: "9 rue de Turenne, 75004 Paris",
    arrondissement: "4e",
    distanceKm: 2.2,
    rating: 4.9,
    reviews: 512,
    image: "/categories/yoga.jpg",
    coach: "Léa",
    description:
      "Un flow dynamique face à la lumière dorée. Tapis et blocs sur place. Respiration, mobilité, lâcher-prise.",
    lat: 48.8556,
    lng: 2.3639,
  },
  {
    id: "hiit-bastille",
    title: "HIIT 45 — Full body brûle-tout",
    gym: "Forge Athletic",
    category: "hiit",
    basePrice: 22,
    placesLeft: 3,
    startsInHours: 6,
    durationMin: 45,
    address: "3 rue de la Roquette, 75011 Paris",
    arrondissement: "11e",
    distanceKm: 1.1,
    rating: 4.7,
    reviews: 176,
    image: "/categories/hiit.jpg",
    coach: "Marion",
    description:
      "Intervalles courts, intensité haute, zéro temps mort. Prévoyez de l'eau. On sort rincé et fier.",
    lat: 48.8535,
    lng: 2.3720,
  },
  {
    id: "cycling-opera",
    title: "Cycling Rythm — Ride dans le noir",
    gym: "Cadence Club",
    category: "cycling",
    basePrice: 26,
    placesLeft: 1,
    startsInHours: 0.75,
    durationMin: 50,
    address: "18 rue de Provence, 75009 Paris",
    arrondissement: "9e",
    distanceKm: 3.4,
    rating: 4.8,
    reviews: 297,
    image: "/categories/cycling.jpg",
    coach: "Dylan",
    description:
      "45 min de ride chorégraphié, lumières et son de club. Chaussures de location incluses.",
    lat: 48.8735,
    lng: 2.3345,
  },
];

export function offerById(id: string): Offer | undefined {
  return offers.find((o) => o.id === id);
}

/** Copie reprise mot pour mot de la maquette cliente (Canva, juillet 2026). */
export const steps = [
  {
    n: "01",
    title: "Découvrir",
    text: "Activez votre géolocalisation. Les cours près de vous s'affichent, à coûts moindres.",
  },
  {
    n: "02",
    title: "Réserver",
    text: "Une place vous plaît ? Bloquez-la en deux clics. Paiement sécurisé, place garantie.",
  },
  {
    n: "03",
    title: "Se présenter",
    text: "Confirmez votre identité à l'accueil du centre au créneau indiqué.",
  },
  {
    n: "04",
    title: "Profiter",
    text: "Profitez des offres, progressez à prix moindre, et notez votre expérience.",
  },
] as const;

export const vendorValue = [
  {
    title: "Zéro abonnement, zéro risque",
    text: "Aucun coût fixe à l'onboarding. On ne se rémunère qu'au partage de valeur, quand vous vendez une place qui serait partie à la poubelle.",
  },
  {
    title: "Commission dégressive",
    text: "Plus la remise est forte (place bientôt perdue), plus notre commission baisse. Vous êtes toujours gagnant à lister jusqu'au dernier moment.",
  },
  {
    title: "Virements quotidiens",
    text: "Comme Treatwell, pas comme les autres : vous êtes payé chaque jour, pas à la fin du mois.",
  },
  {
    title: "En ligne en 2 minutes",
    text: "Créez une offre, dupliquez celle d'hier, ajustez le stock. Un espace pro pensé pour aller vite entre deux cours.",
  },
] as const;

export const faq = [
  {
    q: "Comment le prix peut-il autant baisser ?",
    a: "Une place de cours non vendue ne rapporte rien au centre. FREEFLO applique une remise qui s'approfondit à mesure que l'heure du cours approche : le centre récupère un peu de valeur plutôt que rien, et vous en profitez.",
  },
  {
    q: "Le prix change vraiment en direct ?",
    a: "Oui. Notre moteur de dégressivité recalcule le prix affiché en continu selon le temps restant et les places libres. Ce que vous voyez est le prix que vous payez à l'instant T.",
  },
  {
    q: "Que se passe-t-il si j'annule ?",
    a: "Remboursement intégral si vous annulez plus de 6 h avant le créneau. Passé ce délai, la place est bloquée pour vous et n'est plus remboursable.",
  },
  {
    q: "Et si le cours est annulé par le centre ?",
    a: "Vous êtes remboursé automatiquement et vous pouvez signaler l'incident en un tap. Les centres peu fiables sont écartés.",
  },
  {
    q: "C'est réservé à Paris ?",
    a: "On démarre à Paris pour rôder l'expérience, puis on ouvre ville par ville. Inscrivez-vous pour être prévenu dès l'arrivée près de chez vous.",
  },
] as const;

export const stats = [
  { value: "-60%", label: "jusqu'à, en sprint final" },
  { value: "2 min", label: "pour mettre une offre en ligne" },
  { value: "0 €", label: "d'abonnement pour les centres" },
  { value: "24 h", label: "délai de virement aux centres" },
] as const;
