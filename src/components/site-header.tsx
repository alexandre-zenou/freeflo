"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, Menu, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { LocaleSwitch } from "@/components/locale-switch";
import { AccountMenu } from "@/components/account-menu";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useMember } from "@/lib/account";
import { useCartCount } from "@/lib/cart";

export function SiteHeader() {
  const t = useT();
  /*
    L'en-tête est posée par le layout `(public)`, plus par chaque page : elle ne
    peut donc plus recevoir « je suis au-dessus du héros » en propriété. Elle le
    déduit de la route, puisque l'accueil est le seul écran dont la première
    section est une image plein cadre. Un écran de plus dans ce cas s'ajoute ici.
  */
  const pathname = usePathname();
  const overHero = pathname === "/";
  const member = useMember();
  const cartCount = useCartCount();
  const [scrolled, setScrolled] = useState(false);
  /*
    Le menu mobile retient la PAGE sur laquelle il a été ouvert, pas un simple
    booléen. Il est donc considéré comme ouvert tant qu'on n'a pas changé de
    page, et se referme de lui-même à la première navigation, quelle qu'elle
    soit : un lien du panneau, l'icône du panier restée dans la barre, ou une
    entrée ajoutée plus tard sans qu'on y pense.

    C'est de l'état DÉDUIT, pas un effet : refermer depuis un `useEffect` sur
    le changement de route violerait `react-hooks/set-state-in-effect`, et
    surtout laisserait le panneau visible le temps d'un rendu, superposé à la
    page d'arrivée.

    Auparavant chaque lien portait son propre `onClick` de fermeture. Il
    suffisait d'en oublier un, ou d'en ajouter un nouveau, pour que le menu
    reste ouvert par-dessus la page suivante.
  */
  const [ouvertSur, setOuvertSur] = useState<string | null>(null);
  const open = ouvertSur !== null && ouvertSur === pathname;
  const setOpen = (v: boolean | ((p: boolean) => boolean)) => {
    const veut = typeof v === "function" ? v(open) : v;
    setOuvertSur(veut ? pathname : null);
  };

  /*
    Connecté, « Connexion » devient le prénom du membre et mène à son compte.
    Le rendu serveur est toujours déconnecté (voir `lib/account.tsx`), donc le
    lien bascule après hydratation, comme le sélecteur de langue.

    « Espace pro » ne fait plus partie de la navigation publique : il n'apparaît
    que pour le compte d'administration, seul à pouvoir l'ouvrir (`ProGuard`).
  */
  const isPro = member?.role === "admin" || member?.role === "centre";

  /*
    Deux entrées disparaissent selon qui regarde, pour ne pas proposer une
    action qui n'a plus de sens :

    · « Inscrire mon centre » n'est montré qu'aux visiteurs NON connectés. Une
      fois identifié, on a déjà un compte : le parcours d'inscription d'un
      centre part d'une recherche de commerce, il n'a rien à dire à quelqu'un
      qui est déjà entré.

    · « Trouver un cours » et le PANIER disparaissent pour les comptes du côté
      professionnel, centre comme administration. Ils gèrent des créneaux et
      n'en réservent pas : une icône de panier dans leur en-tête ne mènerait
      qu'à une page vide.
  */
  const showVendorCta = !member;

  /*
    Un MEMBRE (et lui seul) a « Mes cours » : un centre gère des créneaux, il
    n'en réserve pas, et un visiteur n'en a aucun.
  */
  const estMembre = member?.role === "member";

  /*
    Connecté, le prénom quitte la barre de navigation : il occupait la largeur
    d'une rubrique sans en être une. Il passe dans la pastille du compte, à
    l'extrême droite, avec la langue et la déconnexion (`AccountMenu`).
  */
  const primary = [
    ...nav.primary
      .filter((l) => !(isPro && l.href === "/offres"))
      .filter((l) => !(member && l.href === "/connexion"))
      .map((l) => ({ ...l })),
    ...(isPro
      ? [{ href: "/pro", label: "Espace pro", labelEn: "Pro area" }]
      : []),
  ];

  /*
    Ce que le panneau déroulant garde, sur téléphone : les rubriques
    SECONDAIRES, et elles seules.

    Les quatre destinations du parcours, « Trouver un cours », « Mes cours », le
    panier et le compte, en sont sorties : ce sont des actions qu'on répète, pas
    des rubriques qu'on consulte une fois, et les cacher derrière un panneau
    coûtait deux gestes à chaque fois (retour client 27/08/2026). Elles vivent
    donc dans la barre, en icônes, faute de largeur pour leurs libellés.

    Il reste alors des écrans où ce panneau n'a plus rien à montrer, un membre
    connecté par exemple : le bouton lui même disparaît, plutôt que d'ouvrir sur
    du vide.
  */
  const secondaires = [
    ...primary.filter((l) => l.href !== "/offres"),
    ...(showVendorCta ? [nav.vendorCta] : []),
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
                {t(l.label, l.labelEn)}
              </Link>
            ))}
            {showVendorCta && (
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
            )}

            {/* « Mes cours » est la destination du membre, pas une rubrique de
                plus : elle est traitée comme le bouton d'action de la barre,
                en or, à la taille du texte au-dessus. */}
            {estMembre && (
              <Link
                href="/mes-cours"
                className={cn(
                  "rounded-full px-5 py-2.5 text-base font-bold transition-colors",
                  onDark
                    ? "bg-gold-bright text-ink hover:bg-gold"
                    : "bg-gold-bright text-ink hover:bg-gold",
                )}
              >
                {t("Mes cours", "My classes")}
              </Link>
            )}
          </nav>
          {!isPro && <CartLink count={cartCount} onDark={onDark} label={t("Panier", "Cart")} />}
          {/* Connecté, la langue vit dans le menu de la pastille. Déconnecté,
              elle reste ici : sans compte, il n'y aurait plus aucun moyen de
              passer le site en anglais. */}
          {member ? <AccountMenu onDark={onDark} /> : <LocaleSwitch onDark={onDark} />}
        </div>

        {/*
          Barre du téléphone : les quatre destinations du parcours, dans l'ordre
          où on les traverse, puis le panneau des rubriques.

          Tout est en icônes : « Trouver un cours » et « Mes cours » ne tiennent
          pas en toutes lettres à côté du logo sous 400 px de large. Chacune
          porte son libellé en `aria-label` et en `title`, et les cinq cibles
          gardent 40 px de côté, ce qui reste confortable au pouce.

          Ces éléments vivent HORS du panneau déroulant : ils peuvent donc agir
          alors qu'il est encore ouvert, et on partirait sur une autre page en
          le laissant affiché par-dessus. D'où le `setOpen(false)` sur chacun.
          Les liens DU panneau, eux, se referment déjà.
        */}
        <div className="flex items-center gap-1 md:hidden">
          {!isPro && (
            <HeaderIconLink
              href="/offres"
              label={t("Trouver un cours", "Find a class")}
              onDark={onDark}
              onNavigate={() => setOpen(false)}
            >
              <Search className="h-5 w-5" />
            </HeaderIconLink>
          )}

          {/* « Mes cours » garde son or : c'est l'action du membre, pas une
              rubrique de plus, exactement comme sur grand écran. */}
          {estMembre && (
            <Link
              href="/mes-cours"
              onClick={() => setOpen(false)}
              aria-label={t("Mes cours", "My classes")}
              title={t("Mes cours", "My classes")}
              className="mx-1 grid h-9 w-9 place-items-center rounded-full bg-gold-bright text-ink transition-colors hover:bg-gold"
            >
              <CalendarCheck className="h-5 w-5" />
            </Link>
          )}

          {!isPro && (
            <span className="grid h-10 w-10 place-items-center">
              <CartLink
                count={cartCount}
                onDark={onDark}
                label={t("Panier", "Cart")}
                onNavigate={() => setOpen(false)}
              />
            </span>
          )}

          {/* La pastille est hors du menu déroulant : c'est le raccourci vers
              la langue et la déconnexion, il ne doit pas demander deux gestes.
              Ouvrir son menu referme le panneau, deux surfaces empilées
              n'ayant aucun sens. */}
          {member && <AccountMenu onDark={onDark} onOpen={() => setOpen(false)} />}

          {secondaires.length > 0 && (
            <button
              className={cn("grid h-10 w-10 place-items-center", onDark ? "text-white" : "text-ink")}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t("Fermer le menu", "Close menu") : t("Ouvrir le menu", "Open menu")}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Le compteur n'apparaît qu'après hydratation : le panier vit dans le
          navigateur, le serveur ne peut que le rendre vide (voir `lib/cart.tsx`). */}
      {open && secondaires.length > 0 && (
        <div className="border-t border-line bg-cream md:hidden">
          <div className="ff-container flex flex-col gap-1 py-4">
            {secondaires.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-3 text-ink hover:bg-secondary"
              >
                {t(l.label, l.labelEn)}
              </Link>
            ))}
            {/* Déconnecté seulement : connecté, la langue est dans le menu de
                la pastille, juste au-dessus. */}
            {!member && (
              <div className="px-2 pt-2">
                <LocaleSwitch onDark={false} />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/** Destination de la barre du téléphone : une icône, son libellé porté par
 *  `aria-label` et `title`, et une cible de 40 px de côté. */
function HeaderIconLink({
  href,
  label,
  onDark,
  onNavigate,
  children,
}: {
  href: string;
  label: string;
  onDark: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-10 w-10 place-items-center transition-colors",
        onDark ? "text-white/85 hover:text-white" : "text-ink-soft hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}

function CartLink({
  count,
  onDark,
  label,
  onNavigate,
}: {
  count: number;
  onDark: boolean;
  label: string;
  /** Referme le menu mobile : le panier vit HORS du panneau déroulant, donc
   *  cliquer dessus changeait de page en laissant le menu ouvert par-dessus. */
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/panier"
      onClick={onNavigate}
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
