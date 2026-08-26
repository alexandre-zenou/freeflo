import type { Locale } from "@/lib/i18n";

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatEuro(n: number): string {
  return euro.format(n);
}

/** Compte à rebours court : « 1 h 30 », « 45 min », « maintenant ». */
export function formatCountdown(hoursBefore: number, locale: Locale = "fr"): string {
  if (hoursBefore <= 0) return locale === "en" ? "now" : "maintenant";
  const totalMin = Math.round(hoursBefore * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

/**
 * Créneau à partir d'un décalage en heures : « Aujourd'hui 15:00 ».
 *
 * Prend la locale en argument : ce libellé apparaît sur la fiche offre et dans le
 * parcours de réservation, il doit suivre le sélecteur FR/EN.
 */
/**
 * L'heure seule d'un créneau, sans le jour : « 18:30 ».
 *
 * Même mécanique que `slotLabel`, et pour la même raison : `Date.now()` est
 * pris en valeur par défaut d'argument, donc l'impureté reste ici et non dans
 * le rendu d'un composant. À n'appeler qu'après hydratation, l'heure n'existant
 * pas au rendu serveur.
 */
export function timeLabel(
  startsInHours: number,
  locale: Locale = "fr",
  now: number = Date.now(),
): string {
  return new Date(now + startsInHours * 3_600_000).toLocaleTimeString(
    locale === "en" ? "en-GB" : "fr-FR",
    { hour: "2-digit", minute: "2-digit" },
  );
}

/**
 * Jour calendaire d'un créneau, `AAAA-MM-JJ` : comparable et triable tel quel.
 *
 * `Date.now()` en valeur par défaut d'argument, comme les autres helpers de
 * date de ce fichier : l'impureté reste ici et non dans le rendu d'un composant.
 */
export function dayIso(startsInHours: number, now: number = Date.now()): string {
  const d = new Date(now + startsInHours * 3_600_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Libellé court d'un jour ISO : « Mer. 27 août ». */
export function isoDayLabel(iso: string, locale: Locale = "fr"): string {
  const brut = new Date(`${iso}T12:00`).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return brut.charAt(0).toUpperCase() + brut.slice(1);
}

/**
 * Le créneau tombe-t-il dans la semaine EN COURS, du lundi au dimanche ?
 *
 * Semaine calendaire, et non « les sept prochains jours » : un cours de mardi
 * prochain n'est pas un bon plan de cette semaine-ci. Le lundi est le premier
 * jour, convention française ; `getDay()` renvoyant 0 pour dimanche, on le
 * ramène en fin de semaine.
 *
 * `Date.now()` est en valeur par défaut d'argument, comme pour `slotLabel` :
 * l'impureté reste ici et non dans le rendu d'un composant.
 */
export function isThisWeek(startsInHours: number, now: number = Date.now()): boolean {
  const creneau = new Date(now + startsInHours * 3_600_000);

  const lundi = new Date(now);
  const jour = (lundi.getDay() + 6) % 7; // 0 = lundi
  lundi.setDate(lundi.getDate() - jour);
  lundi.setHours(0, 0, 0, 0);

  const dimancheSoir = new Date(lundi);
  dimancheSoir.setDate(dimancheSoir.getDate() + 7);

  return creneau >= lundi && creneau < dimancheSoir;
}

/**
 * Jour et date courte d'un créneau : « Mer. 27/08 ».
 *
 * Format compact et non « Mercredi 27 août » : la pastille des places libres
 * occupe déjà le coin opposé de la photo, et la version longue passait à la
 * ligne sur les cartes du bandeau. À n'appeler qu'après hydratation.
 */
export function dayDateLabel(
  startsInHours: number,
  locale: Locale = "fr",
  now: number = Date.now(),
): string {
  const d = new Date(now + startsInHours * 3_600_000);
  const brut = d.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
  /* `fr-FR` rend « mer. 27/08 » : la majuscule initiale manque, et elle compte
     sur un badge isolé qui ne suit aucune phrase. */
  return brut.charAt(0).toUpperCase() + brut.slice(1);
}

export function slotLabel(
  startsInHours: number,
  locale: Locale = "fr",
  now: number = Date.now(),
): string {
  const tag = locale === "en" ? "en-GB" : "fr-FR";
  const d = new Date(now + startsInHours * 3_600_000);
  const time = d.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit" });
  const isToday = d.toDateString() === new Date(now).toDateString();
  const tomorrow = new Date(now + 86_400_000);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const day = isToday
    ? locale === "en"
      ? "Today"
      : "Aujourd'hui"
    : isTomorrow
      ? locale === "en"
        ? "Tomorrow"
        : "Demain"
      : d.toLocaleDateString(tag, { weekday: "long" });
  return `${day} ${time}`;
}

/**
 * Date d'un cours PASSÉ, à partir d'un nombre de jours écoulés.
 *
 * Miroir de `dayDateLabel`, dans l'autre sens : l'historique de démonstration
 * porte des écarts relatifs (`daysAgo`), pour la même raison que les offres
 * portent `startsInHours`. Une date figée dans les données vieillirait, et
 * l'historique finirait par annoncer des cours d'il y a deux ans.
 */
export function daysAgoLabel(
  daysAgo: number,
  locale: Locale = "fr",
  now: number = Date.now(),
): string {
  const d = new Date(now - daysAgo * 86_400_000);
  const brut = d.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return brut.charAt(0).toUpperCase() + brut.slice(1);
}
