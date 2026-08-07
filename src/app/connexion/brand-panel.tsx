"use client";

import Image from "next/image";
import { site } from "@/lib/site";
import { useT } from "@/lib/i18n";

/** Volet gauche de la page de connexion (masqué sous `lg`). */
export function ConnexionBrandPanel() {
  const t = useT();

  return (
    <div className="relative hidden overflow-hidden brand-mesh grain lg:block">
      <Image
        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=80"
        alt=""
        fill
        sizes="50vw"
        className="object-cover opacity-60 mix-blend-luminosity"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-12">
        <p className="eyebrow text-white/80">
          {site.city}, {t("le sport de dernière minute", "last-minute sport")}
        </p>
        <div>
          <p className="display text-5xl text-white">
            Burn Calories,<br />Not <span className="accent-em">Cash.</span>
          </p>
          <p className="mt-4 max-w-sm text-white/80">
            {t(
              "Des centaines de places de cours se libèrent chaque jour près de vous. Ne les laissez pas filer.",
              "Hundreds of class places open up near you every day. Don't let them slip away.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
