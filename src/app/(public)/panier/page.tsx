import type { Metadata } from "next";
import { Suspense } from "react";
import { MemberGuard } from "@/components/member-guard";
import { CartView } from "@/components/offers/cart-view";

export const metadata: Metadata = {
  title: "Mon panier",
  description: "Les places que vous avez réservées, à confirmer en une fois.",
  robots: { index: false, follow: false },
};

export default function PanierPage() {
  return (
    <main className="min-h-[70dvh] bg-cream pt-28 md:pt-32">
      <MemberGuard>
        {/* `CartView` lit `?paiement=` et `?session=` au retour de Stripe, donc
            `useSearchParams` : sans cette frontière, la page entière sortirait
            du rendu statique. Même motif que `/offres`. */}
        <Suspense
          fallback={
            <div className="ff-container max-w-3xl py-16">
              <div className="h-8 w-56 animate-pulse rounded-full bg-secondary" />
              <div className="mt-8 h-40 w-full animate-pulse rounded-3xl bg-secondary" />
            </div>
          }
        >
          <CartView />
        </Suspense>
      </MemberGuard>
    </main>
  );
}
