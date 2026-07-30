"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { faq } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="ff-container py-24 md:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading eyebrow="Questions fréquentes" title={<>Tout est<br />limpide.</>} />
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
                  <span
                    className={cn(
                      "serif-em w-8 shrink-0 text-lg transition-colors duration-300",
                      isOpen ? "text-brand" : "text-ink/40",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "display flex-1 text-xl leading-snug transition-colors duration-300 sm:text-2xl",
                      isOpen ? "text-brand" : "text-ink group-hover:text-brand",
                    )}
                  >
                    {item.q}
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
                  <p className="min-h-0 max-w-xl pl-[3.25rem] leading-relaxed text-ink-soft">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
