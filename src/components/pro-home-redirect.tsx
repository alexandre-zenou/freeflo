"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHydrated, useIsPro } from "@/lib/account";

/**
 * Renvoie un compte PROFESSIONNEL de l'accueil vers son espace.
 *
 * `ProGuard` ferme `/pro` à qui n'y a pas sa place ; ceci est l'inverse, et il
 * manquait : un centre ou l'administration qui ouvrait le site retombait sur la
 * page d'accueil marketing, « réservez votre cours à prix cassé », alors que ces
 * comptes ne réservent rien, ils mettent des places en vente. La session vit
 * dans le navigateur (`lib/account.tsx`) et survit à la fermeture de l'onglet :
 * on revient donc sur le site déjà identifié comme centre, sans être passé par
 * `/connexion`, et c'est exactement le cas que personne ne traitait.
 *
 * La règle existait déjà à un seul endroit, `auth-form.tsx` : à la connexion,
 * un rôle autre que `member` part sur `/pro` et son `next` est ignoré. On la
 * rend simplement vraie à toutes les entrées, pas seulement après un mot de
 * passe.
 *
 * Seul l'ACCUEIL redirige. Les mentions légales, les CGU et la confidentialité
 * restent lisibles par tout le monde, et `/compte` a déjà sa version
 * professionnelle. Fermer tout `(public)` reviendrait à enfermer ces comptes.
 *
 * Deux détails qui comptent :
 *
 * · `replace` et non `push` : avec `push`, le bouton « précédent » ramènerait à
 *   l'accueil, qui redirigerait de nouveau, et l'historique serait un piège ;
 * · le voile. L'accueil est une page statique, servie et peinte avant que le
 *   navigateur sache qui regarde (le rendu serveur est toujours déconnecté).
 *   Sans lui, un centre verrait le héros une demi-seconde avant de basculer.
 *   Il ne se pose QUE dans le cas de la redirection : un visiteur ordinaire,
 *   lui, ne doit rien attendre du tout devant la page qui vend le service.
 */
export function ProHomeRedirect() {
  const router = useRouter();
  const hydrated = useHydrated();
  const pro = useIsPro();
  const partir = hydrated && pro;

  useEffect(() => {
    if (!partir) return;
    router.replace("/pro");
  }, [partir, router]);

  if (!partir) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] grid place-items-center bg-cream"
    >
      <span className="sr-only">Ouverture de l&apos;espace pro</span>
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-brand-tint border-t-brand" />
    </div>
  );
}
