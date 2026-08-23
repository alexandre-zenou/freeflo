"use client";

import { CentreSearch } from "@/components/vendor/centre-search";
import { useT } from "@/lib/i18n";

export function InscriptionCentreContent() {
  const t = useT();
  return (
    <div className="ff-container flex min-h-[calc(100dvh-6rem)] flex-col justify-center py-16">
      <div className="mx-auto w-full max-w-xl text-center">
        <h1 className="display text-[clamp(2rem,5vw,3.25rem)] text-white">
          {t("Inscrivez votre centre de sport.", "Sign up your sport centre.")}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-white/90">
          {t(
            "Inscrivez votre centre de sport en quelques minutes et remplissez vos heures creuses dès aujourd'hui !",
            "Sign up your sport centre in a few minutes and start filling your quiet hours today!",
          )}
        </p>
      </div>

      <div className="mt-10">
        <CentreSearch />
      </div>
    </div>
  );
}
