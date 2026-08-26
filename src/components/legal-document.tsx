"use client";

import { PageHero } from "@/components/page-hero";
import { useT } from "@/lib/i18n";
import type { LegalSection } from "@/lib/legal";

/** Gabarit partagé par les trois documents légaux (mentions, CGU/CGV, RGPD). */
export function LegalDocument({
  eyebrow,
  eyebrowEn,
  title,
  titleEn,
  sections,
}: {
  eyebrow: string;
  eyebrowEn: string;
  title: string;
  titleEn: string;
  sections: LegalSection[];
}) {
  const t = useT();

  return (
    <>
      <main>
        <PageHero compact eyebrow={t(eyebrow, eyebrowEn)} title={t(title, titleEn)} />
        <section className="ff-container max-w-3xl py-16">
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="display text-2xl text-ink">{t(s.h, s.hEn)}</h2>
                <p className="mt-3 leading-relaxed text-ink-soft">{t(s.p, s.pEn)}</p>
              </div>
            ))}
          </div>
          <p className="mt-14 border-t border-line pt-6 text-sm text-ink-soft">
            {t(
              "Document de démonstration, non contractuel. Dernière mise à jour : 2026.",
              "Demonstration document, not contractual. Last updated: 2026.",
            )}
          </p>
        </section>
      </main>
    </>
  );
}
