import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OffersExplorer } from "@/components/offers/offers-explorer";
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
        <div className="ff-container pt-8">
          <p className="eyebrow mb-3 text-peri-deep">Paris · Rayon 3 km</p>
          <h1 className="display text-4xl text-ink sm:text-5xl">Ça se libère autour de vous.</h1>
          <p className="mt-3 max-w-xl text-ink-soft">
            Les prix affichés sont recalculés en direct. Une jauge ember = une place bientôt perdue,
            donc bradée. Foncez.
          </p>
        </div>
        <div className="mt-6">
          <OffersExplorer offers={offers} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
