/**
 * Attente d'une page publique.
 *
 * Le site n'en avait aucune : tant qu'une route n'était pas préchargée, le
 * navigateur restait figé sur l'écran précédent sans rien signaler, et
 * l'attente passait pour une panne. C'était le plus visible à la déconnexion,
 * qui traverse tout le site pour retomber sur l'accueil, la route la plus
 * lourde (vidéo du héros, et Leaflet par `MapSearch`).
 *
 * Next ne l'affiche que si la navigation attend VRAIMENT : entre deux pages
 * déjà préchargées par leurs liens, la transition reste immédiate et ce
 * squelette ne paraît jamais.
 *
 * L'en-tête publique est fixe et le pied de page vit dans le layout : ce
 * fichier ne remplace que le contenu, d'où le retrait en haut, calé sur celui
 * des pages, et une hauteur minimale pour que le pied ne remonte pas.
 */
export default function Loading() {
  return (
    <main className="min-h-[70dvh] bg-cream pt-28 md:pt-32">
      <div className="ff-container max-w-3xl">
        <div className="h-4 w-28 animate-pulse rounded-full bg-secondary" />
        <div className="mt-5 h-10 w-3/4 animate-pulse rounded-full bg-secondary" />
        <div className="mt-9 h-52 w-full animate-pulse rounded-3xl bg-secondary" />
      </div>
    </main>
  );
}
