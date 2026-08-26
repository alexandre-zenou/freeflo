import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { mentionsLegales } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergeur et responsabilités de la plateforme FREEFLO.",
  robots: { index: false, follow: false },
};

export default function MentionsLegalesPage() {
  return (
    <LegalDocument
      eyebrow="Informations légales"
      eyebrowEn="Legal information"
      title="Mentions légales"
      titleEn="Legal notice"
      sections={mentionsLegales}
    />
  );
}
