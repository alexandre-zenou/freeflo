"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, MapPin, Clock, Users, ShieldCheck, Sparkles } from "lucide-react";
import type { Offer } from "@/lib/site";
import { categoryOf } from "@/lib/site";
import { useLivePrice } from "@/components/use-live-price";
import { UrgencyMeter } from "@/components/urgency-meter";
import { BookingFlow } from "@/components/offers/booking-flow";
import { LeafletMap } from "@/components/offers/leaflet-map";
import { OfferCard } from "@/components/offer-card";
import { Button } from "@/components/ui/button";
import { formatEuro, slotLabel } from "@/lib/format";

const included = ["Matériel fourni", "Vestiaires & douches", "Coach diplômé", "Tous niveaux bienvenus"];

export function OfferDetail({ offer, similar }: { offer: Offer; similar: Offer[] }) {
  const live = useLivePrice(offer.basePrice, offer.placesLeft, offer.startsInHours);
  const [booking, setBooking] = useState(false);
  const cat = categoryOf(offer.category);

  return (
    <div className="ff-container py-8">
      <Link href="/offres" className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Toutes les offres
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* left: media + content */}
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl ring-1 ring-line">
            <Image src={offer.image} alt={`${offer.title} — ${offer.gym}`} fill priority sizes="(max-width:1024px) 100vw, 700px" className="object-cover" />
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-ink backdrop-blur">
              {cat.emoji} {cat.label}
            </span>
            {live.discountPct > 0 && (
              <span className="absolute right-4 top-4 rounded-full bg-ember px-3 py-1 text-sm font-semibold text-white">
                −{live.discountPct}% en ce moment
              </span>
            )}
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-3 text-sm text-ink-soft">
              <span className="flex items-center gap-1 font-medium text-ink">
                <Star className="h-4 w-4 fill-ember text-ember" /> {offer.rating.toFixed(1)}
              </span>
              <span>· {offer.reviews} avis</span>
              <span>· {offer.arrondissement} · {offer.distanceKm} km</span>
            </div>
            <h1 className="display mt-2 text-3xl text-ink sm:text-4xl">{offer.title}</h1>
            <p className="mt-1 text-lg text-ink-soft">{offer.gym} · avec {offer.coach}</p>

            <p className="mt-6 max-w-prose leading-relaxed text-ink/80">{offer.description}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {included.map((f) => (
                <div key={f} className="flex items-center gap-2 rounded-xl bg-paper px-4 py-3 text-sm ring-1 ring-line">
                  <Sparkles className="h-4 w-4 text-peri-deep" /> {f}
                </div>
              ))}
            </div>

            {/* mini map + address */}
            <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-line">
              <div className="h-52">
                <LeafletMap
                  points={[{ id: offer.id, lat: offer.lat, lng: offer.lng }]}
                  center={[offer.lat, offer.lng]}
                  zoom={15}
                  interactive={false}
                />
              </div>
              <p className="flex items-center gap-2 bg-paper px-4 py-3 text-sm text-ink">
                <MapPin className="h-4 w-4 text-peri-deep" /> {offer.address}
              </p>
            </div>
          </div>
        </div>

        {/* right: sticky booking panel */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-paper p-6 shadow-lift ring-1 ring-line">
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-medium text-ember-deep">{formatEuro(live.currentPrice)}</span>
                {live.discountPct > 0 && <span className="text-lg text-ink-soft line-through">{formatEuro(offer.basePrice)}</span>}
              </div>
            </div>
            {live.savings > 0 && (
              <p className="mt-1 text-sm font-medium text-ember-deep">Vous économisez {formatEuro(live.savings)}</p>
            )}

            <div className="mt-5">
              <UrgencyMeter heat={live.heat} remainingHours={live.remainingHours} />
            </div>

            <div className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
              <Row icon={<Clock className="h-4 w-4" />} label="Créneau" value={`${slotLabel(offer.startsInHours)} · ${offer.durationMin} min`} />
              <Row icon={<Users className="h-4 w-4" />} label="Places restantes" value={`${offer.placesLeft}`} />
              <Row icon={<ShieldCheck className="h-4 w-4" />} label="Annulation" value="Gratuite -6 h avant" />
            </div>

            <Button variant="ember" size="lg" className="mt-6 w-full" onClick={() => setBooking(true)}>
              Réserver ma place
            </Button>
            <p className="mt-3 text-center text-xs text-ink-soft">Le prix peut encore baisser… ou la place partir.</p>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-20">
          <h2 className="display text-2xl text-ink sm:text-3xl">D&apos;autres cours qui partent</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
        </div>
      )}

      <BookingFlow offer={offer} price={live.currentPrice} open={booking} onClose={() => setBooking(false)} />
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-peri-deep">{icon}</span>
      <span className="text-ink-soft">{label}</span>
      <span className="ml-auto font-medium text-ink">{value}</span>
    </div>
  );
}
