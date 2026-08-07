import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { confidentialite } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Confidentialité (RGPD)",
  description:
    "Politique de confidentialité FREEFLO : données collectées, géolocalisation, finalités, vos droits, conservation et cookies.",
  robots: { index: false, follow: false },
};

export default function ConfidentialitePage() {
  return (
    <LegalDocument
      eyebrow="Données personnelles"
      eyebrowEn="Personal data"
      title="Confidentialité (RGPD)"
      titleEn="Privacy (GDPR)"
      sections={confidentialite}
    />
  );
}
