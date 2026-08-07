import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InscriptionCentreContent } from "./content";

export const metadata: Metadata = {
  title: "Inscrivez votre centre de sport",
  description:
    "Inscrivez votre centre de sport en quelques minutes et remplissez vos heures creuses dès aujourd'hui. Sans abonnement, sans engagement.",
};

/**
 * Page demandée par la cliente (planche 22) : l'entrée du parcours d'inscription
 * d'un centre. Fond rouge, écriture blanche, un champ de recherche de commerce,
 * bouton « Continuer » jaune, lien « Connectez-vous » jaune, et les liens vers la
 * politique de confidentialité et les CGU.
 *
 * C'est ici qu'atterrit « Inscrire mon centre » depuis l'en-tête et le pied de
 * page ; `/inscrire-son-centre` reste la page qui explique l'intérêt de venir.
 */
export default function InscriptionCentrePage() {
  return (
    <>
      <SiteHeader />
      <main className="brand-mesh grain relative min-h-dvh pt-16 md:pt-[4.5rem]">
        <InscriptionCentreContent />
      </main>
      <SiteFooter />
    </>
  );
}
