"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";
import type { Offer } from "@/lib/site";
import { categoryOf } from "@/lib/site";
import { useLivePrice } from "@/components/use-live-price";
import { UrgencyMeter } from "@/components/urgency-meter";
import { formatEuro, slotLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function OfferCard({ offer, priority = false }: { offer: Offer; priority?: boolean }) {
  const live = useLivePrice(offer.basePrice, offer.placesLeft, offer.startsInHours);
  const cat = categoryOf(offer.category);
  const discounted = live.discountPct > 0;

  return (
    <Link
      href={`/offres/${offer.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-paper shadow-soft ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={offer.image}
          alt={`${offer.title} — ${offer.gym}`}
          fill
          sizes="(max-width:768px) 100vw, 380px"
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink backdrop-blur">
            {cat.emoji} {cat.label}
          </span>
        </div>

        {discounted && (
          <span
            className={cn(
              "absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow",
              live.isFinalSprint ? "bg-ember-deep" : "bg-ember",
            )}
          >
            −{live.discountPct}%
          </span>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <p className="text-xs text-white/80">{offer.arrondissement} · {offer.distanceKm} km</p>
            <p className="font-medium leading-tight">{offer.gym}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs backdrop-blur">
            <Star className="h-3 w-3 fill-current" /> {offer.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-medium leading-snug text-ink">{offer.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
            <MapPin className="h-3 w-3" /> {slotLabel(live.remainingHours)} · {offer.durationMin} min
          </p>
        </div>

        <UrgencyMeter heat={live.heat} remainingHours={live.remainingHours} />

        <div className="mt-auto flex items-end justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "font-display text-3xl font-medium tabular-nums transition-colors",
                discounted ? "text-ember-deep" : "text-ink",
              )}
            >
              {formatEuro(live.currentPrice)}
            </span>
            {discounted && (
              <span className="text-sm text-ink-soft line-through tabular-nums">
                {formatEuro(offer.basePrice)}
              </span>
            )}
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              offer.placesLeft <= 2 ? "bg-ember/12 text-ember-deep" : "bg-peri-tint text-peri-deep",
            )}
          >
            {offer.placesLeft} {offer.placesLeft > 1 ? "places" : "place"}
          </span>
        </div>
      </div>
    </Link>
  );
}
