"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutFlow } from "@/components/offers/checkout-flow";
import { categoryOf, offerById } from "@/lib/site";
import { formatEuro, slotLabel } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";
import { addBooking, bookingRef, useHydrated, useMember } from "@/lib/account";
import { cartTotal, clearCart, removeFromCart, useCart, type CartItem } from "@/lib/cart";

/**
 * Le panier. « Réserver » sur une offre pose la place ici, le paiement se fait
 * une seule fois pour tout le panier.
 *
 * On peut remplir son panier sans compte : c'est au moment de payer que la
 * connexion devient nécessaire, avec `next=/panier` pour revenir exactement ici.
 * La réservation s'inscrit ensuite sur le compte (visible dans `/compte`).
 */
export function CartView() {
  const t = useT();
  const { locale } = useLocale();
  const router = useRouter();
  const hydrated = useHydrated();
  const member = useMember();
  const items = useCart();

  /*
    Le tunnel travaille sur une COPIE du panier, prise à l'ouverture : la
    confirmation vide le panier, et sans cette copie la carte de confirmation
    se retrouverait sans lignes au moment même où elle s'affiche.
  */
  const [checkoutItems, setCheckoutItems] = useState<CartItem[] | null>(null);
  /** Message d'erreur du paiement, affiché au-dessus du total. */
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const params = useSearchParams();
  const retour = params.get("paiement");
  const sessionId = params.get("session");
  /* Une session déjà traitée ne doit pas l'être deux fois : l'effet se rejoue
     au double montage de StrictMode, et le panier serait inscrit en double. */
  const traitees = useRef<Set<string>>(new Set());
  /** Réservations inscrites après un paiement Stripe confirmé. */
  const [confirme, setConfirme] = useState<CartItem[] | null>(null);

  /*
    Retour de Stripe. L'inscription des réservations n'a lieu qu'APRÈS que le
    serveur a confirmé le paiement auprès de Stripe : le retour passe par
    l'URL du navigateur, et `/panier?paiement=ok` se tape à la main.

    Placé avant le garde-fou d'hydratation : un hook ne peut pas vivre après un
    `return`, l'ordre des hooks doit être le même à chaque rendu.
  */
  useEffect(() => {
    /*
      ATTENDRE L'HYDRATATION, sans quoi rien ne s'inscrit.

      `useCart` s'appuie sur `useSyncExternalStore` : au premier rendu client,
      React sert l'instantané du SERVEUR pour coller au balisage prérendu, et
      cet instantané est toujours un panier VIDE. L'effet partait donc avec
      zéro ligne, n'inscrivait aucune réservation, et le garde-fou anti-doublon
      ci-dessous condamnait la seconde passe, la seule qui avait les vraies
      lignes. Résultat : Stripe encaissait, et le compte restait vide.

      `useHydrated` bascule à vrai juste après l'hydratation, exactement quand
      `items` porte enfin le contenu du navigateur.
    */
    if (!hydrated) return;
    if (retour !== "ok" || !sessionId) return;
    if (traitees.current.has(sessionId)) return;
    traitees.current.add(sessionId);

    let abandonne = false;
    (async () => {
      try {
        const r = await fetch(`/api/paiement/verifier?session=${encodeURIComponent(sessionId)}`);
        const data = await r.json();
        if (abandonne) return;
        if (!data.paid) {
          setErreur("Ce paiement n'a pas été confirmé par Stripe.");
          return;
        }
        /* Copie AVANT de vider : la carte de confirmation lit cette liste, et
           se retrouverait vide au moment même de s'afficher. */
        const copie = items.slice();
        if (copie.length === 0) {
          /* Panier vide alors que Stripe a encaissé : le plus souvent une page
             de retour rouverte plus tard, les réservations étant déjà posées.
             On ne montre pas une confirmation à zéro ligne. */
          setErreur(
            t(
              "Paiement bien reçu. Vos réservations sont dans « Mes cours ».",
              "Payment received. Your bookings are in “My classes”.",
            ),
          );
          return;
        }
        copie.forEach((item) => {
          const offer = offerById(item.offerId);
          if (!offer) return;
          addBooking({
            offerId: offer.id,
            price: item.price,
            ref: bookingRef(offer.id, offer.basePrice, offer.placesLeft),
            bookedAt: Date.now(),
            startsAt: Date.now() + offer.startsInHours * 3_600_000,
          });
        });
        clearCart();
        setConfirme(copie);
      } catch {
        if (!abandonne) setErreur("Impossible de joindre le serveur de paiement.");
      }
    })();

    return () => {
      abandonne = true;
    };
  }, [hydrated, retour, sessionId, items, t]);


  /* Le panier vit dans le navigateur : avant hydratation, le serveur ne peut
     que le rendre vide. On tient la place plutôt que d'annoncer à tort un
     panier vide à quelqu'un qui vient d'y mettre deux cours. */
  if (!hydrated) {
    return (
      <div className="ff-container max-w-3xl py-16">
        <div className="h-8 w-56 animate-pulse rounded-full bg-secondary" />
        <div className="mt-8 h-40 w-full animate-pulse rounded-3xl bg-secondary" />
      </div>
    );
  }

  const lines = items
    .map((item) => ({ item, offer: offerById(item.offerId) }))
    .filter((l): l is { item: (typeof items)[number]; offer: NonNullable<typeof l.offer> } =>
      Boolean(l.offer),
    );
  const total = cartTotal(lines.map((l) => l.item));

  /*
    « Annulé » se DÉDUIT de l'URL, sans effet ni état : Stripe nous a renvoyés
    sans encaisser, le panier est intact, il n'y a rien à synchroniser.
  */
  const messageErreur =
    erreur ??
    (retour === "annule" ? t("Paiement annulé. Votre panier est intact.", "Payment cancelled. Your cart is untouched.") : null);

  /* Payer exige un compte : c'est le seul point du parcours qui en demande un,
     et le paiement en est le moment naturel. */
  const pay = async () => {
    if (!member) {
      router.push("/connexion?next=%2Fpanier");
      return;
    }

    setErreur(null);
    setEnvoi(true);
    try {
      const r = await fetch("/api/paiement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lignes: lines.map(({ item }) => ({ offerId: item.offerId, price: item.price })),
        }),
      });

      if (r.status === 503) {
        /*
          Stripe n'est pas configuré sur cet environnement : on retombe sur le
          tunnel simulé, celui de la maquette. C'est ce qui permet à la démo de
          continuer de tourner sur une préversion sans clés.
        */
        setEnvoi(false);
        setCheckoutItems(lines.map((l) => l.item));
        return;
      }

      const data = await r.json();
      if (!r.ok || !data.url) {
        setEnvoi(false);
        setErreur(data.error ?? t("Le paiement n'a pas pu démarrer.", "Payment could not start."));
        return;
      }

      /* `assign` et non le routeur de Next : Stripe est un autre domaine.
         (`location.href = …` est refusé par la règle `react-hooks/immutability`,
         qui interdit d'écrire dans une valeur définie hors du composant.)
         On ne remet PAS `envoi` à faux : la page est en train d'être quittée. */
      window.location.assign(data.url);
    } catch {
      setEnvoi(false);
      setErreur(t("Impossible de joindre le serveur de paiement.", "Could not reach the payment server."));
    }
  };

  const confirm = () => {
    lines.forEach(({ item, offer }) =>
      addBooking({
        offerId: offer.id,
        price: item.price,
        ref: bookingRef(offer.id, offer.basePrice, offer.placesLeft),
        bookedAt: Date.now(),
        /* Le seul instant où le délai relatif de l'offre peut être converti en
           date réelle : après coup, `startsInHours` aura glissé avec l'horloge. */
        startsAt: Date.now() + offer.startsInHours * 3_600_000,
      }),
    );
    clearCart();
  };

  /*
    Paiement Stripe confirmé : le panier est déjà vide et les réservations
    inscrites (voir l'effet plus haut). On reprend la carte bordeaux de la
    maquette, comme le tunnel simulé, pour que les deux chemins aboutissent au
    même écran.
  */
  if (confirme) {
    const totalPaye = confirme.reduce((somme, item) => somme + item.price, 0);
    return (
      <div className="ff-container max-w-3xl py-16">
        <div className="rounded-3xl bg-brand-deep p-8 text-white shadow-lift">
          <p className="eyebrow text-gold">{t("Paiement confirmé", "Payment confirmed")}</p>
          <h1 className="display mt-3 text-[clamp(2rem,5vw,3rem)]">
            {confirme.length > 1
              ? t(`${confirme.length} places réservées`, `${confirme.length} spots booked`)
              : t("Votre place est réservée", "Your spot is booked")}
          </h1>

          <ul className="mt-6 space-y-2 border-t border-white/20 pt-6">
            {confirme.map((item) => {
              const offer = offerById(item.offerId);
              if (!offer) return null;
              return (
                <li key={item.offerId} className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="min-w-0 truncate">
                    {t(offer.title, offer.titleEn)}, {offer.gym}
                  </span>
                  <span className="shrink-0 tabular-nums">{formatEuro(item.price)}</span>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 flex items-baseline justify-between border-t border-white/20 pt-6">
            <span className="display text-2xl">{t("Total", "Total")}</span>
            <span className="font-display text-[clamp(2rem,6vw,2.75rem)] font-bold tabular-nums text-gold">
              {formatEuro(totalPaye)}
            </span>
          </p>

          {/* Pas de QR code (arbitrage client) : c'est le nom qui fait entrer. */}
          <p className="mt-4 text-sm text-white/80">
            {t(
              "À l'accueil du centre, présentez-vous à votre nom.",
              "At the centre's front desk, give your name.",
            )}
          </p>

          <Link href="/mes-cours">
            <Button variant="gold" size="lg" className="mt-7">
              {t("Voir mes cours", "See my classes")}
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-ink-soft">
          {t(
            "Démo : paiement en clés de test Stripe, aucune carte réelle n'est débitée.",
            "Demo: Stripe test keys, no real card is charged.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="ff-container max-w-3xl py-16">
      <p className="eyebrow text-brand">{t("Mon panier", "My cart")}</p>
      <h1 className="display mt-3 text-[clamp(2rem,5vw,3rem)] text-ink">
        {lines.length === 0
          ? t("Votre panier est vide.", "Your cart is empty.")
          : lines.length > 1
            ? t(`${lines.length} places réservées`, `${lines.length} spots held`)
            : t("Une place réservée", "One spot held")}
      </h1>

      {lines.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-paper px-6 py-10 text-center">
          <p className="text-ink-soft">
            {t(
              "Ajoutez des cours depuis les offres, puis payez tout en une fois.",
              "Add classes from the offers, then pay for everything at once.",
            )}
          </p>
          <Link href="/offres">
            <Button variant="gold" size="lg" className="mt-6">
              {t("Trouver un cours", "Find a class")}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-3 text-ink-soft">
            {t(
              "Le prix de chaque place a été bloqué au moment de l'ajout. Il ne bougera plus.",
              "Each price was locked when you added the class. It will not move again.",
            )}
          </p>

          <ul className="mt-8 space-y-4">
            {lines.map(({ item, offer }) => {
              const cat = categoryOf(offer.category);
              return (
                <li
                  key={item.offerId}
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
                    <h2 className="display mt-1.5 text-xl text-ink">
                      <Link href={`/offres/${offer.id}`} className="hover:text-brand">
                        {t(offer.title, offer.titleEn)}
                      </Link>
                    </h2>
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
                    </div>

                    <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 border-t border-line pt-4">
                      <button
                        onClick={() => removeFromCart(item.offerId)}
                        className="flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-brand"
                      >
                        <Trash2 className="h-4 w-4" /> {t("Retirer", "Remove")}
                      </button>
                      <span className="flex items-baseline gap-2">
                        <span className="font-display text-xl font-bold tabular-nums text-brand-deep">
                          {formatEuro(item.price)}
                        </span>
                        {item.price < offer.basePrice && (
                          <span className="text-sm text-ink-soft line-through">
                            {formatEuro(offer.basePrice)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 rounded-3xl bg-brand-deep p-7 text-white shadow-lift">
            <p className="flex items-baseline justify-between">
              <span className="display text-2xl">{t("Total", "Total")}</span>
              <span className="font-display text-[clamp(2rem,6vw,2.75rem)] font-bold tabular-nums text-gold">
                {formatEuro(total)}
              </span>
            </p>

            {messageErreur && (
              <p className="mt-5 rounded-2xl bg-white/15 px-4 py-3 text-sm text-white">
                {messageErreur}
              </p>
            )}

            <button
              onClick={pay}
              disabled={envoi}
              className="mt-6 w-full rounded-full bg-gold-bright px-6 py-4 text-base font-bold text-ink transition-colors hover:bg-gold disabled:cursor-wait disabled:opacity-70"
            >
              {envoi
                ? t("Redirection vers le paiement…", "Redirecting to payment…")
                : member
                  ? t("Payer et confirmer", "Pay and confirm")
                  : t("Se connecter pour payer", "Log in to pay")}
            </button>

            {!member && (
              <p className="mt-3 text-center text-sm text-white/80">
                {t(
                  "Votre panier vous attend après la connexion.",
                  "Your cart will still be here after you log in.",
                )}
              </p>
            )}

            <p className="mt-4 text-center">
              <Link
                href="/offres"
                className="text-sm text-white/90 underline underline-offset-4 hover:text-gold"
              >
                {t("Ajouter un autre cours", "Add another class")}
              </Link>
            </p>
          </div>
        </>
      )}

      <CheckoutFlow
        items={checkoutItems ?? []}
        open={checkoutItems !== null}
        onClose={() => setCheckoutItems(null)}
        onConfirmed={confirm}
      />
    </div>
  );
}
