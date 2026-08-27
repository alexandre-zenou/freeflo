import type { StoredMember } from "./account";

/**
 * Comptes de démonstration et clé de session, dans un module SANS `"use client"`.
 *
 * Ils vivaient dans `account.tsx`, qui est un module client : un composant
 * serveur ne peut pas y lire une constante, Next n'en exporte que des
 * références. Or la porte de l'accueil (`ProHomeGate`) doit écrire un script
 * bloquant, donc côté serveur, et a besoin de savoir quels comptes relèvent du
 * côté professionnel. D'où ce fichier, qui est la seule définition ; `account`
 * les ré-exporte pour que rien n'ait à changer d'import.
 *
 * `import type` seulement : le type est effacé à la compilation, il n'y a donc
 * aucun cycle à l'exécution entre ce fichier et `account.tsx`.
 */
export const SESSION_KEY = "ff-session";

/**
 * Comptes de test internes. Ils servent à parcourir la partie membre sans rien
 * installer, et restent valables sur la démo en ligne (la cliente peut donc se
 * connecter elle-même). À supprimer le jour où Supabase prend le relais.
 */
export const demoMembers: StoredMember[] = [
  { firstName: "Thomas", lastName: "Durand", email: "demo@freeflo.fr", password: "freeflo", role: "member" },
  { firstName: "Flore", lastName: "Lemaire", email: "flore@freeflo.fr", password: "freeflo", role: "member" },
  /* Le compte d'un centre : son prénom porte le nom du studio, c'est lui qui
     s'affiche dans la barre de navigation une fois connecté. */
  { firstName: "Studio Bloom", lastName: "Paris 4e", email: "centre@freeflo.fr", password: "freeflo-centre", role: "centre" },
  { firstName: "Admin", lastName: "FREEFLO", email: "admin@freeflo.fr", password: "freeflo-admin", role: "admin" },
];

/**
 * Les adresses du côté professionnel, centre et administration.
 *
 * Dérivées de la liste ci-dessus, jamais recopiées : une inscription depuis le
 * site ne crée que des `member` (voir `signUp`), donc ces deux comptes sont les
 * seuls à pouvoir être professionnels, et ajouter un rôle ici suffira.
 */
export const proEmails = demoMembers
  .filter((m) => m.role !== "member")
  .map((m) => m.email.trim().toLowerCase());
