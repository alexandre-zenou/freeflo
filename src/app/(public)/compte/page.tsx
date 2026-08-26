import type { Metadata } from "next";
import { AccountView } from "@/components/auth/account-view";

export const metadata: Metadata = {
  title: "Mon compte",
  description: "Vos réservations FREEFLO.",
  robots: { index: false, follow: false },
};

/*
  `/compte` est resté dans le groupe `(public)` : c'est l'écran d'un CLIENT, qui
  se sert du site autour, parcourt les offres et remplit son panier. Il garde
  donc l'en-tête et le pied de page, comme avant.

  Seul `/pro` est cloisonné, parce qu'un centre ou l'administration ne
  réservent rien et n'ont aucune raison de repasser côté public.

  L'en-tête publique flotte (`fixed`), d'où le retrait en haut.
*/
export default function ComptePage() {
  return (
    <main className="min-h-[70dvh] bg-cream pt-28 md:pt-32">
      <AccountView />
    </main>
  );
}
