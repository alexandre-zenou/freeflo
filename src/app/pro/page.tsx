import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VendorDashboard } from "@/components/vendor/vendor-dashboard";

export const metadata: Metadata = {
  title: "Espace pro, tableau de bord",
  description:
    "L'espace pro FREEFLO : gérez vos offres du jour, suivez vos ventes et vos paiements quotidiens, préparez les commandes. Aperçu de démonstration.",
  robots: { index: false, follow: false },
};

export default function ProPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-dvh bg-secondary/25 pt-16 md:pt-[4.5rem]">
        <VendorDashboard />
      </main>
      <SiteFooter />
    </>
  );
}
