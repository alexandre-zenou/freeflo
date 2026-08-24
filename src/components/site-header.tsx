"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { LocaleSwitch } from "@/components/locale-switch";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useMember } from "@/lib/account";
import { useCartCount } from "@/lib/cart";

export function SiteHeader({ overHero = false }: { overHero?: boolean }) {
  const t = useT();
  const member = useMember();
  const cartCount = useCartCount();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /*
    Connecté, « Connexion » devient le prénom du membre et mène à son compte.
    Le rendu serveur est toujours déconnecté (voir `lib/account.tsx`), donc le
    lien bascule après hydratation, comme le sélecteur de langue.

    « Espace pro » ne fait plus partie de la navigation publique : il n'apparaît
    que pour le compte d'administration, seul à pouvoir l'ouvrir (`ProGuard`).
  */
  const primary = [
    ...nav.primary.map((l) =>
      l.href === "/connexion" && member
        ? { href: "/compte", label: member.firstName, labelEn: member.firstName, account: true }
        : { ...l, account: false },
    ),
    ...(member?.role === "admin"
      ? [{ href: "/pro", label: "Espace pro", labelEn: "Pro area", account: false }]
      : []),
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !overHero || open;
  const onDark = overHero && !solid;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid ? "border-b border-line bg-cream/85 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      {/*
        Retour client : « décaler le texte vers la droite » et « ajouter rubrique
        inscrire mon centre à droite d'espace pro ». Le logo reste seul à gauche,
        tout le reste forme un bloc aligné à droite.
      */}
      {/*
        Barre pleine largeur, PAS `ff-container` : le logo doit toucher le bord
        gauche de l'écran, or le conteneur a un padding et se centre à 1240px.
        Le bloc de droite garde l'ancien retrait par rapport au bord.
      */}
      <div className="flex h-20 items-center justify-between pl-2 pr-[clamp(1.25rem,4vw,3rem)] md:h-24 md:pl-3">
        {/*
          Logo plus imposant que la version d'origine (h-9/h-10), et jaune quand
          il passe sur le héros rouge. Sur le header plein, il reste rouge : le
          jaune sur crème tombe à 1,5:1, illisible.
        */}
        <Logo
          onDark={onDark}
          markClassName={cn("h-16 w-12 md:h-20 md:w-[60px]", onDark && "bg-gold-bright")}
        />

        <div className="hidden items-center gap-7 md:flex">
          <nav className="flex items-center gap-7">
            {primary.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-1.5 text-sm transition-colors",
                  onDark ? "text-white/85 hover:text-white" : "text-ink-soft hover:text-ink",
                )}
              >
                {l.account && <UserRound className="h-4 w-4" />}
                {t(l.label, l.labelEn)}
              </Link>
            ))}
            <Link
              href={nav.vendorCta.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                onDark
                  ? "bg-white/15 text-white hover:bg-white/25"
                  : "bg-brand-tint text-brand hover:bg-brand hover:text-white",
              )}
            >
              {t(nav.vendorCta.label, nav.vendorCta.labelEn)}
            </Link>
          </nav>
          <CartLink count={cartCount} onDark={onDark} label={t("Panier", "Cart")} />
          <LocaleSwitch onDark={onDark} />
        </div>

        {/* Le panier reste atteignable sur mobile sans ouvrir le menu : c'est
            l'étape suivante du parcours, pas une rubrique du site. */}
        <div className="flex items-center gap-4 md:hidden">
          <CartLink count={cartCount} onDark={onDark} label={t("Panier", "Cart")} />
          <button
            className={cn(onDark ? "text-white" : "text-ink")}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("Fermer le menu", "Close menu") : t("Ouvrir le menu", "Open menu")}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Le compteur n'apparaît qu'après hydratation : le panier vit dans le
          navigateur, le serveur ne peut que le rendre vide (voir `lib/cart.tsx`). */}
      {open && (
        <div className="border-t border-line bg-cream md:hidden">
          <div className="ff-container flex flex-col gap-1 py-4">
            {[...primary, { ...nav.vendorCta, account: false }].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-3 text-ink hover:bg-secondary"
              >
                {l.account && <UserRound className="h-4 w-4" />}
                {t(l.label, l.labelEn)}
              </Link>
            ))}
            <Link
              href="/panier"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-3 text-ink hover:bg-secondary"
            >
              <ShoppingBag className="h-4 w-4" />
              {t("Panier", "Cart")}
              {cartCount > 0 && ` (${cartCount})`}
            </Link>
            <div className="px-2 pt-2">
              <LocaleSwitch onDark={false} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function CartLink({
  count,
  onDark,
  label,
}: {
  count: number;
  onDark: boolean;
  label: string;
}) {
  return (
    <Link
      href="/panier"
      aria-label={count > 0 ? `${label} (${count})` : label}
      className={cn(
        "relative transition-colors",
        onDark ? "text-white/85 hover:text-white" : "text-ink-soft hover:text-ink",
      )}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        /*
          Pastille détachée du sac, pas posée dessus. Deux réglages font tout le
          travail : elle déborde franchement du coin (`-right-2 -top-2`, contre
          un demi-cran auparavant, ce qui la faisait chevaucher l'anse), et un
          anneau de la couleur du fond découpe un liseré autour d'elle. Sans cet
          anneau, le jaune colle au trait de l'icône et l'ensemble se lit comme
          une seule forme.

          `min-w` et non une largeur fixe : à deux chiffres la pastille s'allonge
          en pilule au lieu de rogner le nombre.
        */
        <span
          className={cn(
            "absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-bold leading-none tabular-nums shadow-sm ring-2",
            "bg-gold-bright text-ink",
            onDark ? "ring-brand-deep" : "ring-cream",
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
