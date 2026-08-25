"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHydrated, useIsPro } from "@/lib/account";

/**
 * Porte inverse de `ProGuard` : elle ferme les pages du parcours SPORTIF au
 * comptes professionnels, centre comme administration : ils gèrent des créneaux et n'en réservent pas.
 *
 * Elle ne protège rien et n'a pas à le faire : ces pages sont publiques, un
 * visiteur déconnecté y entre librement. Elle leur évite seulement de se retrouver dans un parcours qui n'a pas de sens pour
 * elle, et que sa navigation ne propose d'ailleurs plus.
 *
 * L'attente d'hydratation est indispensable : le rendu serveur est toujours
 * déconnecté, sans elle un membre verrait la redirection se déclencher à tort
 * le temps d'un éclair.
 */
export function MemberGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const isPro = useIsPro();
  const rediriger = hydrated && isPro;

  useEffect(() => {
    /* `replace` et non `push` : la page quittée ne doit pas revenir au retour
       arrière, sinon l'administration rebondit entre les deux. */
    if (rediriger) router.replace("/pro");
  }, [rediriger, router]);

  if (rediriger) {
    return (
      <div className="ff-container max-w-3xl py-20">
        <div className="h-8 w-64 animate-pulse rounded-full bg-secondary" />
        <div className="mt-8 h-40 w-full animate-pulse rounded-3xl bg-secondary" />
      </div>
    );
  }

  return <>{children}</>;
}
