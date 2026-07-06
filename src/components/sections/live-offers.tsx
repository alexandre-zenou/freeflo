import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { OfferCard } from "@/components/offer-card";
import { Button } from "@/components/ui/button";
import { offers } from "@/lib/site";

export function LiveOffers() {
  const shown = offers.slice(0, 4);
  return (
    <section className="ff-container py-24 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          title={<>Ça part maintenant.</>}
          intro="Des places réelles autour de vous, un prix qui bouge en direct. Regardez la jauge chauffer."
        />
        <Button asChild variant="outline">
          <Link href="/offres">Voir toutes les offres <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      <Reveal stagger={0.1} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((o) => (
          <OfferCard key={o.id} offer={o} />
        ))}
      </Reveal>
    </section>
  );
}
