import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InscrireContent } from "./content";

export const metadata: Metadata = {
  title: "Inscrire mon centre de sport",
  description:
    "Remplissez vos créneaux vides sans abonnement. Commission dégressive, virements mensuels, mise en ligne en 2 minutes. FREEFLO recrute les centres de sport.",
};

export default function InscrirePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <InscrireContent />
      </main>
      <SiteFooter />
    </>
  );
}
