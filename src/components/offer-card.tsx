"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Offer } from "@/lib/site";
import { categoryOf } from "@/lib/site";
import { useLivePrice } from "@/components/use-live-price";
import { formatEuro } from "@/lib/format";
import { useT } from "@/lib/i18n";

/**
 * Carte d'offre redessinée d'après la maquette cliente : carte blanche,
 * pastille « places restantes » sur la photo, prix plein barré + prix du moment
 * en or, adresse complète, professeur, et bouton or portant le prix.
 */
export function OfferCard({ offer, priority = false }: { offer: Offer; priority?: boolean }) {
  const live = useLivePrice(offer.basePrice, offer.placesLeft, offer.startsInHours);
  const cat = categoryOf(offer.category);
  const discounted = live.discountPct > 0;
  const t = useT();
  const soldOut = offer.placesLeft === 0;

  return (
    <Link
      href={`/offres/${offer.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-paper shadow-soft ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={offer.image}
          alt={`${offer.title} — ${offer.gym}`}
          fill
          sizes="(max-width:768px) 100vw, 380px"
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-brand-deep px-2.5 py-1 text-xs font-medium text-white shadow">
          {soldOut
            ? t("complet", "sold out")
            : `${offer.placesLeft} ${offer.placesLeft > 1 ? t("places restantes", "spots left") : t("place restante", "spot left")}`}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
            {cat.label}
            <span className="flex items-center gap-1 text-base font-bold">
              <Star className="h-4 w-4 text-gold" fill="currentColor" />
              {offer.rating.toFixed(1)}
            </span>
          </h3>
          <p className="flex items-baseline gap-2">
            {discounted && (
              <span className="text-sm tabular-nums text-ink-soft line-through">
                {formatEuro(offer.basePrice)}
              </span>
            )}
            <span className="font-display text-2xl font-bold tabular-nums text-gold-deep">
              {formatEuro(live.currentPrice)}
            </span>
          </p>
        </div>

        <p className="mt-2 text-sm text-ink">
          {offer.gym} · {offer.arrondissement}
        </p>
        <p className="text-sm text-ink-soft">{offer.address}</p>
        <p className="text-sm text-ink-soft">{offer.distanceKm} km</p>

        <p className="mt-4 flex items-center gap-2 text-sm text-ink">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-full bg-brand-tint text-xs font-semibold text-brand"
          >
            {offer.coach.slice(0, 1)}
          </span>
          {offer.coach}
        </p>

        <span className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gold-bright px-5 py-3 text-sm font-semibold text-ink transition-colors group-hover:bg-gold">
          {t("Réserver maintenant", "Book now")} · {formatEuro(live.currentPrice)}
        </span>
      </div>
    </Link>
  );
}
