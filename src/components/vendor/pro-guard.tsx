"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useHydrated, useMember } from "@/lib/account";

/**
 * Porte de l'espace pro. Seul le compte d'administration passe : l'espace pro
 * donne à voir les DONNÉES de l'application (offres des centres, commandes,
 * planning), ce qui n'a rien à faire devant un visiteur ni devant un membre.
 *
 * Ce n'est pas de la sécurité, et ça ne peut pas l'être : la vérification est
 * dans le navigateur, comme toute la session de démonstration
 * (`lib/account.tsx`). Quelqu'un qui sait lire la console entrera. En phase 2,
 * ce garde-fou devient une policy RLS Postgres, et la page ne recevra
 * simplement plus de données.
 */
export function ProGuard({ children }: { children: React.ReactNode }) {
  const t = useT();
  const hydrated = useHydrated();
  const member = useMember();

  /* Le rendu serveur est toujours déconnecté : sans cette attente, un
     administrateur verrait « accès réservé » le temps d'un éclair. */
  if (!hydrated) {
    return (
      <div className="ff-container max-w-3xl py-20">
        <div className="h-8 w-64 animate-pulse rounded-full bg-secondary" />
        <div className="mt-8 h-40 w-full animate-pulse rounded-3xl bg-secondary" />
      </div>
    );
  }

  if (member?.role === "admin" || member?.role === "centre") return <>{children}</>;

  return (
    <div className="ff-container max-w-xl py-20">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-tint text-brand">
        <Lock className="h-6 w-6" />
      </span>
      <h1 className="pro-display mt-6 text-3xl text-pro-accent">
        {t("Accès réservé aux centres.", "Centres only.")}
      </h1>
      <p className="mt-3 text-ink-soft">
        {member
          ? t(
              "Votre compte est un compte membre. L'espace pro demande le compte d'un centre de sport, ou celui de l'administration.",
              "Yours is a member account. The pro area requires a sport centre account, or the administration one.",
            )
          : t(
              "Connectez-vous avec le compte d'un centre de sport pour ouvrir l'espace pro.",
              "Log in with a sport centre account to open the pro area.",
            )}
      </p>

      <Link href="/connexion?next=%2Fpro">
        <Button variant="gold" size="lg" className="mt-7">
          {member ? t("Changer de compte", "Switch account") : t("Se connecter", "Log in")}
        </Button>
      </Link>

      {/* Les identifiants de démonstration ont disparu avec les comptes en
          dur (28/08/2026) : l'authentification est réelle. Un compte devient
          « centre » depuis Supabase, jamais depuis le site. */}
      <p className="mt-6 rounded-2xl border border-dashed border-line bg-paper px-4 py-3 text-sm text-ink-soft">
        {t(
          "L'accès professionnel est ouvert par FREEFLO une fois votre centre validé. Écrivez-nous si vous gérez un établissement.",
          "Professional access is opened by FREEFLO once your centre is approved. Get in touch if you run a venue.",
        )}
      </p>
    </div>
  );
}
