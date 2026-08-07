import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OfferDetail } from "@/components/offers/offer-detail";
import { offers, offerById } from "@/lib/site";

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

  const similar = offers.filter((o) => o.id !== offer.id && o.category === offer.category).slice(0, 3);
  const fill = offers.filter((o) => o.id !== offer.id && o.category !== offer.category).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="pt-16 md:pt-[4.5rem]">
        <OfferDetail offer={offer} similar={(similar.length ? similar : fill).slice(0, 3)} />
      </main>
      <SiteFooter />
    </>
  );
}
