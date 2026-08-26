"use client";

import { useState } from "react";
import { CalendarClock, Plus, Trash2, User } from "lucide-react";
import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_DURATIONS,
  APPOINTMENT_TYPES,
  weekDays,
  type VendorAppointment,
} from "@/components/vendor/vendor-data";
import { useT } from "@/lib/i18n";

/**
 * Onglet « Rendez-vous » de l'espace pro.
 *
 * Le centre y pose les créneaux qu'il vend en tête à tête, à côté de ses cours
 * collectifs : un type, un jour, une heure, une durée, un prix. Un rendez-vous
 * ne vaut que pour une personne, il n'a donc ni jauge de places ni prix qui
 * fond. Une fois pris, le créneau porte le nom du client et ne peut plus être
 * retiré : c'est un engagement, pas une case à décocher.
 *
 * Phase 1 : la liste vit dans l'état de la démo, comme les offres.
 */
const JOURS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const JOURS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const fieldCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-pro-accent";

export function AppointmentsTab({
  appointments,
  onAdd,
  onRemove,
}: {
  appointments: VendorAppointment[];
  onAdd: (rdv: VendorAppointment) => void;
  onRemove: (id: string) => void;
}) {
  const t = useT();
  const [kind, setKind] = useState(0);
  const [coach, setCoach] = useState("");
  const [day, setDay] = useState(2);
  const [time, setTime] = useState("09:00");
  const [durationMin, setDurationMin] = useState(60);
  const [price, setPrice] = useState(45);
  const [error, setError] = useState<string | null>(null);

  /* Tri à l'affichage seulement : la liste garde son ordre d'ajout, mais le
     centre lit sa semaine dans l'ordre où il la vit. */
  const listeTriee = [...appointments].sort((a, b) =>
    a.day === b.day ? a.time.localeCompare(b.time) : a.day - b.day,
  );

  const ajouter = () => {
    if (price <= 0) return setError(t("Le tarif doit être positif.", "The price must be positive."));
    const type = APPOINTMENT_TYPES[kind];
    setError(null);
    onAdd({
      id: `rdv-${day}-${time}-${appointments.length}`,
      kind: type.fr,
      kindEn: type.en,
      coach: coach.trim() || undefined,
      day,
      time,
      durationMin,
      price,
    });
    setCoach("");
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
        <div className="border-b border-line px-5 py-4">
          <h2 className="pro-display text-xl text-ink">{t("Vos rendez-vous", "Your appointments")}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {t(
              "Le temps que vous recevez en tête à tête : coaching, essai, bilan. Une personne par créneau.",
              "The time you give one to one: coaching, trial, assessment. One person per slot.",
            )}
          </p>
        </div>

        {listeTriee.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-soft">
            {t(
              "Aucun rendez-vous pour l'instant. Ajoutez votre premier créneau ci-dessous.",
              "No appointment yet. Add your first slot below.",
            )}
          </p>
        ) : (
          listeTriee.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-5 py-4 last:border-0"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pro-surface text-pro-accent">
                <CalendarClock className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink">{t(r.kind, r.kindEn)}</span>
                <span className="block text-sm tabular-nums text-ink-soft">
                  {t(JOURS_FR[r.day], JOURS_EN[r.day])} {weekDays[r.day].date}, {r.time}, {r.durationMin} min
                  {r.coach ? `, ${r.coach}` : ""}
                </span>
              </span>

              {r.bookedBy ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-pro-surface px-3 py-1 text-xs font-medium text-pro-accent">
                  <User className="h-3.5 w-3.5" /> {t("Pris par", "Taken by")} {r.bookedBy}
                </span>
              ) : (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-ink-soft">
                  {t("Libre", "Open")}
                </span>
              )}

              <span className="w-20 shrink-0 text-right text-sm font-medium tabular-nums text-ink">
                {formatEuro(r.price)}
              </span>

              {/* Un créneau déjà pris n'est pas retirable : la place appartient
                  au client, l'annuler se fait depuis Réservations. */}
              <button
                onClick={() => onRemove(r.id)}
                disabled={Boolean(r.bookedBy)}
                aria-label={t("Retirer le rendez-vous", "Remove appointment")}
                title={
                  r.bookedBy
                    ? t("Ce rendez-vous est réservé", "This appointment is booked")
                    : t("Retirer le rendez-vous", "Remove appointment")
                }
                className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-ink-soft transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-ink-soft"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-line">
        <h3 className="pro-display text-lg text-ink">{t("Mettre un rendez-vous", "Add an appointment")}</h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink">{t("Type", "Type")}</span>
            <select value={kind} onChange={(e) => setKind(Number(e.target.value))} className={fieldCls}>
              {APPOINTMENT_TYPES.map((o, i) => (
                <option key={o.fr} value={i}>
                  {t(o.fr, o.en)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink">{t("Jour", "Day")}</span>
            <select value={day} onChange={(e) => setDay(Number(e.target.value))} className={fieldCls}>
              {weekDays.map((d, i) => (
                <option key={d.short} value={i}>
                  {t(JOURS_FR[i], JOURS_EN[i])} {d.date}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink">{t("Heure", "Time")}</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldCls} />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink">{t("Durée", "Duration")}</span>
            <select
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className={fieldCls}
            >
              {APPOINTMENT_DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink">{t("Tarif (€)", "Price (€)")}</span>
            <input
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(Math.max(1, Number(e.target.value)))}
              className={cn(fieldCls, "tabular-nums")}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink">
              {t("Coach", "Coach")}{" "}
              <span className="font-normal text-ink-soft">{t("(facultatif)", "(optional)")}</span>
            </span>
            <input value={coach} onChange={(e) => setCoach(e.target.value)} placeholder="Camille" className={fieldCls} />
          </label>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-brand">{error}</p>}

        <button
          onClick={ajouter}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-pro-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-deep"
        >
          <Plus className="h-4 w-4" /> {t("Ajouter le rendez-vous", "Add the appointment")}
        </button>
      </div>
    </div>
  );
}
