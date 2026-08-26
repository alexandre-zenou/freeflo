import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/**
 * Châssis du site PUBLIC : l'en-tête complète et le pied de page.
 *
 * Jusqu'ici chaque page recollait `SiteHeader` et `SiteFooter` à la main, onze
 * fois. Rien ne garantissait qu'elles restent d'accord, et surtout rien ne
 * distinguait une page publique d'un écran connecté : un centre identifié
 * voyait encore le menu du site et ses colonnes de pied de page.
 *
 * Les deux groupes de routes tranchent la question par la structure plutôt que
 * par des conditions dans l'en-tête. `(public)` et `(app)` n'apparaissent PAS
 * dans les URLs : `/offres` reste `/offres`.
 *
 * Chaque page garde son propre `<main>` : le retrait sous l'en-tête fixe et la
 * couleur de fond diffèrent d'un écran à l'autre, et c'est à la page de le dire.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
