import type { NextConfig } from "next";

/** Un an, en secondes : durée de cache des fichiers dont le nom ne change jamais. */
const ONE_YEAR = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },

  /*
    Test depuis un téléphone du réseau local.

    Next bloque par défaut les ressources de développement (`/_next/*`) demandées
    depuis une autre origine que `localhost`. Le téléphone recevait donc le HTML
    mais aucun script utile : la page s'affichait, et RIEN n'était cliquable, ni
    la géolocalisation, ni le panier, ni les filtres. Le serveur le signale dans
    son journal, pas dans le navigateur, d'où le temps qu'il faut pour le voir.

    Sans effet en production : cette option ne concerne que `next dev`.
    L'adresse change avec le bail DHCP, d'où le motif large en plus de l'adresse
    exacte du jour.
  */
  allowedDevOrigins: ["192.168.86.244", "192.168.86.*", "*.local"],

  /*
    Pastille « N » en bas à gauche : c'est l'indicateur de développement de
    Next.js, jamais servi en production. On le masque pour que `npm run dev`
    montre exactement ce que verra la cliente.
  */
  devIndicators: false,

  images: {
    /*
      Chargeur maison : les photos Unsplash sont redimensionnées par Unsplash
      lui-même, pas par Vercel. Voir `src/lib/image-loader.ts` — cela retire du
      transfert Vercel les octets d'images ET les transformations facturées.
      Les fichiers locaux repassent par l'optimiseur de Next.
    */
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    /*
      Les photos du site sont statiques (démo). Sans TTL explicite, Vercel
      ré-optimise et resert bien trop souvent : chaque re-génération est une
      transformation facturée ET des octets qui repartent sur le réseau.
    */
    minimumCacheTTL: ONE_YEAR,
    formats: ["image/avif", "image/webp"],
    /*
      Par défaut Next génère 8 largeurs d'appareil + 8 tailles d'icône, soit
      jusqu'à 16 variantes par image. Le site n'a que trois usages réels :
      pleine largeur, carte, vignette. On réduit d'autant le nombre de
      transformations et d'objets en cache.
    */
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [64, 256, 384],
  },

  async headers() {
    const security = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        // `geolocation=(self)` : la cliente demande un bouton « Activez votre
        // géolocalisation » sur /offres. Avec `geolocation=()` le navigateur
        // refusait la demande avant même d'afficher la permission.
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self)",
      },
    ];

    return [
      { source: "/(.*)", headers: security },
      /*
        Next sert `public/` avec `Cache-Control: public, max-age=0` : le
        navigateur revalide à CHAQUE visite. Sur la vidéo du héros (618 Ko en
        webm) c'était le premier poste de transfert du site. Ces fichiers ne
        changent jamais sans changer de nom : on les fige un an.
      */
      {
        source: "/video/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` }],
      },
      {
        source: "/categories/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` }],
      },
      {
        // Le logo est servi en masque CSS sur toutes les pages : une seule
        // requête, puis plus jamais.
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` }],
      },
    ];
  },
};

export default nextConfig;
