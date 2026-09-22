import type { Metadata } from "next";
import { NouveauMotDePasse } from "@/components/auth/nouveau-mot-de-passe";

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
  description: "Choisissez un nouveau mot de passe pour votre compte FREEFLO.",
  robots: { index: false, follow: false },
};

export default function NouveauMotDePassePage() {
  return (
    <main className="min-h-[70dvh] bg-cream pt-28 md:pt-32">
      <div className="ff-container flex justify-center py-12">
        <NouveauMotDePasse />
      </div>
    </main>
  );
}
