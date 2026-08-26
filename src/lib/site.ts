/**
 * FREEFLO — modèle de contenu unique (démo à données fictives).
 * Aucune vraie API : les offres portent des décalages temporels relatifs
 * (`startsInHours`) pour que le moteur de dégressivité (§3) reste « live ».
 */

export const site = {
  name: "FREEFLO",
  tagline: "Burn Calories, Not Cash",
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

/**
 * Navigation : trouver un cours, connexion, puis le CTA centre et FR/EN.
 *
 * « Espace pro » n'est PAS ici : il expose les données de l'application et n'est
 * ouvert qu'au compte d'administration. Le lien apparaît dans l'en-tête pour ce
 * seul compte (`site-header.tsx`), et `/pro` reste gardée par `ProGuard`.
 */
export const nav = {
  primary: [
    /* La page principale côté client n'avait aucune entrée de menu : on
       n'y accédait que par un bouton de l'accueil ou par le pied de page.
       Même libellé que le pied de page, pour ne pas nommer deux fois la
       même destination différemment. */
    { label: "Trouver un cours", labelEn: "Find a class", href: "/offres" },
    /* Connexion en dernier, juste avant le CTA : c'est le compte du visiteur,
       il se range du côté des actions et non des rubriques du site. */
    { label: "Connexion", labelEn: "Log in", href: "/connexion" },
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
 *
 * EXCEPTION — le cycling utilise SA photo (`/categories/cycling.jpg`). Aucune
 * banque d'images n'a donné de vrai cours de cycling en salle (une quarantaine
 * testées ; la seule correcte affichait la marque « Peloton » en clair). La
 * sienne montre un vrai cours, en tenues rouges conformes à sa charte, sans
 * marquage. À rebasculer sur Unsplash si elle fournit un autre visuel.
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
  { slug: "boxe", label: "Boxe", labelEn: "Boxing", image: U("photo-1584464491033-06628f3a6b7b") },
  { slug: "hiit", label: "HIIT", labelEn: "HIIT", image: U("photo-1517836357463-d25dfeac3438") },
  { slug: "cycling", label: "Cycling", labelEn: "Cycling", image: "/categories/cycling.jpg" },
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

/**
 * Tranche de journée d'une offre, déduite du seul `startsInHours` : on ne
 * construit JAMAIS de `Date` au rendu, sinon le serveur et le client
 * calculeraient deux résultats différents et l'hydratation divergerait.
 *
 * Partagé par le bandeau de l'accueil (« les cours du jour ») et par le filtre
 * Disponibilité de `/offres`, pour que « aujourd'hui » veuille dire la même
 * chose aux deux endroits.
 */
export function dayBucket(startsInHours: number): "today" | "tomorrow" | "later" {
  if (startsInHours <= 12) return "today";
  if (startsInHours <= 36) return "tomorrow";
  return "later";
}

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
    rating: 4.8,
    reviews: 388,
    image: U("photo-1584464491033-06628f3a6b7b"),
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
    rating: 4.8,
    reviews: 297,
    image: "/categories/cycling.jpg",
    coach: "Dylan",
    description:
      "45 min de ride chorégraphié, lumières et son de club. Chaussures de location incluses.",
    descriptionEn:
      "45 minutes of choreographed riding, club lights and sound. Shoe rental included.",
    lat: 48.8735,
    lng: 2.3345,
  },

  /*
    Catalogue élargi : cinq offres ne remplissaient ni la carte ni les filtres,
    et les suggestions de la fiche offre tombaient toujours sur les mêmes.
    Réparties sur treize arrondissements, avec des échéances étalées pour que
    « Aujourd'hui », « Demain » et la dégressivité aient de la matière.

    Les visuels restent ceux, validés, de chaque catégorie : les identifiants
    Unsplash non vérifiés ont déjà donné une photo de boxe montrant un disque
    de fonte. De vraies photos par centre restent à fournir.
  */
  {
    id: "yoga-batignolles",
    title: "Hatha doux, retour au calme",
    titleEn: "Gentle Hatha, winding down",
    gym: "Yoga Room Batignolles",
    category: "yoga",
    basePrice: 22,
    placesLeft: 5,
    startsInHours: 4,
    durationMin: 60,
    address: "12 rue des Dames, 75017 Paris",
    arrondissement: "17e",
    rating: 4.8,
    reviews: 163,
    image: U("photo-1544367567-0f2fcb009e0b"),
    coach: "Inès",
    description:
      "Un rythme lent, beaucoup de sol, et une longue relaxation finale. Tapis et couvertures sur place.",
    descriptionEn:
      "A slow pace, plenty of floor work, and a long final relaxation. Mats and blankets provided.",
    lat: 48.8842,
    lng: 2.322,
  },
  {
    id: "pilates-bastille",
    title: "Pilates matwork, ceinture abdominale",
    titleEn: "Mat Pilates, deep core",
    gym: "Studio Mat",
    category: "pilates",
    basePrice: 28,
    placesLeft: 6,
    startsInHours: 9,
    durationMin: 55,
    address: "24 rue de Charenton, 75012 Paris",
    arrondissement: "12e",
    rating: 4.7,
    reviews: 204,
    image: U("photo-1518611012118-696072aa579a"),
    coach: "Awa",
    description:
      "Travail au sol, sans machine. Petit matériel fourni, cercle et ballon. Accessible aux débutants.",
    descriptionEn:
      "Floor work, no machines. Small equipment provided, ring and ball. Beginners welcome.",
    lat: 48.8515,
    lng: 2.3705,
  },
  {
    id: "boxe-belleville",
    title: "Boxe thaï, technique et sac",
    titleEn: "Muay Thai, technique and bag work",
    gym: "Fight Club Belleville",
    category: "boxe",
    basePrice: 30,
    placesLeft: 2,
    startsInHours: 2.5,
    durationMin: 75,
    address: "45 rue de Belleville, 75020 Paris",
    arrondissement: "20e",
    rating: 4.9,
    reviews: 341,
    image: U("photo-1584464491033-06628f3a6b7b"),
    coach: "Rachid",
    description:
      "Gardes, coups de pied, travail au sac. Protège-tibias en location. Tous niveaux, rythme soutenu.",
    descriptionEn:
      "Guards, kicks, bag work. Shin guards for rent. All levels, brisk pace.",
    lat: 48.872,
    lng: 2.381,
  },
  {
    id: "hiit-montparnasse",
    title: "HIIT express, 40 minutes chrono",
    titleEn: "Express HIIT, 40 minutes flat",
    gym: "Iron Loft",
    category: "hiit",
    basePrice: 20,
    placesLeft: 7,
    startsInHours: 5,
    durationMin: 40,
    address: "8 rue Delambre, 75014 Paris",
    arrondissement: "14e",
    rating: 4.6,
    reviews: 118,
    image: U("photo-1517836357463-d25dfeac3438"),
    coach: "Kevin",
    description:
      "Format court pour une pause déjeuner. Poids de corps et kettlebells, aucune chorégraphie à retenir.",
    descriptionEn:
      "A short format built for a lunch break. Bodyweight and kettlebells, nothing to memorise.",
    lat: 48.842,
    lng: 2.328,
  },
  {
    id: "cycling-nation",
    title: "Ride Nation, montée et sprint",
    titleEn: "Nation ride, climbs and sprints",
    gym: "Cadence Club Nation",
    category: "cycling",
    basePrice: 24,
    placesLeft: 3,
    startsInHours: 11,
    durationMin: 45,
    address: "3 avenue Philippe Auguste, 75011 Paris",
    arrondissement: "11e",
    rating: 4.7,
    reviews: 182,
    image: "/categories/cycling.jpg",
    coach: "Nina",
    description:
      "Alternance de montées longues et de sprints courts. Chaussures de location incluses.",
    descriptionEn:
      "Long climbs alternating with short sprints. Shoe rental included.",
    lat: 48.852,
    lng: 2.39,
  },
  {
    id: "yoga-canal",
    title: "Yin au bord du canal",
    titleEn: "Yin by the canal",
    gym: "Bloom Canal",
    category: "yoga",
    basePrice: 20,
    placesLeft: 9,
    startsInHours: 26,
    durationMin: 75,
    address: "17 quai de Valmy, 75010 Paris",
    arrondissement: "10e",
    rating: 4.9,
    reviews: 276,
    image: U("photo-1544367567-0f2fcb009e0b"),
    coach: "Camille",
    description:
      "Postures tenues longtemps, respiration guidée, lumière tamisée. Idéal en fin de journée.",
    descriptionEn:
      "Long-held postures, guided breathing, low light. Made for the end of the day.",
    lat: 48.872,
    lng: 2.366,
  },
  {
    id: "pilates-passy",
    title: "Reformer avancé, gainage complet",
    titleEn: "Advanced reformer, full-body control",
    gym: "Reformer 16",
    category: "pilates",
    basePrice: 38,
    placesLeft: 1,
    startsInHours: 1.2,
    durationMin: 50,
    address: "22 rue de Passy, 75016 Paris",
    arrondissement: "16e",
    rating: 4.9,
    reviews: 142,
    image: U("photo-1518611012118-696072aa579a"),
    coach: "Hélène",
    description:
      "Séance exigeante sur machine, six participants maximum. Une pratique régulière est conseillée.",
    descriptionEn:
      "A demanding machine session, six people maximum. Regular practice recommended.",
    lat: 48.857,
    lng: 2.279,
  },
  {
    id: "boxe-montmartre",
    title: "Boxe anglaise, les fondamentaux",
    titleEn: "Boxing, the fundamentals",
    gym: "Uppercut 18",
    category: "boxe",
    basePrice: 26,
    placesLeft: 4,
    startsInHours: 30,
    durationMin: 60,
    address: "9 rue Ramey, 75018 Paris",
    arrondissement: "18e",
    rating: 4.7,
    reviews: 209,
    image: U("photo-1584464491033-06628f3a6b7b"),
    coach: "Malik",
    description:
      "Déplacements, directs, crochets. Beaucoup de shadow et de corde. Gants prêtés sur demande.",
    descriptionEn:
      "Footwork, jabs, hooks. Plenty of shadow boxing and rope. Gloves lent on request.",
    lat: 48.888,
    lng: 2.348,
  },
  {
    id: "hiit-saint-lazare",
    title: "HIIT après le bureau",
    titleEn: "HIIT after the office",
    gym: "Forge Athletic Europe",
    category: "hiit",
    basePrice: 24,
    placesLeft: 2,
    startsInHours: 8,
    durationMin: 45,
    address: "14 rue de Rome, 75008 Paris",
    arrondissement: "8e",
    rating: 4.6,
    reviews: 97,
    image: U("photo-1517836357463-d25dfeac3438"),
    coach: "Julie",
    description:
      "Circuits de six ateliers, deux tours. Vestiaires et douches, serviette fournie.",
    descriptionEn:
      "Six-station circuits, two rounds. Changing rooms and showers, towel provided.",
    lat: 48.877,
    lng: 2.325,
  },
  {
    id: "cycling-bercy",
    title: "Endurance Bercy, longue distance",
    titleEn: "Bercy endurance, long distance",
    gym: "Ride Bercy",
    category: "cycling",
    basePrice: 25,
    placesLeft: 6,
    startsInHours: 28,
    durationMin: 50,
    address: "11 rue de Bercy, 75012 Paris",
    arrondissement: "12e",
    rating: 4.5,
    reviews: 134,
    image: "/categories/cycling.jpg",
    coach: "Antoine",
    description:
      "Rythme régulier, peu de sprints, on tient la durée. Bon premier cours pour découvrir le cycling.",
    descriptionEn:
      "Steady tempo, few sprints, built to last. A good first cycling class.",
    lat: 48.839,
    lng: 2.382,
  },
  {
    id: "yoga-luxembourg",
    title: "Vinyasa du matin",
    titleEn: "Morning Vinyasa",
    gym: "Studio Sattva",
    category: "yoga",
    basePrice: 25,
    placesLeft: 4,
    startsInHours: 22,
    durationMin: 60,
    address: "5 rue Monsieur le Prince, 75006 Paris",
    arrondissement: "6e",
    rating: 4.8,
    reviews: 311,
    image: U("photo-1544367567-0f2fcb009e0b"),
    coach: "Sarah",
    description:
      "Enchaînements fluides pour réveiller le corps, salutations et équilibres. Thé offert après le cours.",
    descriptionEn:
      "Flowing sequences to wake the body, sun salutations and balances. Tea served afterwards.",
    lat: 48.85,
    lng: 2.34,
  },
  {
    id: "pilates-republique",
    title: "Pilates postural, dos et nuque",
    titleEn: "Postural Pilates, back and neck",
    gym: "Core Lab",
    category: "pilates",
    basePrice: 30,
    placesLeft: 3,
    startsInHours: 3.5,
    durationMin: 55,
    address: "7 rue de Turbigo, 75003 Paris",
    arrondissement: "3e",
    rating: 4.8,
    reviews: 188,
    image: U("photo-1518611012118-696072aa579a"),
    coach: "Élodie",
    description:
      "Pensé pour les journées assises : mobilité des hanches, ouverture des épaules, gainage profond.",
    descriptionEn:
      "Built for desk-bound days: hip mobility, shoulder opening, deep core work.",
    lat: 48.865,
    lng: 2.352,
  },
  {
    id: "hiit-gare-du-nord",
    title: "Grind 45, cardio et force",
    titleEn: "Grind 45, cardio and strength",
    gym: "Grind 10",
    category: "hiit",
    basePrice: 19,
    placesLeft: 8,
    startsInHours: 40,
    durationMin: 45,
    address: "31 rue de Dunkerque, 75010 Paris",
    arrondissement: "10e",
    rating: 4.5,
    reviews: 88,
    image: U("photo-1517836357463-d25dfeac3438"),
    coach: "Yanis",
    description:
      "Un tour de cardio, un tour de force, on recommence. Salle neuve, matériel en libre accès.",
    descriptionEn:
      "A cardio round, a strength round, repeat. New gym, equipment freely available.",
    lat: 48.88,
    lng: 2.354,
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
    text: "Profitez des offres, progressez, et notez votre expérience.",
    textEn: "Make the most of the deals, train, and rate your session.",
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
    title: "Virements mensuels",
    titleEn: "Monthly payouts",
    text: "Vous êtes payé chaque mois. L'argent de vos places vendues est reversé à la fin du mois.",
    textEn: "You are paid every month. The money from the places you sell is transferred at month end.",
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
    a: "Le centre utilise FREEFLO pour remplir ses créneaux vides et souhaite vous vendre une place remisée plutôt que la perdre.",
    aEn: "The centre uses FREEFLO to fill its empty slots, and would rather sell you a place at a discount than lose it altogether.",
  },
  {
    q: "Le prix change vraiment en direct ?",
    qEn: "Does the price really change live?",
    a: "Les places partent au rythme des réservations, pas seulement du temps qui passe. Le prix affiché est celui du moment présent : hésiter, c'est risquer de ne plus trouver de place du tout.",
    aEn: "Places go as bookings come in, not just as time ticks by. The price shown is the price right now: hesitate, and you risk finding no place left at all.",
  },
  {
    q: "Que se passe-t-il si j'annule ?",
    qEn: "What happens if I cancel?",
    a: "Oui, gratuitement jusqu'à 6h avant le cours. Passé ce délai, la place vous est définitivement acquise : elle ne peut plus être réattribuée à temps à un autre sportif.",
    aEn: "Yes, free of charge up to 6h before the class. After that the place is definitively yours: it can no longer be passed on to another member in time.",
  },
  {
    q: "Et si le cours est annulé par le centre ?",
    qEn: "And if the centre cancels the class?",
    a: "Remboursement automatique et immédiat, sans démarche à effectuer de votre part. Un signalement en un tap suffit si besoin, les centres qui annulent trop souvent perdent leur place sur FREEFLO.",
    aEn: "An automatic, immediate refund, with nothing for you to do. One tap is enough to report it if needed, and centres that cancel too often lose their place on FREEFLO.",
  },
  {
    q: "C'est réservé à Paris ?",
    qEn: "Is it Paris only?",
    a: "FREEFLO démarre à Paris, avec de nouvelles villes prévues rapidement. Inscrivez-vous pour être averti dès l'arrivée près de chez vous.",
    aEn: "FREEFLO is starting in Paris, with new cities coming soon. Sign up to be told the moment we reach you.",
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

/**
 * Historique de démonstration de l'espace membre.
 *
 * L'onglet « Historique » de « Mes cours » ne peut rien montrer autrement : les
 * réservations naissent dans le navigateur du visiteur, et il faudrait attendre
 * qu'un cours réservé soit réellement passé pour en voir une seule. Cette liste
 * donne à la cliente un historique à regarder dès la première visite.
 *
 * Ce sont des cours du catalogue (`offerId` existants) et les vrais prix
 * pratiqués, pour que l'écran soit cohérent avec le reste du site.
 *
 * `daysAgo` plutôt qu'une date : comme le `startsInHours` des offres, l'écart
 * est RELATIF, donc l'historique reste crédible quelle que soit la date de
 * consultation, et ne se fige pas au jour du build.
 *
 * À supprimer en phase 2 : les vraies réservations passées viendront de la base.
 */
export interface PastCourse {
  offerId: string;
  /** Jours écoulés depuis le cours. */
  daysAgo: number;
  /** Prix réellement payé ce jour-là. */
  price: number;
  ref: string;
}

export const pastCourses: PastCourse[] = [
  { offerId: "hot-yoga-marais", daysAgo: 4, price: 14, ref: "FLO-HOT-3182" },
  { offerId: "the-new-me-pilates", daysAgo: 9, price: 11, ref: "FLO-THE-2740" },
  { offerId: "boxe-republique", daysAgo: 16, price: 13, ref: "FLO-BOX-1955" },
  { offerId: "cycling-bercy", daysAgo: 23, price: 9, ref: "FLO-CYC-1408" },
];
