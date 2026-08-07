"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { steps } from "@/lib/site";
import { useT } from "@/lib/i18n";

/** Les trois convictions : textes 1 et 3 réécrits par la cliente (retour 08/2026). */
const convictions = [
  {
    title: "Le sport sans contraintes",
    titleEn: "Training without the strings",
    text: "Une envie de bouger, là, maintenant ? FREEFLO offre des créneaux disponibles dans l'instant, près de chez vous.",
    textEn: "Feel like moving, right now? FREEFLO opens up classes available this minute, close to you.",
  },
  {
    title: "Le sport sans abonnement",
    titleEn: "Training without a membership",
    text: "Pas d'engagement, pas de carte à l'année. On réserve une séance quand on en a envie, au prix du moment, près de chez soi.",
    textEn: "No commitment, no yearly pass. You book a session when you want one, at the price of the moment, near you.",
  },
  {
    title: "Le sport accessible",
    titleEn: "Training within reach",
    text: "Réservez en quelques clics. Le sport n'a jamais été aussi facile d'accès et abordable.",
    textEn: "Book in a few taps. Training has never been this easy to reach, or this affordable.",
  },
];

export function QuiSommesNousContent() {
  const t = useT();

  return (
    <>
      <PageHero
        eyebrow={t("Qui sommes nous ?", "Who we are")}
        title={t(
          "La plateforme qui remplit les salles et fait bouger les gens",
          "The platform that fills the studios and gets people moving",
        )}
        intro={t(
          "FREEFLO est né d'un constat simple : chaque jour, des milliers de places de cours sont vides tandis que des sportifs renoncent faute de budget. FREEFLO est la solution qui permet de résoudre ces deux problématiques en proposant les créneaux vides à prix réduit, en dernière minute.",
          "FREEFLO started from a simple observation: every day, thousands of class places sit empty while people give up on training because of the cost. FREEFLO solves both at once, by offering those empty slots at a reduced price, at the last minute.",
        )}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="gold">
            <Link href="/offres">
              {t("Trouver mon cours de sport", "Find my class")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghostline">
            <Link href="/inscrire-son-centre">{t("Je gère un centre", "I run a centre")}</Link>
          </Button>
        </div>
      </PageHero>

      <section className="ff-container py-20 md:py-24">
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-3">
          {convictions.map((c) => (
            <div key={c.title} className="border-t border-brand/25 pt-5">
              <h2 className="display text-xl text-brand">{t(c.title, c.titleEn)}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{t(c.text, c.textEn)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-deep py-20 text-white md:py-24">
        <div className="ff-container">
          <h2 className="display text-[clamp(1.75rem,3.4vw,2.6rem)] uppercase">
            {t("Comment ça fonctionne", "How it works")}
          </h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n}>
                <h3 className="display text-2xl text-gold">
                  {s.n}. {t(s.title, s.titleEn)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/85">{t(s.text, s.textEn)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
