"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useHydrated, useMember } from "@/lib/account";
import { createClient, supabaseConfigure } from "@/lib/supabase/client";

/**
 * Porte de l'espace pro. Seul le compte d'administration passe : l'espace pro
 * donne à voir les DONNÉES de l'application (offres des centres, commandes,
 * planning), ce qui n'a rien à faire devant un visiteur ni devant un membre.
 *
 * Ce n'est pas de la sécurité, et ça n'a pas à l'être : ce qui protège
 * vraiment, ce sont les policies RLS de Postgres. Quelqu'un qui forcerait
 * l'affichage de cette page ne recevrait aucune donnée.
 *
 * Elle distingue TROIS situations, parce qu'un centre qui vient de déposer son
 * dossier n'est pas un visiteur égaré : lui dire « votre compte est un compte
 * membre, changez de compte » était déroutant quelques minutes après son
 * inscription. On lui dit désormais que son dossier est en cours d'examen.
 */
type Dossier = "aucun" | "en_attente" | "refusee" | "validee";
export function ProGuard({ children }: { children: React.ReactNode }) {
  const t = useT();
  const hydrated = useHydrated();
  const member = useMember();
  const [dossier, setDossier] = useState<Dossier | null>(null);

  /* L'état n'est posé que dans le RAPPEL de la promesse, jamais dans le corps
     de l'effet : la règle `react-hooks/set-state-in-effect` l'interdit. */
  const appliquer = useCallback((d: Dossier) => setDossier(d), []);

  const estPro = member?.role === "admin" || member?.role === "centre";

  useEffect(() => {
    /* Rien à chercher pour un visiteur, ni pour quelqu'un qui passe déjà. */
    if (!member || estPro || !supabaseConfigure()) return;
    let vivant = true;
    void createClient()
      .from("candidatures_centres")
      .select("statut")
      .maybeSingle()
      .then(({ data }) => {
        if (vivant) appliquer((data?.statut as Dossier) ?? "aucun");
      });
    return () => {
      vivant = false;
    };
  }, [member, estPro, appliquer]);

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

  if (estPro) return <>{children}</>;

  /*
    Dossier déposé, en attente : on ne parle plus de « compte membre » ni de
    « changer de compte ». La personne a fait ce qu'il fallait, c'est à nous
    de jouer.
  */
  if (dossier === "en_attente") {
    return (
      <div className="ff-container max-w-xl py-20">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-pro-surface text-pro-accent">
          <Clock className="h-6 w-6" />
        </span>
        <h1 className="pro-display mt-6 text-3xl text-pro-accent">
          {t("Votre dossier est en cours d'examen.", "Your application is being reviewed.")}
        </h1>
        <p className="mt-3 text-ink-soft">
          {t(
            "Votre espace pro n'est pas encore ouvert. Il s'ouvre dès que votre adresse est confirmée : si c'est déjà fait, écrivez-nous et nous l'ouvrons à la main.",
            "Your pro area is not open yet. It opens as soon as your email is confirmed: if you already did, write to us and we will open it by hand.",
          )}
        </p>
        <Link href="/offres">
          <Button variant="gold" size="lg" className="mt-7">
            {t("Voir les cours en attendant", "Browse classes meanwhile")}
          </Button>
        </Link>
      </div>
    );
  }

  if (dossier === "refusee") {
    return (
      <div className="ff-container max-w-xl py-20">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-tint text-brand">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="pro-display mt-6 text-3xl text-pro-accent">
          {t("Votre dossier n'a pas été retenu.", "Your application was not approved.")}
        </h1>
        <p className="mt-3 text-ink-soft">
          {t(
            "Écrivez-nous si vous pensez qu'il s'agit d'une erreur : nous le reprendrons avec vous.",
            "Write to us if you think this is a mistake: we will go through it with you.",
          )}
        </p>
      </div>
    );
  }

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
