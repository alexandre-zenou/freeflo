"use client";

/**
 * Disponibilités de rappel choisies par un centre après sa demande d'inscription.
 *
 * Phase 1, pas de backend : la demande n'est envoyée nulle part, et ces créneaux
 * sont donc gardés dans le navigateur. Ce n'est pas une boîte de réception pour
 * l'équipe commerciale, et il ne faut pas le présenter comme telle. En phase 2,
 * `save` deviendra l'appel qui joint ces créneaux à la demande côté serveur
 * (`docs/ARCHITECTURE.md`), et le reste du code n'aura pas à bouger.
 */

const KEY = "ff-callback-slots";

export interface CallbackSlot {
  /** Jour au format `AAAA-MM-JJ`, comparable et triable tel quel. */
  day: string;
  /** Début du créneau, `HH:MM`. */
  start: string;
  /** Fin du créneau, `HH:MM`. */
  end: string;
}

export interface CallbackRequest {
  /** Référence lisible, donnée au centre à l'écran. */
  ref: string;
  /** Horodatage de l'enregistrement. */
  at: number;
  slots: CallbackSlot[];
}

/** Clé d'un créneau, pour la sélection comme pour le dédoublonnage. */
export const slotKey = (s: CallbackSlot) => `${s.day} ${s.start}`;

/**
 * Référence de la demande. Dérivée de l'horodatage plutôt que tirée au hasard :
 * deux demandes de la même seconde sont impossibles ici, et une valeur
 * reproductible se rejoue en test.
 */
export function requestRef(at: number): string {
  return `FLO-PRO-${at.toString(36).slice(-6).toUpperCase()}`;
}

export function save(slots: CallbackSlot[], at: number = Date.now()): CallbackRequest {
  const request: CallbackRequest = { ref: requestRef(at), at, slots };
  try {
    const all = read();
    all.push(request);
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* Stockage indisponible : la demande vit le temps de la visite. L'écran de
       remerciement s'affiche quand même, il ne dépend pas de l'écriture. */
  }
  return request;
}

export function read(): CallbackRequest[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CallbackRequest[]) : [];
  } catch {
    return [];
  }
}
