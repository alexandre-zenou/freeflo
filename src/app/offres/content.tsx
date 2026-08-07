"use client";

import { useT } from "@/lib/i18n";

export function OffresIntro() {
  const t = useT();
  return (
    <div className="ff-container pt-8">
      <p className="eyebrow mb-3 text-brand">{t("Paris, rayon 3 km", "Paris, 3 km radius")}</p>
      <h1 className="display text-4xl text-ink sm:text-5xl">
        {t("Ça se libère autour de vous.", "Places are opening up around you.")}
      </h1>
      <p className="mt-3 max-w-xl text-lg text-ink-soft">
        {t("Faites du sport à des prix imbattables.", "Train at prices you won't beat.")}
      </p>
      <p className="mt-2 max-w-xl text-ink-soft">
        {t(
          "Réservez votre cours dès maintenant, les places n'attendent pas !",
          "Book your class now, these places won't wait!",
        )}
      </p>
    </div>
  );
}
