"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

  /* Payer exige un compte : c'est le seul point du parcours qui en demande un,
     et le paiement en est le moment naturel. */
  const pay = () =>
    member
      ? setCheckoutItems(lines.map((l) => l.item))
      : router.push("/connexion?next=%2Fpanier");

  const confirm = () => {
    lines.forEach(({ item, offer }) =>
      addBooking({
        offerId: offer.id,
        price: item.price,
        ref: bookingRef(offer.id, offer.basePrice, offer.placesLeft),
        bookedAt: Date.now(),
      }),
    );
    clearCart();
  };

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

            <button
              onClick={pay}
              className="mt-6 w-full rounded-full bg-gold-bright px-6 py-4 text-base font-bold text-ink transition-colors hover:bg-gold"
            >
              {member
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
