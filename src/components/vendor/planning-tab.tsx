"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { OfferFormModal } from "@/components/vendor/offer-form-modal";
import { weekDays, type VendorOffer } from "@/components/vendor/vendor-data";
import { useT } from "@/lib/i18n";

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
}: {
  offers: VendorOffer[];
  onPublish: (o: VendorOffer) => void;
}) {
  const t = useT();
  const [day, setDay] = useState(3); // jeudi, comme la maquette
  const [modal, setModal] = useState(false);

  const slots = offers
    .filter((o) => o.day === day)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      <div>
        <p className="eyebrow text-pro-accent">{t("Emploi du temps", "Schedule")}</p>
        <h2 className="pro-display mt-1 text-3xl text-ink">{t("Planning", "Planning")}</h2>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {weekDays.map((d, i) => (
          <button
            key={d.short}
            onClick={() => setDay(i)}
            aria-pressed={day === i}
            className={cn(
              "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border text-sm transition-colors",
              day === i
                ? "border-pro-accent bg-pro-accent text-white"
                : "border-line text-ink-soft hover:border-pro-accent hover:text-pro-accent",
            )}
          >
            <span className="text-[0.7rem]">{d.short}</span>
            <span className="font-medium">{d.date}</span>
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
              <span className="w-16 shrink-0 font-medium tabular-nums text-pro-accent">{o.time}</span>
              <div className="min-w-[10rem] flex-1">
                <p className="font-medium text-ink">{o.title}</p>
                <span className="mt-1 inline-block rounded-full bg-pro-surface px-2 py-0.5 text-xs text-ink-soft">
                  {o.cat}
                </span>
              </div>
              <div className="min-w-[9rem] flex-1">
                <p className="text-sm tabular-nums text-ink-soft">
                  {sold}/{o.capacity} {t("réservées", "booked")}
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                  <div className="h-full rounded-full bg-pro-tan" style={{ width: `${Math.max(4, pct)}%` }} />
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                  full ? "bg-brand-tint text-brand" : "bg-emerald-50 text-emerald-700",
                )}
              >
                {full ? t("Complet", "Full") : `${o.placesLeft} ${t("places restantes", "spots left")}`}
              </span>
            </div>
          );
        })}

        <button
          onClick={() => setModal(true)}
          className="w-full rounded-2xl border border-dashed border-line py-4 text-sm text-ink-soft transition-colors hover:border-pro-accent hover:text-pro-accent"
        >
          + {t("Ajouter un cours à ce jour", "Add a class to this day")}
        </button>
      </div>

      {modal && (
        <OfferFormModal
          mode="create"
          day={day}
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
