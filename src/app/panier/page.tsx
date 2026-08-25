import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MemberGuard } from "@/components/member-guard";
import { CartView } from "@/components/offers/cart-view";

export const metadata: Metadata = {
  title: "Mon panier",
  description: "Les places que vous avez réservées, à confirmer en une fois.",
  robots: { index: false, follow: false },
};

export default function PanierPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[70dvh] bg-cream pt-28 md:pt-32">
        <MemberGuard>
          <CartView />
        </MemberGuard>
      </main>
      <SiteFooter />
    </>
  );
}
