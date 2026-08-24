import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AccountView } from "@/components/auth/account-view";

export const metadata: Metadata = {
  title: "Mon compte",
  description: "Vos réservations FREEFLO.",
  robots: { index: false, follow: false },
};

export default function ComptePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[70dvh] bg-cream pt-28 md:pt-32">
        <AccountView />
      </main>
      <SiteFooter />
    </>
  );
}
