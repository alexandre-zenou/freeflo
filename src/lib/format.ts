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
export function formatCountdown(hoursBefore: number): string {
  if (hoursBefore <= 0) return "maintenant";
  const totalMin = Math.round(hoursBefore * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

/** Créneau à partir d'un décalage en heures : « aujourd'hui 15:00 ». */
export function slotLabel(startsInHours: number, now: number = Date.now()): string {
  const d = new Date(now + startsInHours * 3_600_000);
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const isToday = d.toDateString() === new Date(now).toDateString();
  const tomorrow = new Date(now + 86_400_000);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const day = isToday ? "Aujourd'hui" : isTomorrow ? "Demain" : d.toLocaleDateString("fr-FR", { weekday: "long" });
  return `${day} ${time}`;
}
