"use client";

/**
 * Chargeur d'images de `next/image`.
 *
 * Pourquoi : toutes les photos du site viennent d'Unsplash, qui est déjà un CDN
 * d'images (imgix) capable de redimensionner et de servir du WebP/AVIF. Les
 * faire transiter par l'optimiseur de Vercel revenait à payer deux fois : une
 * transformation facturée par variante, PUIS les octets servis, comptés dans le
 * transfert de données. On envoie donc `next/image` chercher directement la
 * bonne taille chez Unsplash.
 *
 * On garde tout le reste de `next/image` : chargement différé, `srcset`,
 * dimensions réservées. Seule la source des octets change.
 *
 * ATTENTION : déclarer `loader: "custom"` DÉSACTIVE l'endpoint `/_next/image`.
 * Les fichiers locaux doivent donc être servis tels quels — y renvoyer donnerait
 * un 404 et une image cassée. Ils sont livrés depuis `public/`, figés un an par
 * les en-têtes de `next.config.ts`. Corollaire : un fichier local doit être
 * exporté à la bonne taille et déjà compressé, personne ne le fera pour nous.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const q = quality ?? 70;

  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    // `auto=format` laisse Unsplash choisir WebP ou AVIF selon le navigateur.
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(q));
    return url.toString();
  }

  // Chemins locaux : servis directement depuis `public/`, sans optimiseur.
  return src;
}
