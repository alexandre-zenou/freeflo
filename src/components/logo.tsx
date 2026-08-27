"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Logo de la cliente (`public/brand/freeflo-logo.svg`) : un monogramme « f »
 * avec « freeflo » en micro-typo autour.
 *
 * Le fichier fourni est entièrement NOIR, ce qui le rendait illisible sur le
 * héros rouge et sur le pied de page. Plutôt que de le modifier — c'est son
 * logo, on n'y touche pas — on l'utilise en **masque CSS** : la forme vient du
 * SVG, la couleur de `currentColor`. Un seul fichier, servi une fois et mis en
 * cache, qui s'adapte aux deux fonds.
 *
 * Le nom « FREEFLO » reste dans l'`aria-label` : la micro-typo du monogramme
 * est illisible à cette taille, et un lecteur d'écran ne lit pas une image de
 * fond.
 */
/**
 * Le monogramme SEUL, sans lien.
 *
 * L'espace connecté l'affiche tel quel : sa seule porte de sortie est « Se
 * déconnecter », donc un logo cliquable vers l'accueil y serait précisément le
 * raccourci qu'on veut fermer.
 */
export function LogoMark({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "block h-9 w-[27px] shrink-0 transition-colors md:h-10 md:w-[30px]",
        onDark ? "bg-white" : "bg-brand",
        className,
      )}
      style={{
        maskImage: "url(/brand/freeflo-logo.svg)",
        WebkitMaskImage: "url(/brand/freeflo-logo.svg)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

export function Logo({
  className,
  markClassName,
  onDark = false,
}: {
  className?: string;
  /** Taille / couleur du monogramme. Passe après les défauts, donc les écrase. */
  markClassName?: string;
  onDark?: boolean;
}) {
  const pathname = usePathname();
  const surAccueil = pathname === "/";

  /*
    Déjà sur l'accueil, le lien ne faisait RIEN : Next voit la même route et
    ne navigue pas, or on est peut-être en bas d'une page très longue. Le
    réflexe attendu est de remonter, on le sert donc explicitement.

    Ailleurs, le lien navigue normalement, et le navigateur arrive en haut.

    Le défilement doux est coupé pour qui a demandé moins d'animations : la
    règle CSS `scroll-behavior` ne s'applique pas à `scrollTo`, il faut le
    décider ici.
  */
  const remonter = (e: React.MouseEvent) => {
    if (!surAccueil) return;
    e.preventDefault();
    const doux = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: doux ? "smooth" : "auto" });
  };

  return (
    <Link
      href="/"
      onClick={remonter}
      aria-label={surAccueil ? "FREEFLO, revenir en haut" : "FREEFLO, accueil"}
      className={cn("inline-flex items-center", className)}
    >
      <LogoMark onDark={onDark} className={markClassName} />
    </Link>
  );
}
