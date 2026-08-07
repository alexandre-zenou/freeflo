/**
 * Textes légaux, séparés en trois documents.
 *
 * Retour client : « Il ne se passe rien quand je clique sur CGU/CGV et
 * Confidentialité » — les trois liens du pied de page pointaient tous vers
 * `/mentions-legales`. Chacun a désormais sa page.
 *
 * Textes de démonstration : à faire valider par un juriste avant production.
 */

export interface LegalSection {
  h: string;
  hEn: string;
  p: string;
  pEn: string;
}

export const mentionsLegales: LegalSection[] = [
  {
    h: "Éditeur du site",
    hEn: "Site publisher",
    p: "FREEFLO, plateforme de mise en relation entre centres de sport et sportifs. Contenu de démonstration produit par le studio Orvane. Les informations légales définitives (raison sociale, SIRET, siège, hébergeur) seront renseignées avant mise en production.",
    pEn: "FREEFLO, a platform connecting sport centres and people who train. Demonstration content produced by studio Orvane. Final legal details (company name, registration number, registered office, host) will be filled in before going live.",
  },
  {
    h: "Objet de la plateforme",
    hEn: "What the platform does",
    p: "FREEFLO permet aux centres de sport (entités professionnelles) de publier des places de cours invendues à prix réduit, et aux clients de les réserver et payer en ligne. Le prix affiché est recalculé en continu selon la grille de dégressivité tarifaire.",
    pEn: "FREEFLO lets sport centres (registered businesses) publish unsold class places at a reduced price, and lets customers book and pay for them online. The price shown is recalculated continuously against the sliding price grid.",
  },
  {
    h: "Hébergement",
    hEn: "Hosting",
    p: "Le site est hébergé sur une infrastructure située dans l'Union européenne. Les coordonnées complètes de l'hébergeur seront précisées avant mise en production.",
    pEn: "The site is hosted on infrastructure located in the European Union. Full details of the host will be given before going live.",
  },
  {
    h: "Responsabilité",
    hEn: "Liability",
    p: "FREEFLO agit comme intermédiaire technique. La bonne exécution du cours, la sécurité et les assurances (RC pro) relèvent du centre de sport. Une clause de non-responsabilité en cas de blessure sera validée par un juriste avant production.",
    pEn: "FREEFLO acts as a technical intermediary. Running the class safely, and holding the relevant insurance, is the sport centre's responsibility. An injury liability clause will be reviewed by a lawyer before going live.",
  },
  {
    h: "Propriété intellectuelle",
    hEn: "Intellectual property",
    p: "La marque, le logo et les contenus éditoriaux de FREEFLO sont protégés. Les visuels et descriptifs publiés par un centre restent la propriété de ce centre, qui en garantit les droits d'usage.",
    pEn: "The FREEFLO name, logo and editorial content are protected. Images and descriptions published by a centre remain that centre's property, and the centre warrants it holds the rights to use them.",
  },
];

export const cgu: LegalSection[] = [
  {
    h: "Réservation et paiement",
    hEn: "Booking and payment",
    p: "La réservation est validée après confirmation du paiement. Le prix affiché au moment de la réservation est celui qui est facturé : il ne bouge plus une fois la place bloquée, même si l'offre continue de vivre.",
    pEn: "A booking is confirmed once payment goes through. The price shown when you book is the price charged: it does not move again once the place is held, even if the offer keeps running.",
  },
  {
    h: "Annulation par le client",
    hEn: "Cancelling as a customer",
    p: "Annulation avec remboursement intégral jusqu'à 6 h avant le créneau. Au-delà, la place est due : elle vous reste réservée mais n'est plus remboursable.",
    pEn: "Full refund if you cancel more than 6 hours before the class. After that, the place is due: it stays reserved for you but is no longer refundable.",
  },
  {
    h: "Annulation par le centre",
    hEn: "Cancelling by the centre",
    p: "En cas de cours annulé par le centre, le remboursement est automatique et intégral, sans démarche de votre part. Vous pouvez signaler l'incident depuis votre compte.",
    pEn: "If the centre cancels the class, the refund is automatic and in full, with nothing to do on your side. You can report the incident from your account.",
  },
  {
    h: "Accès au cours",
    hEn: "Getting into the class",
    p: "Vous confirmez votre identité à l'accueil du centre au créneau indiqué. Le centre peut refuser l'accès si les conditions de pratique annoncées (niveau, équipement, âge minimum) ne sont pas remplies.",
    pEn: "You confirm your name at the centre's front desk at the time booked. The centre may refuse entry if the stated conditions (level, equipment, minimum age) are not met.",
  },
  {
    h: "Centres partenaires",
    hEn: "Partner centres",
    p: "Aucun abonnement. Une commission dégressive est prélevée sur chaque vente. Les reversements sont effectués quotidiennement sur l'IBAN vérifié du centre. L'activation d'un compte est conditionnée à la vérification du SIRET et de l'IBAN.",
    pEn: "No subscription. A sliding commission is taken on each sale. Payouts are made daily to the centre's verified bank account. Activating an account requires verification of the business and bank details.",
  },
  {
    h: "Paiement",
    hEn: "Payment",
    p: "Les paiements sont traités par Stripe. FREEFLO ne stocke aucune donnée de carte bancaire. (Version de démonstration : aucun paiement réel n'est traité.)",
    pEn: "Payments are handled by Stripe. FREEFLO stores no card details. (Demonstration version: no real payment is processed.)",
  },
];

export const confidentialite: LegalSection[] = [
  {
    h: "Données collectées",
    hEn: "What we collect",
    p: "Compte : nom, adresse e-mail, téléphone. Réservations : cours réservés, créneaux, montants. Aucune donnée de carte bancaire n'est stockée par FREEFLO, elles sont traitées directement par Stripe.",
    pEn: "Account: name, email address, phone number. Bookings: classes booked, times, amounts. No card details are stored by FREEFLO, they are handled directly by Stripe.",
  },
  {
    h: "Géolocalisation",
    hEn: "Location",
    p: "Votre position ne sert qu'à afficher les cours proches de vous, au moment où vous cherchez. Elle n'est pas conservée sans votre consentement et n'est jamais transmise aux centres.",
    pEn: "Your position is used only to show classes near you, at the moment you search. It is not kept without your consent and is never passed on to centres.",
  },
  {
    h: "Finalités",
    hEn: "Why we use it",
    p: "Les données servent à traiter vos réservations, à vous en envoyer la confirmation, et à assurer le service client. Aucune revente à des tiers. Les communications commerciales sont soumises à un consentement séparé, révocable à tout moment.",
    pEn: "The data is used to process your bookings, send you confirmations, and run customer support. Nothing is sold to third parties. Marketing messages require separate consent, which you can withdraw at any time.",
  },
  {
    h: "Vos droits",
    hEn: "Your rights",
    p: "Consentement explicite au traitement, droit d'accès, de rectification, d'opposition et à l'effacement. Export de vos données personnelles sur simple demande. Écrivez à hello@freeflo.fr pour exercer ces droits.",
    pEn: "Explicit consent to processing, and the right to access, correct, object to and erase your data. Export of your personal data on request. Write to hello@freeflo.fr to exercise these rights.",
  },
  {
    h: "Conservation",
    hEn: "How long we keep it",
    p: "Les données de compte sont conservées tant que le compte est actif, puis supprimées. Les pièces comptables liées aux paiements sont conservées le temps imposé par la loi.",
    pEn: "Account data is kept while the account is active, then deleted. Accounting records tied to payments are kept for the period the law requires.",
  },
  {
    h: "Cookies",
    hEn: "Cookies",
    p: "Seuls les cookies nécessaires au fonctionnement du site sont déposés par défaut. Les cookies de mesure d'audience sont soumis à votre accord et refusables sans dégrader le service.",
    pEn: "Only the cookies needed to run the site are set by default. Analytics cookies require your agreement and can be refused without degrading the service.",
  },
];
