import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { ConceptTimeline } from "@/components/sections/concept-timeline";
import { Mechanic } from "@/components/sections/mechanic";
import { Faq } from "@/components/sections/faq";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description:
    "FREEFLO en 4 étapes : découvrir les cours près de vous, réserver au prix qui fond, se présenter avec son QR code, profiter. Le sport de dernière minute, simplement.",
};

export default function CommentCaMarchePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Le concept"
          title={<>Le bon plan sport, <span className="serif-em text-peri-deep">en direct.</span></>}
          intro="Les salles ont des places vides à chaque créneau. FREEFLO les libère à prix cassé, en temps réel, pour les sportifs près de chez elles. Tout le monde y gagne."
        >
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="solid">
              <Link href="/offres">Voir les cours près de moi <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/inscrire-son-centre">Je gère un centre</Link>
            </Button>
          </div>
        </PageHero>
        <ConceptTimeline />
        <Mechanic />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
