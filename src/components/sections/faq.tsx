"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { faq } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="ff-container py-24 md:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading eyebrow="Questions fréquentes" title={<>Tout est<br />limpide.</>} />
        <div className="divide-y divide-line border-y border-line">
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-medium text-ink">{item.q}</span>
                  <Plus className={cn("h-5 w-5 shrink-0 text-peri-deep transition-transform duration-300", isOpen && "rotate-45")} />
                </button>
                <div
                  className={cn(
                    "grid overflow-hidden transition-all duration-300",
                    isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]",
                  )}
                >
                  <p className="min-h-0 max-w-xl text-ink-soft">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
