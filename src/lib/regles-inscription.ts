/**
 * Règles d'inscription, partagées entre le formulaire et le serveur.
 *
 * Une SEULE définition : le formulaire les affiche pour guider, le serveur les
 * applique pour de bon. Recopier la valeur à deux endroits finirait tôt ou tard
 * par un formulaire qui accepte ce que le serveur refuse.
 *
 * Module sans `"use client"`, lisible des deux côtés.
 */

/** Longueur minimale d'un NOUVEAU mot de passe, au-delà des 6 caractères par
 *  défaut de Supabase. S'applique aux centres et à toute réinitialisation. */
export const MOT_DE_PASSE_MIN = 10;

/** Un compte de centre gérera des créneaux, des réservations, et plus tard des
 *  versements : même exigence, nommée pour être lisible là où elle sert. */
export const MOT_DE_PASSE_MIN_CENTRE = MOT_DE_PASSE_MIN;

/**
 * SIRET : FACULTATIF depuis le 23/09/2026, la confirmation par e-mail suffisant
 * à ouvrir un espace centre. Il reste demandé parce qu'il resservira pour la
 * facturation et pour Stripe Connect.
 *
 * Vide est donc accepté. Renseigné, il doit être juste : un SIRET à moitié
 * saisi vaut moins que pas de SIRET du tout, on le découvrirait à la
 * facturation. Les espaces de saisie sont retirés avant contrôle.
 */
export const normaliserSiret = (s: string) => s.replace(/\s+/g, "");
export const siretValide = (s: string) => {
  const n = normaliserSiret(s);
  return n === "" || /^[0-9]{14}$/.test(n);
};
