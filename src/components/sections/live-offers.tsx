"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealLines } from "@/components/reveal";
import { OfferCard } from "@/components/offer-card";
import { offers } from "@/lib/site";
import { useT } from "@/lib/i18n";

/**
 * Bandeau « RÉSERVEZ MAINTENANT » de la maquette : fond rouge profond,
 * titre capitales + rappel de rareté, lien fantôme à droite, cartes blanches.
 */
export function LiveOffers() {
  const shown = offers.slice(0, 4);
  const t = useT();

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
            <RevealLines className="display text-[clamp(1.9rem,3.6vw,2.8rem)] uppercase text-white">
              {t("Réservez maintenant", "Book now")}
            </RevealLines>
            <p className="mt-2 text-lg text-white/90">
              {t(
                "Les places s'écoulent vite, et sont limitées !",
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
            <OfferCard key={o.id} offer={o} dense />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
