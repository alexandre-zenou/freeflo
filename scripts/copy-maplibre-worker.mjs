/*
  Copie le worker de MapLibre dans `public/`.

  MapLibre 6 ne fournit plus un worker embarqué : il le charge depuis un fichier
  voisin, dont il devine l'adresse avec `import.meta.url`. Sous Turbopack, cette
  adresse est celle du chunk empaqueté, où le fichier n'existe pas : la requête
  finit en 404, le worker ne démarre jamais, et la carte reste vide puisque les
  tuiles vectorielles sont décodées là. On sert donc le worker nous-mêmes, et
  `setWorkerUrl` (voir `components/offers/map-view.tsx`) l'y envoie.

  Le worker importe `./maplibre-gl-shared.mjs` : les deux fichiers voyagent
  ensemble. Ce script tourne avant `dev` et `build`, pour qu'ils ne puissent pas
  diverger de la version installée.
*/
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "node_modules", "maplibre-gl", "dist");
const to = join(root, "public", "maplibre");

mkdirSync(to, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(from, file), join(to, file));
}
