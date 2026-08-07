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
