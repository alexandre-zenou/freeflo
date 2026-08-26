"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { OfferCard } from "@/components/offer-card";
import { offers } from "@/lib/site";
import { dayDateLabel, isThisWeek } from "@/lib/format";
import { useHydrated } from "@/lib/account";
import { useLocale, useT } from "@/lib/i18n";

/**
 * Bandeau « RÉSERVEZ MAINTENANT » de la maquette : fond rouge profond,
 * titre capitales + rappel de rareté, lien fantôme à droite, cartes blanches.
 */
export function LiveOffers() {
  const t = useT();
  const { locale } = useLocale();

  /*
    Les créneaux de la SEMAINE EN COURS, du lundi au dimanche.

    La fenêtre est calendaire, donc elle exige une `Date` : or cette page est
    prégénérée au build, et le jour de la semaine y est celui de la compilation,
    pas celui de la visite. On attend donc l'hydratation pour l'appliquer.

    Avant hydratation, on affiche les sept prochains jours, calculés sur le seul
    `startsInHours`. C'est un sur-ensemble : le HTML statique et le premier rendu
    du navigateur sont identiques, l'hydratation ne diverge pas, et la liste ne
    fait que se resserrer ensuite.

    Tri inchangé, par échéance : la place qui part le plus vite d'abord, qui est
    aussi celle dont le prix a le plus fondu.
  */
  const hydrated = useHydrated();
  const shown = offers
    .filter((o) => (hydrated ? isThisWeek(o.startsInHours) : o.startsInHours <= 168))
    .sort((a, b) => a.startsInHours - b.startsInHours)
    .slice(0, 4);

  /* Aucun créneau cette semaine : on retire le bandeau plutôt que d'afficher
     un titre rouge suivi d'une grille vide, qui se lirait comme une panne. */
  if (shown.length === 0) return null;

  return (
    /*
      Retour client : « Remplir la largeur de la page avec les 4 cases, laisser 1 cm
      de chaque côté. » On sort donc du `ff-container` (max 1240 px) pour un bandeau
      pleine largeur, avec une gouttière de 1 cm exactement au-delà du mobile.
    */
    <section className="bg-brand-deep py-16 md:py-20">
      <div className="mx-auto w-full px-5 md:px-[1cm]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="display text-[clamp(1.9rem,3.6vw,2.8rem)] uppercase text-white">
              {t("Nos bons plans de la semaine", "Our deals of the week")}
            </h2>
            <p className="mt-2 text-lg text-white/90">
              {t(
                "Les places s'écoulent vite, et sont limitées.",
                "Spots go fast, and there aren't many.",
              )}
            </p>
          </div>
          <Link
            href="/offres"
            className="inline-flex items-center gap-3 rounded-full border border-white/50 px-6 py-3 text-sm text-white underline-offset-4 transition-colors hover:bg-white hover:text-brand-deep"
          >
            {t("Voir toutes les offres", "See all offers")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Reveal stagger={0.1} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((o) => (
            <OfferCard
              key={o.id}
              offer={o}
              dense
              showDistrict={false}
              /* La date n'est produite qu'une fois hydraté, pour la même raison
                 que le filtre : elle n'existe pas au rendu statique. */
              dateLabel={hydrated ? dayDateLabel(o.startsInHours, locale) : undefined}
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
