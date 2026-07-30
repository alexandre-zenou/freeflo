"use client";

import { nav } from "@/lib/site";
import { useLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** FR | EN de la maquette cliente. */
export function LocaleSwitch({ onDark = false }: { onDark?: boolean }) {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Langue">
      {nav.locales.map((l) => {
        const active = locale === l.code;
        return (
          <button
            key={l.code}
            onClick={() => setLocale(l.code as Locale)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2 py-1 text-sm transition-colors",
              active
                ? onDark
                  ? "font-semibold text-white"
                  : "font-semibold text-brand"
                : onDark
                  ? "text-white/60 hover:text-white"
                  : "text-ink-soft hover:text-ink",
            )}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
