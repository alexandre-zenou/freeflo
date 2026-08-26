import type { Metadata } from "next";
import { VendorDashboard } from "@/components/vendor/vendor-dashboard";
import { ProGuard } from "@/components/vendor/pro-guard";

export const metadata: Metadata = {
  title: "Espace pro, tableau de bord",
  description:
    "L'espace pro FREEFLO : gérez vos offres du jour, suivez vos ventes et vos paiements mensuels, préparez les commandes. Aperçu de démonstration.",
  robots: { index: false, follow: false },
};

export default function ProPage() {
  return (
    <div className="flex-1 bg-white">
      <ProGuard>
        <VendorDashboard />
      </ProGuard>
    </div>
  );
}
