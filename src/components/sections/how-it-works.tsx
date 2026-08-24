"use client";

import { Reveal, RevealLines } from "@/components/reveal";
import { steps } from "@/lib/site";
import { useT } from "@/lib/i18n";

/**
 * Promesse + parcours en 4 temps, exactement comme la maquette cliente :
 * accroche en gras italique rouge, puis les quatre étapes alignées, centrées.
 */
export function HowItWorks() {
  const t = useT();

  return (
    <section className="ff-container pb-12 pt-16 md:pb-20 md:pt-20">
      <RevealLines className="display-italic mx-auto max-w-4xl text-balance text-center text-[clamp(1.75rem,4.2vw,3.1rem)] text-brand">
        {t(
          "Réservez vos séances de sport, sans abonnement, à coût moindre près de chez vous",
          "Book your sport sessions, no membership, for less, right next door",
        )}
      </RevealLines>

      <Reveal stagger={0.1} className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="text-center">
            <h3 className="display text-2xl text-brand sm:text-[1.7rem]">
              {s.n}. {t(s.title, s.titleEn)}
            </h3>
            <p className="mx-auto mt-4 max-w-[30ch] text-sm leading-relaxed text-brand/85">
              {t(s.text, s.textEn)}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
