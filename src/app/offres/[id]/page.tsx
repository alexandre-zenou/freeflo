import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OfferDetail } from "@/components/offers/offer-detail";
import { offers, offerById } from "@/lib/site";
import { distanceKm } from "@/lib/geo";

export function generateStaticParams() {
  return offers.map((o) => ({ id: o.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const offer = offerById(id);
  if (!offer) return { title: "Offre introuvable" };
  return {
    title: `${offer.title} chez ${offer.gym}`,
    description: `${offer.description} Réservez à partir de ${offer.basePrice} €, le prix baisse à l'approche du créneau.`,
  };
}

export default async function OffrePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = offerById(id);
  if (!offer) notFound();

  /*
    Suggestions GÉOGRAPHIQUES, et non plus par catégorie : quelqu'un qui regarde
    un cours veut savoir ce qui se libère au même endroit, pas un autre yoga à
    l'autre bout de Paris.

    Deux rangs : le même centre d'abord, à un autre horaire — c'est la
    suggestion la plus pertinente, le visiteur connaît déjà le lieu — puis les
    autres centres du plus proche au plus lointain. Le calcul est fait ici, côté
    serveur, parce qu'il ne dépend que des coordonnées des offres : la position
    du visiteur, elle, n'existe que dans son navigateur.
  */
  const nearby = offers
    .filter((o) => o.id !== offer.id)
    .map((o) => ({
      offer: o,
      sameGym: o.gym === offer.gym,
      km: distanceKm({ lat: offer.lat, lng: offer.lng }, { lat: o.lat, lng: o.lng }),
    }))
    .sort((a, b) => Number(b.sameGym) - Number(a.sameGym) || a.km - b.km)
    .slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="pt-20 md:pt-24">
        <OfferDetail offer={offer} nearby={nearby} />
      </main>
      <SiteFooter />
    </>
  );
}
