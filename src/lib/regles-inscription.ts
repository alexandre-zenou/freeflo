/**
 * Règles d'inscription, partagées entre le formulaire et le serveur.
 *
 * Une SEULE définition : le formulaire les affiche pour guider, le serveur les
 * applique pour de bon. Recopier la valeur à deux endroits finirait tôt ou tard
 * par un formulaire qui accepte ce que le serveur refuse.
 *
 * Module sans `"use client"`, lisible des deux côtés.
 */

/** Plus exigeant que les 6 caractères par défaut de Supabase : un compte de
 *  centre gérera des créneaux, des réservations, et plus tard des versements. */
export const MOT_DE_PASSE_MIN_CENTRE = 10;

/** Un SIRET compte 14 chiffres. Les espaces de saisie sont retirés avant. */
export const normaliserSiret = (s: string) => s.replace(/\s+/g, "");
export const siretValide = (s: string) => /^[0-9]{14}$/.test(normaliserSiret(s));
