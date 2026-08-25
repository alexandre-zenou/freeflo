"use client";

import Image from "next/image";
import { site } from "@/lib/site";
import { useT } from "@/lib/i18n";

/**
 * Volet gauche de la page de connexion (masqué sous `lg`).
 *
 * Hauteur FIXE, et `self-start` pour ne pas s'étirer : sans cela, le volet est
 * une cellule de grille et suit la hauteur de la colonne d'en face. Le
 * formulaire de création de compte étant plus haut que celui de connexion
 * (prénom, nom), la photo changeait de taille au passage d'un onglet à l'autre.
 * `sticky` la garde en vue quand le formulaire long fait défiler la page.
 */
export function ConnexionBrandPanel() {
  const t = useT();

  return (
    <div
      /*
        `lg:sticky!` avec sa marque d'importance : l'utilitaire maison `.grain`
        impose `position: relative`, et l'emportait sur `lg:sticky`. Le volet
        était donc en position relative avec `top: 96px`, ce qui le poussait
        96 px plus bas que la colonne d'en face : les deux ne commençaient
        jamais au même niveau. On force ici, plutôt que de retoucher `.grain`,
        dont le grain dépend d'un parent positionné et qui sert ailleurs.
      */
      className="brand-mesh grain hidden overflow-hidden lg:sticky! lg:top-24 lg:block lg:h-[calc(100dvh-6rem)] lg:self-start"
    >
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
        <p className="display text-5xl text-white">
          Burn Calories,<br />Not <span className="accent-em">Cash</span>
        </p>
      </div>
    </div>
  );
}
