"use client";

import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { signOut, useAccount, useHydrated } from "@/lib/account";

/**
 * Espace membre. Volontairement court : le compte n'existe que pour donner un
 * après à la réservation, pas pour préfigurer un back-office. Les réservations
 * viennent du magasin de démo (`lib/account.tsx`), donc du navigateur.
 *
 * Aucun pourcentage ici non plus (retour client 08/2026) : le prix payé et le
 * prix plein barré, rien d'autre.
 */
export function AccountView() {
  const t = useT();
  const hydrated = useHydrated();
  const { member, bookings } = useAccount();

  /* Avant hydratation, le rendu est toujours celui d'un visiteur déconnecté :
     on tient la place plutôt que d'afficher « connectez-vous » à un membre. */
  if (!hydrated) {
    return (
      <div className="ff-container max-w-3xl py-16">
        <div className="h-8 w-64 animate-pulse rounded-full bg-secondary" />
        <div className="mt-8 h-40 w-full animate-pulse rounded-3xl bg-secondary" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="ff-container max-w-3xl py-16">
        <h1 className="display text-3xl text-ink sm:text-4xl">
          {t("Cet espace est réservé aux membres.", "This area is for members.")}
        </h1>
        <p className="mt-3 text-ink-soft">
          {t(
            "Connectez-vous pour retrouver vos réservations.",
            "Log in to find your bookings.",
          )}
        </p>
        <Link href="/connexion?next=%2Fcompte">
          <Button variant="gold" size="lg" className="mt-7">
            {t("Se connecter", "Log in")}
          </Button>
        </Link>
      </div>
    );
  }

  const fullName = [member.firstName, member.lastName].filter(Boolean).join(" ");

  /*
    Les comptes professionnels, centre comme administration, ne réservent rien :
    ils mettent des places en vente. Leur montrer « Mes réservations, aucune
    pour le moment » puis les inviter à voir les offres n'a aucun sens, c'est le
    parcours du client. Leur compte se réduit à leur identité et à la porte de
    l'espace pro.
  */
  if (member.role !== "member") {
    return (
      <div className="ff-container max-w-3xl py-16">
        <p className="eyebrow text-brand">
          {member.role === "centre"
            ? t("Compte centre de sport", "Sport centre account")
            : t("Compte administrateur", "Admin account")}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-[clamp(2rem,5vw,3rem)] text-ink">
              {t(`Bonjour, ${member.firstName}.`, `Hello, ${member.firstName}.`)}
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              {fullName}, {member.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <LogOut className="h-4 w-4" /> {t("Se déconnecter", "Log out")}
          </button>
        </div>

        <div className="mt-10 rounded-3xl border border-line bg-paper px-6 py-8">
          <h2 className="display text-2xl text-ink">{t("Espace pro", "Pro area")}</h2>
          <p className="mt-2 text-sm text-ink-soft">
            {t(
              "Vos créneaux, vos réservations reçues et les réglages de votre centre.",
              "Your slots, the bookings you receive, and your centre settings.",
            )}
          </p>
          <Link href="/pro">
            <Button variant="gold" size="lg" className="mt-6">
              {t("Ouvrir l'espace pro", "Open the pro area")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ff-container max-w-3xl py-16">
      <p className="eyebrow text-brand">{t("Mon compte", "My account")}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[clamp(2rem,5vw,3rem)] text-ink">
            {t(`Bonjour, ${member.firstName}.`, `Hello, ${member.firstName}.`)}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {fullName}, {member.email}
          </p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink transition-colors hover:border-brand hover:text-brand"
        >
          <LogOut className="h-4 w-4" /> {t("Se déconnecter", "Log out")}
        </button>
      </div>

      {/*
        La liste des cours a quitté cet écran pour `/mes-cours`, qui la range en
        deux onglets, « À venir » et « Historique ». `/compte` ne garde que ce
        qui relève du compte lui-même : l'identité, et la sortie.
      */}
      <div className="mt-10 rounded-3xl border border-line bg-paper px-6 py-8">
        <h2 className="display text-2xl text-ink">{t("Mes cours", "My classes")}</h2>
        <p className="mt-2 text-sm text-ink-soft">
          {bookings.length > 0
            ? t(
                `${bookings.length} cours à votre nom, à venir ou déjà passés.`,
                `${bookings.length} classes in your name, upcoming or already taken.`,
              )
            : t(
                "Vos cours réservés et votre historique se retrouvent ici.",
                "Your booked classes and your history live here.",
              )}
        </p>
        <Link href="/mes-cours">
          <Button variant="gold" size="lg" className="mt-6">
            {t("Voir mes cours", "See my classes")} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <p className="mt-10 text-xs text-ink-soft">
        {t(
          "Démo : votre compte et vos réservations vivent dans ce navigateur, rien n'est envoyé à un serveur.",
          "Demo: your account and bookings live in this browser, nothing is sent to a server.",
        )}
      </p>
    </div>
  );
}
