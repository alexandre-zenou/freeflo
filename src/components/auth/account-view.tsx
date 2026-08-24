"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, LogOut, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { offerById, categoryOf } from "@/lib/site";
import { formatEuro, slotLabel } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";
import { cancelBooking, signOut, useAccount, useHydrated } from "@/lib/account";

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
  const { locale } = useLocale();
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

      <h2 className="display mt-12 text-2xl text-ink">
        {t("Mes réservations", "My bookings")}
      </h2>

      {bookings.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-line bg-paper px-6 py-10 text-center">
          <p className="text-ink">
            {t("Aucune réservation pour le moment.", "No bookings yet.")}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {t(
              "Les places se libèrent en continu, et le prix fond à mesure que le cours approche.",
              "Spots open up continuously, and the price melts as the class gets closer.",
            )}
          </p>
          <Link href="/offres">
            <Button variant="gold" size="lg" className="mt-6">
              {t("Voir les offres", "Browse offers")}
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {bookings.map((b) => {
            const offer = offerById(b.offerId);
            if (!offer) return null;
            const cat = categoryOf(offer.category);
            return (
              <li
                key={b.ref}
                className="overflow-hidden rounded-3xl bg-paper ring-1 ring-line sm:flex"
              >
                <div className="relative h-40 shrink-0 sm:h-auto sm:w-44">
                  <Image
                    src={offer.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 11rem, 100vw"
                    className="object-cover"
                  />
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
                    {/* Pas de QR code (arbitrage client) : c'est le nom qui fait
                        la réservation, on le rappelle donc ici. */}
                    <p className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-brand" />
                      {t(
                        `À l'accueil, présentez-vous au nom de ${fullName}.`,
                        `At the front desk, give the name ${fullName}.`,
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
                        <span className="text-sm text-ink-soft line-through">
                          {formatEuro(offer.basePrice)}
                        </span>
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
          })}
        </ul>
      )}

      <p className="mt-10 text-xs text-ink-soft">
        {t(
          "Démo : votre compte et vos réservations vivent dans ce navigateur, rien n'est envoyé à un serveur.",
          "Demo: your account and bookings live in this browser, nothing is sent to a server.",
        )}
      </p>
    </div>
  );
}
