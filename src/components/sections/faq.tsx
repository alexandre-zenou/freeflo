"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { faq } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function Faq() {
  const t = useT();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="ff-container py-24 md:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          eyebrow={t("Questions fréquentes", "Frequently asked")}
          title={t("Tout est limpide.", "All perfectly clear.")}
        />
        <div>
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-t border-ink/20 last:border-b last:border-b-ink/20">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-baseline gap-5 py-6 text-left"
                  aria-expanded={isOpen}
                >
                  {/*
                    Numéro à la même taille que la question (text-xl sm:text-2xl),
                    en or. `gold-deep` et non `gold` : l'or clair sur le fond crème
                    tombe à 1,5:1, le numéro disparaîtrait au lieu de ressortir.
                  */}
                  <span
                    className="accent-em w-8 shrink-0 text-xl leading-snug text-gold-deep sm:text-2xl"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "display flex-1 text-xl leading-snug transition-colors duration-300 sm:text-2xl",
                      isOpen ? "text-brand" : "text-ink group-hover:text-brand",
                    )}
                  >
                    {t(item.q, item.qEn)}
                  </span>
                  {/* thin drawn +/− affordance — the vertical stroke collapses when open */}
                  <span aria-hidden className="relative h-4 w-4 shrink-0 self-center">
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-px w-full -translate-y-1/2 transition-colors duration-300",
                        isOpen ? "bg-brand" : "bg-ink",
                      )}
                    />
                    <span
                      className={cn(
                        "absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink transition-transform duration-300",
                        isOpen && "scale-y-0",
                      )}
                    />
                  </span>
                </button>
                <div
                  className={cn(
                    "grid overflow-hidden transition-all duration-300",
                    isOpen ? "grid-rows-[1fr] pb-7" : "grid-rows-[0fr]",
                  )}
                >
                  <p className="min-h-0 max-w-xl pl-[3.25rem] leading-relaxed text-ink-soft">{t(item.a, item.aEn)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
