"use client";

import Link from "next/link";
import { ArrowLeft, Check, Star, MapPin, Clock, Users, ShieldCheck, Footprints } from "lucide-react";
import type { Offer } from "@/lib/site";
import { categoryOf } from "@/lib/site";
import { useLivePrice } from "@/components/use-live-price";
import { LeafletMap } from "@/components/offers/leaflet-map";
import { useGeolocation } from "@/components/use-geolocation";
import { distanceKm } from "@/lib/geo";
import { OfferCard } from "@/components/offer-card";
import { formatEuro, slotLabel } from "@/lib/format";
import { useSyncExternalStore } from "react";
import { useLocale, useT } from "@/lib/i18n";
import { addToCart, useCart } from "@/lib/cart";

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

/*
  `isSecureContext`, lu comme un magasin externe plutôt que posé dans un effet :
  c'est la convention du projet (voir `lib/i18n.tsx`), et la règle de lint
  interdit `setState` dans un effet. La valeur ne change jamais au cours d'une
  page, d'où l'abonnement vide. Le rendu serveur répond « sécurisé » : aucun
  message ne s'affiche avant que le navigateur ait tranché.
*/
const noSubscribe = () => () => {};
const isSecure = () => window.isSecureContext;
const isSecureOnServer = () => true;

export interface NearbyOffer {
  offer: Offer;
  /** Distance depuis le cours consulté, en km (calculée côté serveur). */
  km: number;
  sameGym: boolean;
}

export function OfferDetail({ offer, nearby }: { offer: Offer; nearby: NearbyOffer[] }) {
  const t = useT();
  const { locale } = useLocale();
  const live = useLivePrice(offer.basePrice, offer.placesLeft, offer.startsInHours);

  /*
    Le prix est figé au moment de la mise au panier : la dégressivité continue
    de courir seconde après seconde, mais le montant annoncé au panier doit
    être celui qui sera débité, sinon il bougerait sous les yeux du client.
  */
  const inCart = useCart().some((i) => i.offerId === offer.id);
  const cat = categoryOf(offer.category);
  const discounted = live.currentPrice < offer.basePrice;

  /*
    Position du visiteur, SANS demande spontanée : le hook rend la dernière
    position obtenue si elle date de moins de cinq minutes. Quelqu'un qui a déjà
    accepté la géolocalisation sur l'accueil ou sur `/offres` voit donc sa
    position et sa distance sans qu'on le sollicite à nouveau ; les autres ont un
    bouton. Ouvrir une fiche ne doit pas déclencher une demande de permission.
  */
  const geo = useGeolocation();
  const me = geo.position;

  /*
    Les navigateurs réservent la géolocalisation aux origines sécurisées.
    `localhost` bénéficie d'une exception, mais pas une adresse IP en http :
    depuis un téléphone sur le réseau local, l'appel échoue immédiatement et
    l'interface annonçait « Localisation refusée », ce qui envoyait chercher la
    cause du mauvais côté. On distingue donc les deux situations.

    Lu APRÈS le montage : `isSecureContext` n'existe pas au rendu serveur, et le
    lire pendant le rendu ferait diverger l'hydratation.
  */
  const insecure = !useSyncExternalStore(noSubscribe, isSecure, isSecureOnServer);
  const km = me ? distanceKm(me, { lat: offer.lat, lng: offer.lng }) : null;
  /* 4,8 km/h : allure de marche en ville. C'est une estimation à vol d'oiseau,
     d'où le libellé « à pied » et non « temps de trajet ». */
  const walkMin = km === null ? null : Math.max(1, Math.round((km / 4.8) * 60));

  return (
    <div className="bg-paper">
      <div className="ff-container max-w-4xl py-8">
        <Link
          href="/offres"
          className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> {t("Toutes les offres", "All offers")}
        </Link>

        {/*
          La carte prend la place de la photo, en tête de fiche : ce qu'on
          cherche ici, c'est OÙ est le cours, pas à quoi ressemble la salle.

          Cadrage serré (zoom 16, l'adresse exacte), et non la vue large de
          l'accueil. Dès que la position du visiteur est connue, `focus` fait
          cadrer la carte sur les deux points à la fois : on voit d'un coup le
          studio, soi-même, et la distance qui sépare les deux.
        */}
        <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-line">
          <div className="h-[300px] sm:h-[400px]">
            <LeafletMap
              points={[{ id: offer.id, lat: offer.lat, lng: offer.lng, label: formatEuro(live.currentPrice) }]}
              center={[offer.lat, offer.lng]}
              zoom={16}
              showUser
              frameOnUser={false}
              me={me}
              onLocate={() => geo.request()}
              locating={geo.state === "asking"}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 bg-paper px-4 py-3 text-sm">
            <p className="flex items-center gap-2 text-ink">
              <MapPin className="h-4 w-4 shrink-0 text-brand" />
              {offer.address}
            </p>

            {km !== null ? (
              <p className="flex items-center gap-2 font-medium text-ink">
                <Footprints className="h-4 w-4 shrink-0 text-brand" />
                {t(
                  `À ${km.toFixed(1)} km de vous, environ ${walkMin} min à pied`,
                  `${km.toFixed(1)} km away, about ${walkMin} min on foot`,
                )}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => geo.request()}
                disabled={insecure || geo.state === "asking" || geo.state === "denied"}
                className="text-left text-brand underline underline-offset-4 transition-colors hover:text-brand-deep disabled:opacity-60 disabled:no-underline"
              >
                {insecure
                  ? t(
                      "Distance indisponible : la géolocalisation exige une connexion sécurisée (https).",
                      "Distance unavailable: location needs a secure (https) connection.",
                    )
                  : geo.state === "asking"
                    ? t("Localisation…", "Locating…")
                    : geo.state === "denied"
                      ? t("Localisation refusée", "Location denied")
                      : t("Voir la distance depuis chez vous", "See how far it is from you")}
              </button>
            )}
          </div>
        </div>

        {/* en-tête éditorial */}
        <p className="eyebrow mt-8 text-brand">{t(cat.label, cat.labelEn)}</p>
        <h1 className="display mt-3 text-[clamp(2rem,5vw,3.25rem)] text-ink">{t(offer.title, offer.titleEn)}</h1>
        <p className="mt-3 text-lg text-ink-soft">
          {offer.gym}. {t("Professeure :", "Instructor:")}{" "}
          <span className="font-bold text-ink">{offer.coach}</span>
        </p>

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
            {offer.gym}. {offer.arrondissement}
          </p>

          {/*
            « Réserver » pose la place au panier au prix affiché à cet instant,
            et le paiement se fait une seule fois depuis `/panier`. On ne demande
            donc ni carte ni compte ici : la connexion n'arrive qu'au paiement.
          */}
          {inCart ? (
            <Link
              href="/panier"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-base font-bold text-brand-deep transition-colors hover:bg-gold-bright hover:text-ink"
            >
              <Check className="h-5 w-5" /> {t("Au panier, finaliser", "In cart, check out")}
            </Link>
          ) : (
            <button
              onClick={() => addToCart(offer.id, live.currentPrice)}
              className="mt-6 w-full rounded-full bg-gold-bright px-6 py-4 text-base font-bold text-ink transition-colors hover:bg-gold"
            >
              {t("Réserver la place", "Book this spot")}
            </button>
          )}
          <p className="mt-4 text-center">
            {inCart ? (
              <Link href="/offres" className="text-sm text-white/90 underline underline-offset-4 hover:text-gold">
                {t("Ajouter un autre cours", "Add another class")}
              </Link>
            ) : (
              <Link href="/offres" className="text-sm text-white/90 underline underline-offset-4 hover:text-gold">
                {t("Consulter nos autres offres de cours", "Browse our other class offers")}
              </Link>
            )}
          </p>
        </div>

      </div>

      {nearby.length > 0 && (
        <div className="ff-container pb-20">
          <h2 className="display text-2xl text-ink sm:text-3xl">
            {t("Autres créneaux à proximité", "Other slots nearby")}
          </h2>
          <p className="mt-2 text-ink-soft">
            {t(
              "Au même centre, ou à quelques minutes de là.",
              "At the same centre, or a few minutes away.",
            )}
          </p>

          {/* Format compact, comme le bandeau de l'accueil, avec la distance
              depuis CE cours : c'est ce qui rend la suggestion lisible. */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((n) => (
              <OfferCard
                key={n.offer.id}
                offer={n.offer}
                dense
                priceTone="bordeaux"
                distanceLabel={
                  n.sameGym
                    ? t("même centre", "same centre")
                    : t(`à ${n.km.toFixed(1)} km d'ici`, `${n.km.toFixed(1)} km from here`)
                }
              />
            ))}
          </div>
        </div>
      )}
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
