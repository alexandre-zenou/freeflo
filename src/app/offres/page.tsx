import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MemberGuard } from "@/components/member-guard";
import { Suspense } from "react";
import { OffresSearch } from "./search";

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
            {/*
              `Suspense` obligatoire : la recherche lit `?sport=` avec
              `useSearchParams`, que Next exige d'isoler pour garder la page
              prégénérée. Le repli reprend la hauteur du bandeau de jours, pour
              que rien ne saute au moment où la recherche prend le relais.
            */}
            <Suspense fallback={<div className="ff-container h-[7.5rem] animate-pulse rounded-2xl bg-secondary/60" />}>
              <OffresSearch />
            </Suspense>
          </div>
        </MemberGuard>
      </main>
      <SiteFooter />
    </>
  );
}
