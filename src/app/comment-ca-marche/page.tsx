import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConceptTimeline } from "@/components/sections/concept-timeline";
import { Faq } from "@/components/sections/faq";
import { CommentCaMarcheHero } from "./content";

export const metadata: Metadata = {
  title: "Comment ça fonctionne",
  description:
    "FREEFLO en 4 étapes : découvrir les cours près de vous, réserver au prix qui fond, se présenter à l'accueil, profiter. Le sport de dernière minute, simplement.",
};

export default function CommentCaMarchePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <CommentCaMarcheHero />
        <ConceptTimeline />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
