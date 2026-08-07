import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { cgu } from "@/lib/legal";

export const metadata: Metadata = {
  title: "CGU / CGV",
  description:
    "Conditions générales d'utilisation et de vente de FREEFLO : réservation, annulation, accès au cours, centres partenaires, paiement.",
  robots: { index: false, follow: false },
};

export default function CguCgvPage() {
  return (
    <LegalDocument
      eyebrow="Conditions générales"
      eyebrowEn="Terms and conditions"
      title="CGU / CGV"
      titleEn="Terms of use and sale"
      sections={cgu}
    />
  );
}
