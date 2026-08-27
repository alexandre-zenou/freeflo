"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { LocaleSwitch } from "@/components/locale-switch";
import { signOut, useHydrated, useMember } from "@/lib/account";
import { useT } from "@/lib/i18n";

/**
 * Châssis de l'espace CONNECTÉ, en regard de `SiteHeader` : le nom du compte,
 * la langue, et « Se déconnecter ». Rien d'autre.
 *
 * Trois absences sont volontaires, et ce sont elles qui font tout le travail :
 *
 * · le monogramme n'est PAS un lien (`LogoMark`, pas `Logo`). Cliquer le logo
 *   pour rentrer à l'accueil est le réflexe qu'il fallait fermer ;
 * · aucune rubrique du site public, ni catalogue, ni panier, ni pied de page ;
 * · aucune sortie sauf la déconnexion, ce qui est l'intention même du groupe
 *   de routes `(app)`.
 *
 * La langue reste, elle : le site est intégralement bilingue, espace pro
 * compris, et le sélecteur ne mène nulle part.
 *
 * Barre `sticky` et non `fixed`, à la différence de l'en-tête publique : elle
 * occupe sa place dans le flux, donc les pages n'ont plus à réserver un retrait
 * en haut pour compenser une barre flottante.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const router = useRouter();
  const hydrated = useHydrated();
  const member = useMember();

  const nom = member ? [member.firstName, member.lastName].filter(Boolean).join(" ") : "";

  const roleLabel = () => {
    if (member?.role === "admin") return t("Administration", "Administration");
    if (member?.role === "centre") return t("Centre de sport", "Sport centre");
    return t("Mon compte", "My account");
  };

  /*
    La déconnexion ramène à l'accueil : c'est la seule porte de sortie de cet
    espace, elle doit donc mener quelque part.

    Deux précautions, mesurées sur la lenteur qu'on ressentait au clic :

    · on PRÉCHARGE `/` au survol du bouton. Cette barre n'a aucun `<Link>` (le
      monogramme n'est pas cliquable, c'est voulu), donc Next n'avait jamais eu
      l'occasion de préparer l'accueil, qui est la route la plus lourde du site
      (vidéo du héros, et Leaflet par `MapSearch`). Tout partait au clic, et on
      changeait de groupe de routes par-dessus le marché, donc de layout. Le
      survol suffit à couvrir la latence, et ne coûte rien à qui ne clique pas ;
    · `push` AVANT `signOut`. Dans l'autre sens, la session se vidait pendant
      qu'on attendait la nouvelle page, et `ProGuard` affichait « Accès réservé
      aux centres » à un administrateur, le temps du trajet.
  */
  const precharger = () => router.prefetch("/");

  const quitter = () => {
    router.push("/");
    signOut();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-md">
        {/*
          Deux lignes sous 640 px, une seule au-delà. Mesuré : sur un écran de
          390 px, le sélecteur de langue et « Se déconnecter » mangent 239 px,
          et il ne restait que 53 px au nom du compte, qui s'affichait
          « Studi… ». Les deux autres éléments ne pouvaient pas céder : la
          langue parce que l'espace pro est bilingue, le libellé du bouton
          parce que c'est la seule sortie de cet espace et qu'une icône seule
          la rendrait moins évidente. C'est donc la barre qui s'empile.
        */}
        <div className="ff-container flex flex-col gap-2 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0 md:h-20">
          {/* `min-w-0` sur le bloc ET sur son texte : un élément de flex refuse
              par défaut de descendre sous la largeur de son contenu, et « Studio
              Bloom Paris 4e » poussait la barre à 464 px de large sur un écran
              de 390. C'est ce bloc qui cède, jamais le bouton d'en face. */}
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark className="h-10 w-[30px] md:h-12 md:w-9" />
            {/* Avant hydratation la session est toujours vide : on tient la
                place plutôt que d'afficher un nom qui apparaîtrait d'un coup. */}
            <span className="min-w-0">
              <span className="eyebrow block truncate text-brand">{hydrated ? roleLabel() : " "}</span>
              <span className="block truncate text-sm font-medium text-ink">
                {hydrated ? nom : " "}
              </span>
            </span>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end md:gap-5">
            <LocaleSwitch onDark={false} />
            {hydrated && member && (
              <button
                onClick={quitter}
                onMouseEnter={precharger}
                onFocus={precharger}
                className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm text-ink-soft transition-colors hover:border-brand hover:text-brand md:px-4"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {/* Le libellé ne se replie jamais : c'est la seule sortie de
                    l'espace, elle doit se lire. C'est le NOM du compte qui cède
                    la place à l'étroit, d'où son `truncate` en face. */}
                <span className="whitespace-nowrap">{t("Se déconnecter", "Log out")}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Colonne de flex, pas un simple `flex-1` : c'est ce qui permet à la
          page de réclamer la hauteur restante et d'y étendre SON fond. Sans
          cela le fond crème de `/compte` s'arrêtait à la fin du contenu et
          laissait paraître le blanc du châssis en dessous. */}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
