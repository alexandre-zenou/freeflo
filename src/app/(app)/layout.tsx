import { AppShell } from "@/components/app-shell";

/**
 * Châssis de l'espace PRO : `/pro`, pour les centres et l'administration.
 *
 * Ce groupe de routes n'existe que pour cette frontière : ce qui est ici ne
 * porte ni le menu du site public, ni son pied de page, et n'offre aucun
 * chemin vers le catalogue. On en sort en se déconnectant, pas autrement.
 *
 * `/compte` n'est PAS ici : c'est l'écran d'un client, qui se sert du site
 * autour, et il garde donc l'en-tête et le pied de page publics.
 *
 * `(app)` ne paraît pas dans les URLs : `/pro` reste `/pro`.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
