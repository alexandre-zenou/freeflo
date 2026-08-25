import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MemberGuard } from "@/components/member-guard";
import { MapSearch } from "@/components/sections/map-search";

export const metadata: Metadata = {
  title: "Cours de sport près de vous",
  description:
    "Parcourez les cours de sport de dernière minute autour de vous, en vue liste ou carte. Le prix fond à mesure que l'heure du cours approche.",
};

export default function OffresPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-20 md:pt-24">
        <MemberGuard>
          {/*
            Même composant que la section de l'accueil, et non une copie : les
            filtres, le panneau de résultats et la carte y sont identiques. Deux
            réglages diffèrent, le calendrier des prix qui ouvre la page, et le
            raccourci « Voir toutes les offres » qui n'a pas de sens ici
            puisqu'on y est déjà.
          */}
          {/* La section partagée ouvre en `pt-0`, ce qui convient à l'accueil où
              elle suit d'autres blocs. Ici elle est la première : on lui donne
              de l'air sous la barre de navigation, sans toucher au composant. */}
          <div className="pt-6 md:pt-10">
            <MapSearch
              titre={{
                fr: "Voir les meilleurs prix autour de vous",
                en: "See the best prices around you",
                /* Seul titre de la page depuis le retrait de l'ancien chapô : il
                   en devient le `h1`, ce que réclament autant le référencement
                   que les lecteurs d'écran. En encre, et non en rouge de marque. */
                h1: true,
                ton: "ink",
              }}
              lienCatalogue={false}
              calendrier
            />
          </div>
        </MemberGuard>
      </main>
      <SiteFooter />
    </>
  );
}
