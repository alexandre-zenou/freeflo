"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, MapPin, Clock, Users, ShieldCheck } from "lucide-react";
import type { Offer } from "@/lib/site";
import { categoryOf } from "@/lib/site";
import { useLivePrice } from "@/components/use-live-price";
import { BookingFlow } from "@/components/offers/booking-flow";
import { LeafletMap } from "@/components/offers/leaflet-map";
import { OfferCard } from "@/components/offer-card";
import { formatEuro, slotLabel } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";

/**
 * Fiche offre, refaite d'après la disposition envoyée par la cliente
 * (retour 08/2026, planches 14 et 15) :
 *
 * · fond BLANC (son pantone, #ffffff), pas beige ;
 * · en-tête éditorial : catégorie, titre, centre et professeur AVANT la photo ;
 * · sur la photo, une pastille « N places restantes » — jamais le taux de remise ;
 * · sous la description, une carte BORDEAUX qui porte le prix en or, le prix plein
 *   barré, le nombre de places, le bouton jaune et le lien vers les autres offres.
 *
 * La jauge d'urgence et le bandeau « sprint final » ont disparu : ils exposaient
 * indirectement la mécanique de remise.
 */
const included = ["Matériel fourni", "Vestiaires & douches", "Coach diplômé", "Tous niveaux bienvenus"];
const includedEn = ["Equipment provided", "Changing rooms & showers", "Qualified coach", "All levels welcome"];

export function OfferDetail({ offer, similar }: { offer: Offer; similar: Offer[] }) {
  const t = useT();
  const { locale } = useLocale();
  const live = useLivePrice(offer.basePrice, offer.placesLeft, offer.startsInHours);
  const [booking, setBooking] = useState(false);
  const cat = categoryOf(offer.category);
  const discounted = live.currentPrice < offer.basePrice;
  const placesLabel =
    offer.placesLeft > 1
      ? `${offer.placesLeft} ${t("places restantes", "spots left")}`
      : `${offer.placesLeft} ${t("place restante", "spot left")}`;

  return (
    <div className="bg-paper">
      <div className="ff-container max-w-4xl py-8">
        <Link
          href="/offres"
          className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> {t("Toutes les offres", "All offers")}
        </Link>

        {/* en-tête éditorial */}
        <p className="eyebrow mt-8 text-brand">{t(cat.label, cat.labelEn)}</p>
        <h1 className="display mt-3 text-[clamp(2rem,5vw,3.25rem)] text-ink">{t(offer.title, offer.titleEn)}</h1>
        <p className="mt-3 text-lg text-ink-soft">
          {offer.gym}. {t("Professeure :", "Instructor:")}{" "}
          <span className="font-bold text-ink">{offer.coach}</span>
        </p>

        {/* photo */}
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-line">
          <Image
            src={offer.image}
            alt={`${offer.title} chez ${offer.gym}`}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 900px"
            className="object-cover"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-ink backdrop-blur">
            {t(cat.label, cat.labelEn)}
          </span>
          <span className="absolute right-4 top-4 rounded-full bg-brand-deep px-3.5 py-1.5 text-sm font-bold text-white shadow">
            {placesLabel}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 fill-gold text-gold" />
          <span className="font-bold text-ink">{offer.rating.toFixed(1)}</span>
          <span className="text-ink-soft">{offer.reviews} {t("avis", "reviews")}</span>
        </div>

        <p className="mt-5 max-w-prose leading-relaxed text-ink/80">{t(offer.description, offer.descriptionEn)}</p>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-y border-line py-5">
          {included.map((f, i) => (
            <span key={f} className="text-sm text-ink-soft">
              {t(f, includedEn[i])}
            </span>
          ))}
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <Row icon={<Clock className="h-4 w-4" />} label={t("Créneau", "Time slot")} value={`${slotLabel(offer.startsInHours, locale)}, ${offer.durationMin} min`} />
          <Row icon={<Users className="h-4 w-4" />} label={t("Places restantes", "Spots left")} value={`${offer.placesLeft}`} />
          <Row icon={<ShieldCheck className="h-4 w-4" />} label={t("Annulation", "Cancellation")} value={t("Gratuite jusqu'à 6 h avant", "Free up to 6 h before")} />
        </dl>

        {/* carte de réservation bordeaux — le bloc central de sa maquette */}
        <div className="mt-10 rounded-3xl bg-brand-deep p-7 text-white shadow-lift sm:p-9">
          <p className="flex flex-wrap items-baseline gap-3">
            <span className="font-display text-[clamp(2.2rem,6vw,3rem)] font-bold tabular-nums text-gold">
              {formatEuro(live.currentPrice)}
            </span>
            {discounted && (
              <span className="text-xl font-bold tabular-nums text-white/70 line-through">
                {formatEuro(offer.basePrice)}
              </span>
            )}
          </p>

          <p className="mt-3 flex items-center gap-2 text-sm text-white/90">
            <Clock className="h-4 w-4 shrink-0 text-gold" />
            {offer.placesLeft > 1
              ? t(
                  `Il ne te reste plus que ${offer.placesLeft} places vacantes pour ce cours !`,
                  `Only ${offer.placesLeft} spots left for this class!`,
                )
              : t(
                  "Il ne te reste plus qu'une place vacante pour ce cours !",
                  "Only one spot left for this class!",
                )}
          </p>

          <div className="mt-6 flex items-center gap-3 border-t border-white/20 pt-6">
            <span className="display text-2xl text-white">{t(cat.label, cat.labelEn)}</span>
            <span className="flex items-center gap-1.5 text-lg font-bold text-gold">
              <Star className="h-5 w-5" /> {offer.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-1 text-white/80">
            {offer.gym}. {offer.arrondissement}, {offer.distanceKm} km
          </p>

          <button
            onClick={() => setBooking(true)}
            className="mt-6 w-full rounded-full bg-gold-bright px-6 py-4 text-base font-bold text-ink transition-colors hover:bg-gold"
          >
            {t("Réserver la place", "Book this spot")}
          </button>
          <p className="mt-4 text-center">
            <Link href="/offres" className="text-sm text-white/90 underline underline-offset-4 hover:text-gold">
              {t("Consulter nos autres offres de cours", "Browse our other class offers")}
            </Link>
          </p>
        </div>

        {/* plan + adresse */}
        <div className="mt-10 overflow-hidden rounded-2xl ring-1 ring-line">
          <div className="h-52">
            <LeafletMap
              points={[{ id: offer.id, lat: offer.lat, lng: offer.lng }]}
              districts={[{ label: offer.arrondissement, lat: offer.lat + 0.0016, lng: offer.lng }]}
              center={[offer.lat, offer.lng]}
              zoom={15}
              interactive={false}
            />
          </div>
          <p className="flex items-center gap-2 bg-paper px-4 py-3 text-sm text-ink">
            <MapPin className="h-4 w-4 text-brand" /> {offer.address}
          </p>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="ff-container pb-20">
          <h2 className="display text-2xl text-ink sm:text-3xl">{t("D\u2019autres créneaux à saisir", "More slots worth grabbing")}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((o) => (
              <OfferCard key={o.id} offer={o} priceTone="bordeaux" />
            ))}
          </div>
        </div>
      )}

      {/* `key` remonte le composant à chaque ouverture : l'étape repart de zéro
          sans avoir à remettre l'état à jour dans un effet. */}
      <BookingFlow
        key={booking ? "open" : "closed"}
        offer={offer}
        price={live.currentPrice}
        open={booking}
        onClose={() => setBooking(false)}
      />
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-brand">{icon}</span>
      <dt className="text-ink-soft">{label}</dt>
      <dd className="ml-auto font-medium text-ink">{value}</dd>
    </div>
  );
}
