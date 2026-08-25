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
 * Le parcours d'inscription d'un centre, sur fond rouge (planche 22).
 *
 * C'est la SEULE page côté centres : toutes les entrées y mènent, « Inscrire
 * mon centre » de l'en-tête et du pied de page, « Je gère un centre » de
 * « Comment ça marche », et « Espace pro » du formulaire de connexion. La page
 * « Pourquoi FREEFLO » (`/inscrire-son-centre`), qui exposait les arguments
 * avant le formulaire, a été supprimée en 08/2026 : elle faisait doublon avec
 * la vignette d'inscription, qui porte déjà sa promesse.
 */
export default function InscriptionCentrePage() {
  return (
    <>
      <SiteHeader />
      <main className="brand-mesh grain relative min-h-dvh pt-20 md:pt-24">
        <InscriptionCentreContent />
      </main>
      <SiteFooter />
    </>
  );
}
