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

    LE FILET (27/08/2026), après un retour « sur téléphone, le F ne remonte
    pas ». Un défilement doux est le geste le plus fragile qui soit sur mobile,
    et il échoue en SILENCE, sans erreur ni saut :

    · Safari iOS n'a connu `behavior: "smooth"` qu'à partir de la version 15.4,
      et l'ignorait purement et simplement avant ;
    · l'inertie du doigt tue l'animation. On lance le défilement d'un geste, on
      tape le logo dans la foulée, et le défilement encore en cours annule le
      nôtre au moment même où il démarre ;
    · la barre d'adresse qui se replie change la hauteur de la fenêtre pendant
      l'animation, ce qui l'interrompt aussi.

    On regarde donc si la page a bougé, et sinon on saute. 200 ms : un
    défilement doux se voit dès les premières images, donc une page immobile à
    ce moment-là ne partira plus.

    LE PIÈGE DU SAUT, vérifié dans un navigateur qui ignore le défilement doux
    (c'est exactement le téléphone en panne) : `scrollTop = 0` ne suffit PAS,
    et un second `scrollTo` non plus. Les deux suivent la règle CSS
    `scroll-behavior`, qui vaut `smooth` sur tout le site (`globals.css`) : le
    secours repassait donc par le mécanisme même qui venait d'échouer. On
    neutralise la règle en style en ligne le temps du saut, puis on la remet.
    Deux lignes de plus, mais c'est la seule façon qui ne dépende ni du
    navigateur ni du mot-clé `instant`, que le vieux Safari ne connaît pas.

    Le défilement doux reste coupé pour qui a demandé moins d'animations : on
    saute directement.
  */
  const remonter = (e: React.MouseEvent) => {
    if (!surAccueil) return;
    e.preventDefault();

    const depart = window.scrollY;
    if (depart === 0) return;

    /* Saut immédiat, quoi qu'en dise la feuille de style. */
    const sauter = () => {
      const html = document.documentElement;
      const regle = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      html.style.scrollBehavior = regle;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sauter();
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => {
      if (window.scrollY === depart) sauter();
    }, 200);
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
