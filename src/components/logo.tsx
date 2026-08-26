import Link from "next/link";
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
  return (
    <Link
      href="/"
      aria-label="FREEFLO, accueil"
      className={cn("inline-flex items-center", className)}
    >
      <LogoMark onDark={onDark} className={markClassName} />
    </Link>
  );
}
