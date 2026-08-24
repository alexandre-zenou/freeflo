"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Offer } from "@/lib/site";
import { categoryOf } from "@/lib/site";
import { useLivePrice } from "@/components/use-live-price";
import { formatEuro } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Carte d'offre, calée sur la maquette Canva (styles relevés le 07/08/2026).
 *
 * Retour client :
 * · le prix remisé passe en OR (`--gold`, exactement la couleur de son « €20 ») ;
 * · le prix plein barré est en encre, pas en gris ;
 * · format plus large et moins haut (photo en 16/9, contenu resserré) ;
 * · le libellé du bouton doit tenir sur une ligne.
 *
 * `dense` réduit encore la hauteur pour les grilles de 4 colonnes du bandeau
 * « Réservez maintenant ».
 */
export function OfferCard({
  offer,
  priority = false,
  dense = false,
  priceTone = "gold",
  distanceLabel,
}: {
  offer: Offer;
  priority?: boolean;
  dense?: boolean;
  /** Distance affichée sous l'adresse. Utilisée par les suggestions de la fiche
   *  offre ; ailleurs la carte n'en montre pas, la cliente les avait fait
   *  retirer de l'en-tête (point F35). */
  distanceLabel?: string;
  /** « bordeaux » : demandé pour le bloc « D'autres créneaux à saisir ». */
  priceTone?: "gold" | "bordeaux";
}) {
  const live = useLivePrice(offer.basePrice, offer.placesLeft, offer.startsInHours);
  const cat = categoryOf(offer.category);
  const discounted = live.discountPct > 0;
  const t = useT();
  const soldOut = offer.placesLeft === 0;

  /*
    `h-full` : en enfant direct d'une grille, l'étirement suffisait ; mais dès que
    la carte est enveloppée (vue carte de `/offres`, où un `div` porte l'anneau de
    survol), c'est le wrapper qui s'étire et le lien gardait la hauteur de son
    contenu — 20 px d'écart entre deux cartes d'une rangée, et les boutons
    « Réserver » décalés d'autant. Avec `h-full` la carte remplit son parent dans
    les deux cas, et le `mt-auto` du bouton fait le reste.
  */
  return (
    <Link
      href={`/offres/${offer.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-paper shadow-soft ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className={cn("relative overflow-hidden", dense ? "aspect-[16/9]" : "aspect-[16/10]")}>
        <Image
          src={offer.image}
          alt={`${offer.title} chez ${offer.gym}`}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/*
          ATTENTION, décision du 24/08/2026 : ce badge affiche un TAUX DE REMISE.
          Le retour client du 07/08 l'interdit explicitement (point F34, « ne
          jamais mettre le taux de réduction ») et c'est pourquoi la pastille de
          droite montre les places restantes. Ajouté sur demande expresse, à
          l'essai. Pour le retirer, supprimer ce seul bloc : rien d'autre n'en
          dépend, la pastille de droite est indépendante.

          La valeur vient de `live`, recalculé chaque seconde : elle suit donc le
          prix quand le cours franchit un palier, elle n'est jamais figée.
          En sprint final (moins de 2 h) le badge passe au rouge de la marque :
          c'est le repère d'urgence, l'or signalant la bonne affaire.
        */}
        {discounted && !soldOut && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums shadow",
              live.isFinalSprint ? "bg-brand text-white" : "bg-gold-bright text-ink",
            )}
          >
            -{Math.round(live.discountPct)} %
          </span>
        )}

        <span className="absolute right-3 top-3 rounded-full bg-brand-deep px-2.5 py-1 text-xs font-medium text-white shadow">
          {soldOut
            ? t("complet", "sold out")
            : `${offer.placesLeft} ${offer.placesLeft > 1 ? t("places restantes", "spots left") : t("place restante", "spot left")}`}
        </span>
      </div>

      <div className={cn("flex flex-1 flex-col", dense ? "p-4" : "p-5")}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
            {t(cat.label, cat.labelEn)}
            <span className="flex items-center gap-1 text-base font-bold">
              <Star className="h-4 w-4 text-gold" fill="currentColor" />
              {offer.rating.toFixed(1)}
            </span>
          </h3>
          <p className="flex items-baseline gap-2">
            {discounted && (
              <span className="text-sm font-bold tabular-nums text-ink line-through">
                {formatEuro(offer.basePrice)}
              </span>
            )}
            <span
              className={cn(
                "font-display text-2xl font-bold tabular-nums",
                priceTone === "bordeaux" ? "text-brand-deep" : "text-gold",
              )}
            >
              {formatEuro(live.currentPrice)}
            </span>
          </p>
        </div>

        {/* Adresse condensée : la maquette tient sur deux lignes, pas quatre. */}
        <p className="mt-1.5 text-sm text-ink">
          {offer.gym}, {offer.arrondissement}
        </p>
        <p className="text-sm text-ink-soft">
          {offer.address}
          {distanceLabel ? `, ${distanceLabel}` : ""}
        </p>

        <p className={cn("mb-4 flex items-center gap-2 text-sm text-ink", dense ? "mt-2.5" : "mt-3")}>
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-full bg-brand-tint text-xs font-semibold text-brand"
          >
            {offer.coach.slice(0, 1)}
          </span>
          {offer.coach}
        </p>

        {/* `mt-auto` cale le bouton en bas : les cartes d'une même rangée s'alignent.
            `whitespace-nowrap` garantit la ligne unique demandée par la cliente. */}
        <span className="mt-auto inline-flex w-full items-center justify-center whitespace-nowrap rounded-full bg-gold-bright px-4 py-3 text-sm font-bold text-ink transition-colors group-hover:bg-gold">
          {t("Réserver à", "Book at")} {formatEuro(live.currentPrice)}
        </span>
      </div>
    </Link>
  );
}
