import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OffersExplorer } from "@/components/offers/offers-explorer";
import { OffresIntro } from "./content";
import { offers } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cours de sport près de vous",
  description:
    "Parcourez les cours de sport de dernière minute autour de vous, en vue liste ou carte. Le prix fond à mesure que l'heure du cours approche.",
};

export default function OffresPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-16 md:pt-[4.5rem]">
        <OffresIntro />
        <div className="mt-6">
          <OffersExplorer offers={offers} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
