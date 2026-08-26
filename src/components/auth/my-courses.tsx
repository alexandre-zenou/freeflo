"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { offerById, categoryOf, pastCourses } from "@/lib/site";
import { daysAgoLabel, formatEuro, slotLabel } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";
import { cancelBooking, isPastBooking, useAccount, useHydrated, type Booking } from "@/lib/account";
import { cn } from "@/lib/utils";

/**
 * « Mes cours » : les cours à venir, et ceux déjà passés.
 *
 * Deux ONGLETS et non deux sections empilées : l'historique n'a pas de fin, et
 * en le posant sous les cours à venir on repousserait vers le bas la seule
 * chose qu'on vient vraiment vérifier, le prochain cours. L'écran ouvre donc
 * sur « À venir », et l'historique se consulte quand on le demande.
 *
 * Aucun pourcentage de remise (retour client 08/2026) : le prix payé, et le
 * prix plein barré à côté, rien de plus.
 */
type Onglet = "avenir" | "passes";

export function MyCourses() {
  const t = useT();
  const { locale } = useLocale();
  const hydrated = useHydrated();
  const { member, bookings } = useAccount();
  const [onglet, setOnglet] = useState<Onglet>("avenir");

  /* Le rendu serveur est toujours déconnecté : on tient la place plutôt que
     d'annoncer « réservé aux membres » à quelqu'un qui est connecté. */
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
          {t("Connectez-vous pour retrouver vos cours.", "Log in to find your classes.")}
        </p>
        <Link href="/connexion?next=%2Fmes-cours">
          <Button variant="gold" size="lg" className="mt-7">
            {t("Se connecter", "Log in")}
          </Button>
        </Link>
      </div>
    );
  }

  const nomComplet = [member.firstName, member.lastName].filter(Boolean).join(" ");

  /*
    Un cours est passé quand son début l'est. `startsAt` est figé à la
    réservation : le `startsInHours` de l'offre, lui, est relatif à « maintenant »
    et ne vieillit jamais (voir `lib/account.tsx`). Une réservation écrite avant
    ce champ n'en a pas, et compte alors comme à venir.
  */
  const aVenir = bookings.filter((b) => !isPastBooking(b));
  const echues = bookings.filter((b) => isPastBooking(b));

  /* L'historique mêle les cours réellement passés du navigateur et celui de
     démonstration, sans quoi l'onglet resterait vide à la première visite. */
  const passes = [
    ...echues.map((b) => ({ kind: "reelle" as const, b })),
    ...pastCourses.map((p) => ({ kind: "demo" as const, p })),
  ];

  const onglets = [
    { cle: "avenir" as const, label: "À venir", labelEn: "Upcoming", n: aVenir.length },
    { cle: "passes" as const, label: "Historique", labelEn: "History", n: passes.length },
  ];

  return (
    <div className="ff-container max-w-3xl py-16">
      <p className="eyebrow text-brand">{t("Mon compte", "My account")}</p>
      <h1 className="display mt-3 text-[clamp(2rem,5vw,3rem)] text-ink">
        {t("Mes cours", "My classes")}
      </h1>

      <div role="tablist" className="mt-8 flex gap-2 border-b border-line">
        {onglets.map((o) => (
          <button
            key={o.cle}
            role="tab"
            aria-selected={onglet === o.cle}
            onClick={() => setOnglet(o.cle)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-base transition-colors",
              onglet === o.cle
                ? "border-brand font-bold text-brand"
                : "border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {t(o.label, o.labelEn)}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                onglet === o.cle ? "bg-brand-tint text-brand" : "bg-secondary text-ink-soft",
              )}
            >
              {o.n}
            </span>
          </button>
        ))}
      </div>

      {onglet === "avenir" ? (
        aVenir.length === 0 ? (
          <Vide
            titre={t("Aucun cours à venir.", "No upcoming classes.")}
            texte={t(
              "Les places se libèrent en continu, et le prix fond à mesure que le cours approche.",
              "Spots open up continuously, and the price melts as the class gets closer.",
            )}
            action={t("Voir les offres", "Browse offers")}
          />
        ) : (
          <ul className="mt-6 space-y-4">
            {aVenir.map((b) => (
              <CarteAVenir key={b.ref} b={b} nomComplet={nomComplet} locale={locale} t={t} />
            ))}
          </ul>
        )
      ) : passes.length === 0 ? (
        <Vide
          titre={t("Aucun cours passé.", "No past classes.")}
          texte={t(
            "Vos cours viendront ici une fois qu'ils auront eu lieu.",
            "Your classes will land here once they have taken place.",
          )}
          action={t("Voir les offres", "Browse offers")}
        />
      ) : (
        <ul className="mt-6 space-y-4">
          {passes.map((x) =>
            x.kind === "reelle" ? (
              <CartePassee
                key={x.b.ref}
                offerId={x.b.offerId}
                /* `startsAt` sert de « maintenant » : c'est la date du cours.
                   Absent, le paramètre par défaut de `slotLabel` prend le
                   relais, et l'impureté reste dans `lib/format.ts`. */
                quand={slotLabel(0, locale, x.b.startsAt)}
                prix={x.b.price}
                reference={x.b.ref}
                t={t}
              />
            ) : (
              <CartePassee
                key={x.p.ref}
                offerId={x.p.offerId}
                quand={daysAgoLabel(x.p.daysAgo, locale)}
                prix={x.p.price}
                reference={x.p.ref}
                t={t}
              />
            ),
          )}
        </ul>
      )}

      <p className="mt-10 text-xs text-ink-soft">
        {t(
          "Démo : votre compte et vos cours vivent dans ce navigateur, rien n'est envoyé à un serveur.",
          "Demo: your account and classes live in this browser, nothing is sent to a server.",
        )}
      </p>
    </div>
  );
}

function Vide({ titre, texte, action }: { titre: string; texte: string; action: string }) {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-line bg-paper px-6 py-10 text-center">
      <p className="text-ink">{titre}</p>
      <p className="mt-2 text-sm text-ink-soft">{texte}</p>
      <Link href="/offres">
        <Button variant="gold" size="lg" className="mt-6">
          {action}
        </Button>
      </Link>
    </div>
  );
}

function CarteAVenir({
  b,
  nomComplet,
  locale,
  t,
}: {
  b: Booking;
  nomComplet: string;
  locale: "fr" | "en";
  t: (fr: string, en?: string) => string;
}) {
  const offer = offerById(b.offerId);
  if (!offer) return null;
  const cat = categoryOf(offer.category);

  return (
    <li className="overflow-hidden rounded-3xl bg-paper ring-1 ring-line sm:flex">
      <div className="relative h-40 shrink-0 sm:h-auto sm:w-44">
        <Image src={offer.image} alt="" fill sizes="(min-width: 640px) 11rem, 100vw" className="object-cover" />
      </div>

      <div className="flex-1 p-5">
        <p className="eyebrow text-brand">{t(cat.label, cat.labelEn)}</p>
        <h3 className="display mt-1.5 text-xl text-ink">
          <Link href={`/offres/${offer.id}`} className="hover:text-brand">
            {t(offer.title, offer.titleEn)}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          {offer.gym}, {offer.arrondissement}
        </p>

        <div className="mt-4 space-y-1.5 text-sm text-ink">
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand" />
            {slotLabel(offer.startsInHours, locale)}, {offer.durationMin} min
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand" /> {offer.address}
          </p>
          {/* Pas de QR code (arbitrage client) : c'est le nom qui fait la
              réservation, on le rappelle donc ici. */}
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" />
            {t(
              `À l'accueil, présentez-vous au nom de ${nomComplet}.`,
              `At the front desk, give the name ${nomComplet}.`,
            )}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 border-t border-line pt-4">
          <span className="font-mono text-xs text-ink-soft">{b.ref}</span>
          <span className="flex items-baseline gap-2">
            <span className="text-sm text-ink-soft">{t("Payé", "Paid")}</span>
            <span className="font-display text-xl font-bold tabular-nums text-brand-deep">
              {formatEuro(b.price)}
            </span>
            {b.price < offer.basePrice && (
              <span className="text-sm text-ink-soft line-through">{formatEuro(offer.basePrice)}</span>
            )}
          </span>
        </div>

        <button
          onClick={() => cancelBooking(b.ref)}
          className="mt-3 text-sm text-ink-soft underline underline-offset-4 transition-colors hover:text-brand"
        >
          {t("Annuler cette réservation", "Cancel this booking")}
        </button>
      </div>
    </li>
  );
}

/**
 * Un cours déjà passé. Volontairement plus sobre que la carte à venir : ni
 * adresse, ni rappel d'identité, ni annulation, qui n'ont plus d'objet. Reste
 * ce qu'on vient y chercher, ce qu'on a fait et ce qu'on a payé, plus un
 * raccourci pour reprendre le même cours.
 */
function CartePassee({
  offerId,
  quand,
  prix,
  reference,
  t,
}: {
  offerId: string;
  quand: string;
  prix: number;
  reference: string;
  t: (fr: string, en?: string) => string;
}) {
  const offer = offerById(offerId);
  if (!offer) return null;
  const cat = categoryOf(offer.category);

  return (
    <li className="flex items-center gap-4 rounded-3xl bg-paper p-4 ring-1 ring-line">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
        <Image src={offer.image} alt="" fill sizes="4rem" className="object-cover grayscale" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="eyebrow text-ink-soft">{t(cat.label, cat.labelEn)}</p>
        <h3 className="truncate text-base font-bold text-ink">{t(offer.title, offer.titleEn)}</h3>
        <p className="truncate text-sm text-ink-soft">
          {quand}, {offer.gym}
        </p>
        <p className="mt-0.5 font-mono text-xs text-ink-soft/80">{reference}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-sm font-bold tabular-nums text-ink">{formatEuro(prix)}</span>
        <Link
          href={`/offres/${offer.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-brand hover:text-brand"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t("Refaire", "Book again")}
        </Link>
      </div>
    </li>
  );
}
