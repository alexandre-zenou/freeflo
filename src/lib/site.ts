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
  descriptionEn:
    "FREEFLO releases unsold sport class places near you. The closer the class, the lower the price. Book at the last minute, sweat for less.",
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
    { label: "Qui sommes nous ?", labelEn: "Who we are", href: "/qui-sommes-nous" },
    { label: "Connexion", labelEn: "Log in", href: "/connexion" },
    { label: "Espace pro", labelEn: "Pro area", href: "/pro" },
  ],
  /* Le CTA mène à l'entrée du parcours d'inscription (planche 22 du retour
     client), pas à la page qui explique l'intérêt de rejoindre FREEFLO. */
  vendorCta: { label: "Inscrire mon centre", labelEn: "Sign up my centre", href: "/inscription-centre" },
  auth: [
    { label: "Connexion", labelEn: "Log in", href: "/connexion" },
    { label: "Inscription", labelEn: "Sign up", href: "/connexion?mode=signup" },
  ],
  locales: [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
  ],
} as const;

/**
 * Retour client 08/2026 : « Remets les anciennes photos, désolée mais les miennes
 * font cheap. » On revient donc aux visuels d'avant la maquette Canva. La VIDÉO du
 * héros, elle, reste celle de la cliente (elle demande de garder ses vidéos).
 * Les fichiers `public/categories/*.jpg` sont conservés au cas où elle changerait
 * d'avis.
 */
const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=80`;

export interface Category {
  slug: string;
  label: string;
  labelEn: string;
  image: string;
}

/**
 * Catalogue des sports — chaque catégorie porte un visuel fourni par le client
 * (direction artistique Canva : rouge / jaune saturé, studio).
 * Natation, danse et coaching perso sont retirés en attendant leurs photos ;
 * les rétablir ici *et* dans `offers` dès que les visuels arrivent.
 */
export const categories: Category[] = [
  { slug: "yoga", label: "Yoga", labelEn: "Yoga", image: U("photo-1544367567-0f2fcb009e0b") },
  { slug: "pilates", label: "Pilates", labelEn: "Pilates", image: U("photo-1518611012118-696072aa579a") },
  { slug: "boxe", label: "Boxe", labelEn: "Boxing", image: U("photo-1549060279-7e168fcee0c2") },
  { slug: "hiit", label: "HIIT", labelEn: "HIIT", image: U("photo-1517836357463-d25dfeac3438") },
  { slug: "cycling", label: "Cycling", labelEn: "Cycling", image: U("photo-1534258936925-c58bed479fcb") },
];

export function categoryOf(slug: string): Category {
  return categories.find((c) => c.slug === slug) ?? categories[0];
}

export interface Offer {
  id: string;
  title: string;
  titleEn: string;
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
  descriptionEn: string;
  /** Coordonnées réelles (Paris) pour la carte Leaflet. */
  lat: number;
  lng: number;
}

/** Point « vous êtes ici » de la démo — centre de Paris (Marais). */
export const userLocation = { lat: 48.8592, lng: 2.3549 } as const;

export const offers: Offer[] = [
  {
    id: "the-new-me-pilates",
    title: "Pilates Reformer",
    titleEn: "Reformer Pilates",
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
    image: U("photo-1518611012118-696072aa579a"),
    coach: "Camille",
    description:
      "Un reformer exigeant et fluide pour gainer tout le corps. Serviette et chaussettes antidérapantes fournies.",
    descriptionEn:
      "A demanding, flowing reformer session to work the whole body. Towel and grip socks provided.",
    lat: 48.8412,
    lng: 2.3177,
  },
  {
    id: "boxe-republique",
    title: "Boxe anglaise, cardio et technique",
    titleEn: "Boxing, cardio and technique",
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
    image: U("photo-1549060279-7e168fcee0c2"),
    coach: "Sofiane",
    description:
      "Gants de location dispo. Un cours qui envoie : shadow, sac, corde. Tous niveaux, ambiance club.",
    descriptionEn:
      "Gloves available to rent. A class that hits hard: shadow, bag, rope. All levels, club energy.",
    lat: 48.8656,
    lng: 2.3705,
  },
  {
    id: "hot-yoga-marais",
    title: "Vinyasa Flow au coucher du soleil",
    titleEn: "Sunset Vinyasa Flow",
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
    image: U("photo-1544367567-0f2fcb009e0b"),
    coach: "Léa",
    description:
      "Un flow dynamique face à la lumière dorée. Tapis et blocs sur place. Respiration, mobilité, lâcher-prise.",
    descriptionEn:
      "A dynamic flow facing the golden light. Mats and blocks on site. Breath, mobility, letting go.",
    lat: 48.8556,
    lng: 2.3639,
  },
  {
    id: "hiit-bastille",
    title: "HIIT 45, full body brûle-tout",
    titleEn: "HIIT 45, full-body burner",
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
    image: U("photo-1517836357463-d25dfeac3438"),
    coach: "Marion",
    description:
      "Intervalles courts, intensité haute, zéro temps mort. Prévoyez de l'eau. On sort rincé et fier.",
    descriptionEn:
      "Short intervals, high intensity, no dead time. Bring water. You leave wrecked and proud.",
    lat: 48.8535,
    lng: 2.3720,
  },
  {
    id: "cycling-opera",
    title: "Cycling Rythm, ride dans le noir",
    titleEn: "Cycling Rythm, ride in the dark",
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
    image: U("photo-1534258936925-c58bed479fcb"),
    coach: "Dylan",
    description:
      "45 min de ride chorégraphié, lumières et son de club. Chaussures de location incluses.",
    descriptionEn:
      "45 minutes of choreographed riding, club lights and sound. Shoe rental included.",
    lat: 48.8735,
    lng: 2.3345,
  },
];

export function offerById(id: string): Offer | undefined {
  return offers.find((o) => o.id === id);
}

/**
 * Copie reprise mot pour mot de la maquette cliente (Canva, juillet 2026).
 * Les champs `*En` portent la version anglaise : le sélecteur FR/EN est réel,
 * tout ce qui est visible doit exister dans les deux langues.
 */
export const steps = [
  {
    n: "01",
    title: "Découvrir",
    titleEn: "Find",
    text: "Activez votre géolocalisation. Les cours près de vous s'affichent, à coûts moindres.",
    textEn: "Turn on location. Classes near you show up, at lower prices.",
  },
  {
    n: "02",
    title: "Réserver",
    titleEn: "Book",
    text: "Une place vous plaît ? Bloquez-la en deux clics. Paiement sécurisé, place garantie.",
    textEn: "Found a spot you like? Grab it in two taps. Secure payment, place guaranteed.",
  },
  {
    n: "03",
    title: "Se présenter",
    titleEn: "Show up",
    text: "Confirmez votre identité à l'accueil du centre au créneau indiqué.",
    textEn: "Confirm your name at the front desk, at the time booked.",
  },
  {
    n: "04",
    title: "Profiter",
    titleEn: "Enjoy",
    text: "Profitez des offres, progressez à prix moindre, et notez votre expérience.",
    textEn: "Make the most of the deals, train for less, and rate your session.",
  },
] as const;

export const vendorValue = [
  {
    title: "Zéro abonnement, zéro risque",
    titleEn: "No subscription, no risk",
    text: "Aucun coût fixe à l'onboarding. On ne se rémunère qu'au partage de valeur, quand vous vendez une place qui serait partie à la poubelle.",
    textEn: "No fixed onboarding cost. We only earn a share when you sell a place that would otherwise have gone to waste.",
  },
  {
    title: "Commission dégressive",
    titleEn: "Sliding commission",
    text: "Plus la remise est forte (place bientôt perdue), plus notre commission baisse. Vous êtes toujours gagnant à lister jusqu'au dernier moment.",
    textEn: "The deeper the discount on a place about to be lost, the lower our commission. Listing to the last minute always works in your favour.",
  },
  {
    title: "Virements quotidiens",
    titleEn: "Paid every day",
    text: "Vous êtes payé chaque jour, pas à la fin du mois. L'argent d'une place vendue ce soir est sur votre compte demain.",
    textEn: "You are paid daily, not at month end. A place sold tonight lands in your account tomorrow.",
  },
  {
    title: "En ligne en 2 minutes",
    titleEn: "Live in 2 minutes",
    text: "Créez une offre, dupliquez celle d'hier, ajustez le stock. Un espace pro pensé pour aller vite entre deux cours.",
    textEn: "Create an offer, duplicate yesterday's, adjust the stock. A pro area built to be quick between two classes.",
  },
] as const;

export const faq = [
  {
    q: "Comment le prix peut-il autant baisser ?",
    qEn: "How can the price drop that much?",
    a: "Une place de cours non vendue ne rapporte rien au centre. FREEFLO applique une remise qui s'approfondit à mesure que l'heure du cours approche : le centre récupère un peu de valeur plutôt que rien, et vous en profitez.",
    aEn: "An unsold place earns the centre nothing at all. FREEFLO applies a discount that deepens as the class draws closer: the centre recovers some value rather than none, and you get the benefit.",
  },
  {
    q: "Le prix change vraiment en direct ?",
    qEn: "Does the price really change live?",
    a: "Oui. Notre moteur de dégressivité recalcule le prix affiché en continu selon le temps restant et les places libres. Ce que vous voyez est le prix que vous payez à l'instant T.",
    aEn: "Yes. Our pricing engine recalculates continuously from the time left and the places still free. What you see is what you pay, right now.",
  },
  {
    q: "Que se passe-t-il si j'annule ?",
    qEn: "What happens if I cancel?",
    a: "Remboursement intégral si vous annulez plus de 6 h avant le créneau. Passé ce délai, la place est bloquée pour vous et n'est plus remboursable.",
    aEn: "Full refund if you cancel more than 6 hours before the class. After that, the place is held for you and is no longer refundable.",
  },
  {
    q: "Et si le cours est annulé par le centre ?",
    qEn: "And if the centre cancels the class?",
    a: "Vous êtes remboursé automatiquement et vous pouvez signaler l'incident en un tap. Les centres peu fiables sont écartés.",
    aEn: "You are refunded automatically, and you can report it in one tap. Unreliable centres are removed from the platform.",
  },
  {
    q: "C'est réservé à Paris ?",
    qEn: "Is it Paris only?",
    a: "On démarre à Paris pour rôder l'expérience, puis on ouvre ville par ville. Inscrivez-vous pour être prévenu dès l'arrivée près de chez vous.",
    aEn: "We are starting in Paris to get the experience right, then opening city by city. Sign up to hear the moment we reach you.",
  },
] as const;

/**
 * Retour client 08/2026 : le taux de remise maximal (« −60 % ») a été retiré —
 * aucun pourcentage de remise ni de commission ne doit apparaître sur le site.
 */
export const stats = [
  { value: "2 min", label: "pour mettre une offre en ligne", labelEn: "to put an offer online" },
  { value: "0 €", label: "d'abonnement pour les centres", labelEn: "subscription for centres" },
  { value: "24 h", label: "délai de virement aux centres", labelEn: "until centres are paid out" },
] as const;
