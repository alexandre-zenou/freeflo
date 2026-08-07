import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { QuiSommesNousContent } from "./content";

export const metadata: Metadata = {
  title: "Qui sommes nous ?",
  description:
    "FREEFLO libère les places de cours de sport invendues près de chez vous. Notre mission : remplir les salles, faire bouger plus de monde, sans abonnement.",
};

export default function QuiSommesNousPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <QuiSommesNousContent />
      </main>
      <SiteFooter />
    </>
  );
}
