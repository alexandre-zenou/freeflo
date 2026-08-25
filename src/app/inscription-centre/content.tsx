"use client";

import { VendorSignup } from "@/components/vendor/vendor-signup";

/**
 * Entrée du parcours d'inscription d'un centre.
 *
 * La page ne porte plus que la vignette « Créer mon espace pro ». La recherche
 * de commerce qui l'ouvrait (titre, champ de recherche, mention légale, bouton
 * « Continuer » et lien de connexion) a été retirée à la demande de la cliente :
 * elle demandait deux fois la même chose, la vignette portant déjà son titre,
 * sa promesse et son formulaire. Le composant `vendor/centre-search.tsx` est
 * conservé au cas où ce premier pas reviendrait.
 */
export function InscriptionCentreContent() {
  return (
    <div className="ff-container flex min-h-[calc(100dvh-6rem)] flex-col justify-center py-16">
      <div className="mx-auto w-full max-w-xl">
        <VendorSignup />
      </div>
    </div>
  );
}
