"use client";

import { useState } from "react";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OfferFormModal } from "@/components/vendor/offer-form-modal";
import {
  addDays,
  isoOf,
  mondayOf,
  type CentreScope,
  type VendorOffer,
} from "@/components/vendor/vendor-data";
import { useLocale, useT } from "@/lib/i18n";

/**
 * Emploi du temps hebdomadaire.
 *
 * Retour client : le bouton « Publier un cours » en haut à droite faisait doublon
 * avec « Créer une offre » de l'en-tête du tableau de bord. Il a été retiré ;
 * l'ajout passe par la ligne « Ajouter un cours à ce jour », qui a l'avantage de
 * savoir de quel jour il s'agit. Le formulaire lui-même vit dans
 * `offer-form-modal.tsx`, partagé avec le bouton « Modifier » de Mes offres.
 */
export function PlanningTab({
  offers,
  onPublish,
  centres,
  defaultCentre,
}: {
  offers: VendorOffer[];
  onPublish: (o: VendorOffer) => void;
} & CentreScope) {
  const t = useT();
  const { locale } = useLocale();
  const tag = locale === "en" ? "en-GB" : "fr-FR";
  /* Vraie date du jour, et plus une semaine figée du 14 au 20. Pas de rendu
     serveur ici (l'espace pro n'apparaît qu'une fois connecté), l'heure
     n'existe donc qu'au navigateur. */
  const [today] = useState(() => isoOf(new Date()));
  const [day, setDay] = useState(today);
  const [modal, setModal] = useState(false);

  /* La semaine affichée est celle du jour choisi : les flèches déplacent le
     jour de sept jours, et on avance ainsi dans le mois et au-delà. */
  const weekStart = mondayOf(day);
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const at = (iso: string) => new Date(`${iso}T12:00`);
  const monthLabel = at(day).toLocaleDateString(tag, {
    month: "long",
    year: "numeric",
  });
  const isPast = day < today;

  const slots = offers
    .filter((o) => o.date === day)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      <div>
        <p className="eyebrow text-pro-accent">
          {t("Emploi du temps", "Schedule")}
        </p>
        <h2 className="pro-display mt-1 text-3xl text-ink">
          {t("Planning", "Planning")}
        </h2>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setDay(addDays(day, -7))}
          aria-label={t("Semaine précédente", "Previous week")}
          className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-pro-accent hover:text-pro-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="min-w-[9rem] text-center font-medium text-ink first-letter:uppercase">
          {monthLabel}
        </p>
        <button
          onClick={() => setDay(addDays(day, 7))}
          aria-label={t("Semaine suivante", "Next week")}
          className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-pro-accent hover:text-pro-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {day !== today && (
          <button
            onClick={() => setDay(today)}
            className="rounded-full bg-pro-surface px-3.5 py-1.5 text-sm text-pro-accent transition-colors hover:bg-pro-accent hover:text-white"
          >
            {t("Aujourd'hui", "Today")}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {week.map((iso) => (
          <button
            key={iso}
            onClick={() => setDay(iso)}
            aria-pressed={day === iso}
            className={cn(
              "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border text-sm transition-colors",
              day === iso
                ? "border-pro-accent bg-pro-accent text-white"
                : iso === today
                  ? "border-pro-accent text-pro-accent"
                  : "border-line text-ink-soft hover:border-pro-accent hover:text-pro-accent",
              iso < today && day !== iso && "opacity-50",
            )}
          >
            <span className="text-[0.7rem] uppercase">
              {at(iso)
                .toLocaleDateString(tag, { weekday: "short" })
                .replace(".", "")}
            </span>
            <span className="font-medium">{at(iso).getDate()}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {slots.map((o) => {
          const sold = o.capacity - o.placesLeft;
          const full = o.placesLeft === 0;
          const pct = Math.round((sold / o.capacity) * 100);
          return (
            <div
              key={o.id}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-white p-5 ring-1 ring-line"
            >
              <span className="w-16 shrink-0 font-medium tabular-nums text-pro-accent">
                {o.time}
              </span>
              <div className="min-w-[10rem] flex-1">
                {/* Vue d'administration : ce qui compte est QUEL centre
                    donne le créneau. Le cours passe en second, la catégorie
                    disparaît. Un centre, lui, garde son cours et sa catégorie. */}
                {centres ? (
                  <>
                    <p className="flex items-center gap-1.5 font-medium text-ink">
                      <Building2 className="h-4 w-4 shrink-0 text-pro-accent" />{" "}
                      {o.centre}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-soft">{o.title}</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-ink">{o.title}</p>
                    <span className="mt-1 inline-block rounded-full bg-pro-surface px-2 py-0.5 text-xs text-ink-soft">
                      {o.cat}
                    </span>
                  </>
                )}
              </div>
              <div className="min-w-[9rem] flex-1">
                <p className="text-sm tabular-nums text-ink-soft">
                  {sold}/{o.capacity} {t("réservées", "booked")}
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                  <div
                    className="h-full rounded-full bg-pro-tan"
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                  full
                    ? "bg-brand-tint text-brand"
                    : "bg-emerald-50 text-emerald-700",
                )}
              >
                {full
                  ? t("Complet", "Full")
                  : `${o.placesLeft} ${t("places restantes", "spots left")}`}
              </span>
            </div>
          );
        })}

        {slots.length === 0 && (
          <p className="py-4 text-sm text-ink-soft">
            {t("Aucun cours ce jour-là.", "No class that day.")}
          </p>
        )}

        {/* On ne publie pas un cours dans le passé. */}
        {!isPast && (
          <button
            onClick={() => setModal(true)}
            className="w-full rounded-2xl border border-dashed border-line py-4 text-sm text-ink-soft transition-colors hover:border-pro-accent hover:text-pro-accent"
          >
            + {t("Ajouter un cours à ce jour", "Add a class to this day")}
          </button>
        )}
      </div>

      {modal && (
        <OfferFormModal
          mode="create"
          date={day}
          centres={centres}
          defaultCentre={defaultCentre}
          onClose={() => setModal(false)}
          onSubmit={(o) => {
            onPublish(o);
            setModal(false);
          }}
        />
      )}
    </div>
  );
}
