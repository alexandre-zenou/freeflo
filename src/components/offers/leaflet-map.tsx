"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LMap, Marker as LMarker } from "leaflet";
import { LocateFixed } from "lucide-react";
import "leaflet/dist/leaflet.css";
import type { Coords } from "@/components/use-geolocation";
import { frameAround, panBounds, PARIS_BOUNDS, PARIS_CENTER } from "@/lib/geo";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  hot?: boolean;
}

export interface District {
  label: string;
  lat: number;
  lng: number;
}

// Voyager basemap: light + premium, with soft-green parks and blue water.
const CARTO = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
/*
  Même plan, SANS les noms de lieux. C'est la variante utilisée par la couche de
  secours : figée à un zoom bas puis étirée, elle affichait « BOULOGNE
  BILLANCOURT » en énorme, par-dessus, ou à côté du même nom écrit à la bonne
  taille par la couche nette. Sans texte, la doublure ne montre plus que le
  dessin des rues et de la Seine, et les noms restent ceux de la carte nette.
*/
const CARTO_PLAIN =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png";
const ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

/** Pose le point « vous êtes ici ». Appelé seulement avec une position réelle. */
function addMeMarker(L: typeof import("leaflet"), map: LMap, me: Coords): LMarker {
  return L.marker([me.lat, me.lng], {
    icon: L.divIcon({
      className: "",
      html: '<div class="ff-here"></div>',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    }),
    interactive: false,
    keyboard: false,
    zIndexOffset: 500,
  }).addTo(map);
}

/**
 * Précharge les tuiles basse résolution de toute la zone où la carte peut aller.
 *
 * `keepBuffer` ne préchARGE rien : il CONSERVE ce qui a déjà été affiché. Un
 * déplacement vers une zone jamais vue partait donc chercher ses tuiles au
 * moment où on arrivait dessus, d'où le vide. Ici on demande d'avance, au zoom
 * 11, les quelques images qui couvrent Paris et sa marge : une poignée de
 * fichiers de quelques dizaines de kilo-octets, mis en cache par le navigateur.
 * La couche de secours les affiche alors instantanément, quel que soit le geste.
 */
function prefetchBasemap(bounds: [[number, number], [number, number]], zooms = [10, 11]) {
  /*
    Le suffixe compte AUTANT que l'adresse. Leaflet remplace `{r}` par `@2x` dès
    que l'écran est à haute densité, ce qui est le cas de tous les téléphones et
    de la plupart des portables. Précharger la version sans suffixe revenait donc
    à remplir le cache avec des fichiers que la carte n'allait jamais demander :
    le préchargement ne servait à rien précisément là où il était le plus utile.
  */
  const r = typeof window !== "undefined" && window.devicePixelRatio > 1 ? "@2x" : "";
  for (const z of zooms) {
    const n = 2 ** z;
    const xOf = (lng: number) => Math.floor(((lng + 180) / 360) * n);
    const yOf = (lat: number) => {
      const rad = (lat * Math.PI) / 180;
      return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n);
    };
    const [[south, west], [north, east]] = bounds;
    for (let x = xOf(west); x <= xOf(east); x++) {
      for (let y = yOf(north); y <= yOf(south); y++) {
        const img = new Image();
        img.src = CARTO_PLAIN.replace("{s}", "a")
          .replace("{z}", String(z))
          .replace("{x}", String(x))
          .replace("{y}", String(y))
          .replace("{r}", r);
      }
    }
  }
}

/**
 * Quels zooms précharger, selon ce que la connexion peut se permettre.
 *
 * Les tuiles sont demandées en `@2x` sur écran dense : une grille complète pèse
 * vite un mégaoctet ou deux, ce qui n'a rien à faire sur un forfait mobile. Sur
 * petit écran on se contente donc du zoom 10, quelques images qui couvrent toute
 * la zone, et rien du tout si le visiteur a demandé l'économie de données ou
 * s'annonce en 2G. Même logique que la vidéo du héros.
 */
function prefetchZooms(): number[] {
  if (typeof navigator === "undefined") return [];
  const conn = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "")) return [];
  return window.innerWidth < 768 ? [10] : [10, 11];
}

export function LeafletMap({
  points,
  districts = [],
  activeId,
  onHover,
  onSelect,
  center,
  zoom = 13,
  fitBounds = false,
  showUser = false,
  frameOnUser = true,
  me = null,
  focus = [],
  onLocate,
  locating = false,
  interactive = true,
  className,
}: {
  points: MapPoint[];
  districts?: District[];
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
  fitBounds?: boolean;
  showUser?: boolean;
  /**
   * Cadrer la carte autour du VISITEUR dès que sa position est connue.
   *
   * Vrai par défaut : c'est ce que veulent l'accueil et `/offres`, où la
   * question est « qu'y a-t-il autour de moi ». La fiche offre le met à faux :
   * son sujet est le studio, à une adresse précise. Le cadre calculé fait au
   * moins 700 m de rayon autour du visiteur, ce qui y donnerait une vue de
   * quartier là où on veut voir la rue. Le point bleu du visiteur reste posé,
   * il n'est simplement plus le centre de gravité de la carte.
   */
  frameOnUser?: boolean;
  /** Position réelle du visiteur, une fois la géolocalisation accordée. */
  me?: Coords | null;
  /**
   * Les quelques points à garder en vue AVEC le visiteur quand sa position
   * arrive : le cadrage se règle sur eux, pas sur le catalogue entier. Un
   * visiteur qui n'est pas à Paris dézoomerait sinon jusqu'à la France.
   */
  focus?: { lat: number; lng: number }[];
  /** Fourni : la carte affiche son bouton « Me recentrer », qui appelle ceci. */
  onLocate?: () => void;
  locating?: boolean;
  interactive?: boolean;
  className?: string;
}) {
  const t = useT();
  /* La carte se construit après un `import()` dynamique : sa position réelle
     peut arriver AVANT elle. Cet état relance donc le recentrage une fois
     l'instance en place, sinon le premier `me` tombe dans le vide. */
  const [ready, setReady] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const markersRef = useRef<Record<string, LMarker>>({});
  const districtRef = useRef<LMarker[]>([]);
  /** Le point « vous êtes ici ». Créé SEULEMENT si une position réelle existe. */
  const meRef = useRef<LMarker | null>(null);
  /* Leaflet, gardé sous la main : la position peut arriver longtemps après la
     carte, et il faut alors pouvoir poser son marqueur sans le recharger. */
  const LRef = useRef<typeof import("leaflet") | null>(null);
  /* Lu au moment du cadrage seulement : `focus` change à chaque filtre, et il
     n'est pas une raison de rejouer l'effet. L'effet de synchronisation est
     déclaré ICI, avant ceux qui lisent la référence : dans un même rendu, les
     effets partent dans l'ordre où ils sont écrits. */
  const focusRef = useRef(focus);
  useEffect(() => {
    focusRef.current = focus;
  });
  /** Retrait du gestionnaire Ctrl + molette, posé à la création de la carte. */
  const wheelOffRef = useRef<(() => void) | null>(null);

  const sig = useMemo(
    () =>
      points.map((p) => `${p.id}:${p.label ?? ""}:${p.hot ? 1 : 0}`).join("|") +
      "||" +
      districts.map((d) => d.label).join(","),
    [points, districts],
  );

  // build map + markers (rebuilds markers when points change)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !elRef.current) return;
      LRef.current = L;

      if (!mapRef.current) {
        const map = L.map(elRef.current, {
          center: center ?? [PARIS_CENTER.lat, PARIS_CENTER.lng],
          zoom,
          scrollWheelZoom: false,
          dragging: interactive,
          zoomControl: interactive,
          doubleClickZoom: interactive,
          /*
            Pincement à deux doigts. Le geste est celui de Leaflet (`TouchZoom`,
            bâti sur touchstart/touchmove/touchend) : il suit les doigts en
            direct et se centre sur leur point médian, pas sur le centre de
            l'écran. On le déclare explicitement parce que son défaut est
            `true` : il restait donc actif sur les cartes non interactives, où
            l'on pouvait pincer le plan d'une fiche offre sans pouvoir le
            déplacer ni revenir au cadrage d'origine.

            Leaflet pose alors `touch-action: none` sur le conteneur (classes
            `leaflet-touch-drag` + `leaflet-touch-zoom` de sa feuille de style),
            ce qui lui donne la main sur le geste au lieu de laisser le
            navigateur zoomer la page entière.
          */
          touchZoom: interactive,
          keyboard: interactive,
          /*
            Zoom continu. Par défaut Leaflet recale sur le niveau entier le plus
            proche quand les doigts se relèvent : le pincement se termine par un
            ressort, très loin de Google Maps ou de Plans. `zoomSnap: 0` retire
            ce recalage et laisse les niveaux fractionnaires ; `zoomDelta` garde
            un cran franc pour les boutons +/- et le clavier.
          */
          /*
            Zoom entièrement continu : aucun cran, aucune butée pendant le
            geste. C'est ce que la cliente a demandé, et un `zoomSnap` non nul
            le cassait, les petits mouvements de trackpad étant arrondis au
            même niveau, donc sans effet visible.

            Le défaut du zoom continu, ce sont les tuiles qui restent étirées
            sur un niveau fractionnaire (12,43 par exemple) et paraissent
            molles. Il est corrigé APRÈS coup, une fois le geste terminé, par
            le recalage discret posé plus bas.
          */
          zoomSnap: 0,
          zoomDelta: 1,
          /*
            Glisser la carte. Les réglages d'origine de Leaflet freinent net dès
            que le bouton est relâché (`inertiaDeceleration: 3000`), et la carte
            s'arrête quasiment sous le curseur : le déplacement paraît collant.
            On desserre le frein et on lève le plafond de vitesse, de sorte
            qu'un geste franc lance la carte et la laisse filer, comme sur les
            applications de cartes.
          */
          inertia: true,
          inertiaDeceleration: 2200,
          inertiaMaxSpeed: 2200,
          easeLinearity: 0.15,
          /*
            La carte ne sort pas de Paris (plus dix kilomètres de marge) et ne
            se dézoome pas sous le niveau 11. C'est ce qui supprime le gris pour
            de bon : le visiteur ne peut plus atteindre, d'un geste, une zone
            trop éloignée pour être déjà chargée. `maxBoundsViscosity: 1` rend
            la butée franche au lieu de laisser la carte rebondir.
          */
          maxBounds: panBounds(me),
          maxBoundsViscosity: 0.85,
          minZoom: 10,
          attributionControl: true,
        });
        /*
          Deux couches de tuiles, et c'est ce qui supprime le gris.

          Le gris qu'on voyait en déplaçant la carte, c'est le fond du
          conteneur, visible partout où la tuile n'est pas encore arrivée. On
          pose donc SOUS la carte nette un fond de secours : les mêmes tuiles,
          mais sans les noms de lieux et bloquées au zoom 11
          (`maxNativeZoom`), que Leaflet étire ensuite à tous les zooms. Ce fond ne représente qu'une poignée d'images, il
          est chargé une fois pour toutes et couvre largement le cadre, si bien
          qu'un trou dans la couche nette laisse voir un plan flou, jamais du
          vide.

          Sur la couche nette, `keepBuffer` garde six rangées de tuiles autour
          du cadre visible une rangée de tuiles de plus que d'origine, et
          `updateWhenIdle: false` les demande pendant le geste au lieu
          d'attendre qu'il s'arrête. On ne monte pas plus haut : chaque rangée
          gardée est autant d'images conservées dans la page, et un pincement
          sur téléphone doit les redessiner toutes.
        */
        /*
          Doublure DÉBORDANTE. Leaflet ne charge que les tuiles du cadre visible :
          `keepBuffer` conserve celles qu'on a déjà vues, il n'en demande jamais
          d'avance. Après un geste vif, le haut de la carte restait donc nu le
          temps d'une ou deux images, sur les deux couches à la fois.

          On élargit ici la zone que la doublure considère comme visible, d'une
          tuile de chaque côté. À son zoom (11) une tuile couvre un millier de
          pixels à l'écran : le débord est énorme, pour trois ou quatre images de
          plus. Il n'y a plus de bord à atteindre.
        */
        const PaddedTiles = L.TileLayer.extend({
          _pxBoundsToTileRange(this: InstanceType<typeof L.TileLayer>, bounds: L.Bounds) {
            const range = (L.TileLayer.prototype as unknown as {
              _pxBoundsToTileRange(b: L.Bounds): L.Bounds;
            })._pxBoundsToTileRange.call(this, bounds);
            return new L.Bounds(range.min!.subtract([1, 1]), range.max!.add([1, 1]));
          },
        }) as unknown as new (url: string, options: L.TileLayerOptions) => L.TileLayer;

        new PaddedTiles(CARTO_PLAIN, {
          maxNativeZoom: 11,
          minNativeZoom: 10,
          maxZoom: 19,
          subdomains: "abcd",
          /* Deux rangées suffisent : c'est le débord ci-dessus qui couvre les
             gestes vifs, pas la rétention, et chaque tuile gardée est une image
             de plus à télécharger sur un forfait mobile. */
          keepBuffer: 2,
          updateWhenIdle: false,
          /* Figée pendant le zoom : c'est une doublure, elle doit rester en
             place et se laisser étirer, pas se recharger au milieu du geste. */
          updateWhenZooming: false,
          className: "ff-tiles-under",
          zIndex: 1,
        }).addTo(map);
        L.tileLayer(CARTO, {
          attribution: ATTR,
          maxZoom: 19,
          subdomains: "abcd",
          keepBuffer: 3,
          updateWhenIdle: false,
          updateWhenZooming: true,
          zIndex: 2,
        }).addTo(map);
        mapRef.current = map;
        setReady(true);
        prefetchBasemap(panBounds(me), prefetchZooms());

        if (interactive) {
          /*
            Recalage discret, une fois le geste fini.

            Le zoom continu laisse la carte sur un niveau fractionnaire : les
            tuiles y sont agrandies jusqu'à moitié et l'image paraît molle. On
            attend donc 350 ms sans mouvement, puis on se pose sur le quart de
            niveau le plus proche. Le déplacement est au pire de 12 %, invisible
            à l'œil, et il rend l'image nette. Le minuteur repart à chaque
            événement : pendant le geste, rien ne se produit.
          */
          /* Voir `.ff-zooming` dans `globals.css` : la couche nette s'efface le
             temps du geste, pour que ses noms de villes ne s'étirent pas. */
          const container = elRef.current;
          map.on("zoomstart", () => container.classList.add("ff-zooming"));
          map.on("zoomend", () => container.classList.remove("ff-zooming"));

          let settle = 0;
          map.on("zoomend", () => {
            window.clearTimeout(settle);
            settle = window.setTimeout(() => {
              const z = map.getZoom();
              const snapped = Math.round(z * 4) / 4;
              if (Math.abs(z - snapped) > 0.02) map.setZoom(snapped);
            }, 350);
          });

          /*
            Équivalent desktop du pincement. La molette SEULE continue de faire
            défiler la page : la carte occupe 70 vh, la capturer piégerait le
            défilement (c'est le sens de `scrollWheelZoom: false`, qu'on garde).
            Ctrl (ou ⌘) + molette zoome, centré sur le curseur, comme le
            pincement se centre entre les doigts.

            Deux gestes passent par ce même chemin sans effort supplémentaire :
            le pincement sur trackpad macOS, que le navigateur livre sous forme
            d'un `wheel` avec `ctrlKey`, et la molette des souris classiques.

            `passive: false` est indispensable : sans lui, `preventDefault()` est
            ignoré et le navigateur zoome la page par-dessus la carte.
          */
          const el = elRef.current;
          const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey && !e.metaKey) return;
            e.preventDefault();

            // `deltaMode` varie : pixels, lignes ou pages selon le périphérique.
            const px =
              e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * el.clientHeight : e.deltaY;

            /*
              Deux gestes très différents arrivent ici, et un seul réglage ne
              peut pas convenir aux deux :

              · le pincement sur trackpad envoie une pluie de petits deltas (2 à
                10 px). À 100 px par niveau, il fallait un geste interminable
                pour gagner un cran : c'est ce qui donnait cette impression de
                carte qui traîne. Le pas est descendu à 42 px, soit deux fois et
                demie plus vif, et comme les événements se suivent à la cadence
                de l'écran le zoom colle au doigt.
              · la molette d'une souris envoie un cran isolé et gros (100 px,
                parfois 120). Au même réglage, un seul cran ferait bondir de
                deux niveaux et demi. D'où le plafond d'UN niveau par événement,
                qui lui garde sa course d'origine.
            */
            const step = Math.max(-1, Math.min(1, -px / 42));
            const next = map.getZoom() + step;
            const clamped = Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), next));
            /*
              Le zoom doit couler dans les deux cas, mais pas par le même moyen.

              Le pincement arrive déjà en continu : ses dizaines de petits pas
              suivent le doigt, et les animer les ferait se marcher dessus. Le
              cran de molette, lui, est un saut isolé : sans animation, la carte
              se téléporte d'un niveau. On l'anime donc, et lui seul, pour que
              le saut devienne un glissement.

              `setZoomAround` garde sous le curseur le point qui s'y trouvait.
            */
            map.setZoomAround(map.mouseEventToContainerPoint(e), clamped, {
              animate: Math.abs(step) > 0.5,
            });
          };
          el.addEventListener("wheel", onWheel, { passive: false });
          wheelOffRef.current = () => el.removeEventListener("wheel", onWheel);
        }

        /*
          Le point « vous êtes ici » n'est posé QUE si la géolocalisation a
          répondu. Il n'existe aucun repli : ni coordonnées de démonstration, ni
          centre de Paris, ni zone approchée. Un refus, un échec ou un
          navigateur sans géolocalisation laissent donc la carte sans aucun
          point de visiteur, ce qui est la seule chose vraie qu'on puisse en
          dire. S'il arrive plus tard, l'effet du bas s'en charge.
        */
        if (showUser && me) addMeMarker(L, map, me);
      }

      const map = mapRef.current!;

      // clear + redraw district (arrondissement) labels, below the pins
      districtRef.current.forEach((m) => m.remove());
      districtRef.current = districts.map((d) =>
        L.marker([d.lat, d.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div class="ff-arr">${d.label}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
          interactive: false,
          keyboard: false,
          zIndexOffset: -1000,
        }).addTo(map),
      );

      // clear existing offer markers
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};

      points.forEach((p, i) => {
        // `--pin-i` échelonne l'apparition (cf. `ff-pin-drop` dans globals.css) :
        // la carte se dévoile, puis les prix se posent un par un.
        const html = p.label
          ? `<div class="ff-pin" style="--pin-i:${i}"><span class="ff-pin__pill ${p.hot ? "ff-pin__pill--hot" : ""}">${p.label}</span></div>`
          : '<div class="ff-dot"></div>';
        const marker = L.marker([p.lat, p.lng], {
          icon: L.divIcon({ className: "", html, iconSize: [0, 0], iconAnchor: [0, 0] }),
          keyboard: false,
        }).addTo(map);
        if (onHover) {
          marker.on("mouseover", () => onHover(p.id));
          marker.on("mouseout", () => onHover(null));
        }
        if (onSelect) marker.on("click", () => onSelect(p.id));
        markersRef.current[p.id] = marker;
      });

      /*
        Trois cadrages, dans cet ordre :
          1. position réelle : le voisinage du visiteur, lui au centre ;
          2. sélection resserrée par les filtres : ses résultats, cadrés dessus ;
          3. rien de tout cela : Paris en entier, la vue par défaut.

        Le troisième cas est celui d'un visiteur qui a refusé la géolocalisation
        ou dont on ne sait rien : il obtient un plan de la ville, pas un zoom sur
        le petit nuage de pastilles du jeu de démonstration.
      */
      if (me && frameOnUser) {
        map.fitBounds(frameAround(me, focusRef.current), { maxZoom: 16 });
      } else if (fitBounds && points.length > 0) {
        map.fitBounds(
          points.map((p): [number, number] => [p.lat, p.lng]),
          { padding: [48, 48], maxZoom: 15 },
        );
      } else if (center) {
        map.setView(center, zoom);
      } else {
        map.fitBounds(PARIS_BOUNDS, { padding: [12, 12] });
      }
      // Leaflet sometimes needs a nudge once its container has real size
      setTimeout(() => map.invalidateSize(), 60);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  // teardown on unmount
  useEffect(() => {
    return () => {
      wheelOffRef.current?.();
      wheelOffRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
      meRef.current = null;
    };
  }, []);

  // highlight active marker
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, m]) => {
      const pill = m.getElement()?.querySelector(".ff-pin__pill");
      pill?.classList.toggle("ff-pin__pill--active", id === activeId);
      m.setZIndexOffset(id === activeId ? 1000 : 0);
    });
  }, [activeId, sig]);

  /*
    La position réelle arrive après coup : au chargement sur l'accueil, au clic
    ailleurs. Le point « vous êtes ici » apparaît alors, et la carte se recale
    AUTOUR de lui, position au centre. `flyToBounds` plutôt qu'un `setView` sec
    pour que le déplacement se voie.

    Cet effet est le SEUL endroit d'où naît ce point : tant qu'il ne s'exécute
    pas, la carte n'en porte aucun. `ready` compte donc autant que `me` : sans
    lui, une position arrivée avant la fin du chargement de Leaflet était
    perdue, et rien n'apparaissait ni ne se recentrait.
  */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !me) return;
    if (showUser) {
      if (meRef.current) meRef.current.setLatLng([me.lat, me.lng]);
      else if (LRef.current) meRef.current = addMeMarker(LRef.current, map, me);
    }
    if (!frameOnUser) return;
    map.setMaxBounds(panBounds(me));
    map.flyToBounds(frameAround(me, focusRef.current), { maxZoom: 16, duration: 0.8 });
  }, [me, ready, showUser, frameOnUser]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <div ref={elRef} className="h-full w-full" aria-label="Carte des cours" />

      {/*
        Recentrage sur soi, comme le réticule de Google Maps ou de Plans. Il
        déclenche la même demande de permission que le filtre « Autour de moi »,
        donc un visiteur qui a refusé garde un bouton sans effet : c'est le
        navigateur qui retient le refus, le reproposer n'ouvrirait rien.

        Placé en HAUT à droite : l'attribution « © OpenStreetMap © CARTO » tient
        le coin bas-droit et doit rester lisible (c'est la licence des tuiles),
        et le contrôle de zoom occupe le haut-gauche. `z-[500]` passe au-dessus
        des panneaux Leaflet, dont les marqueurs plafonnent à 400.
      */}
      {onLocate && (
        <button
          type="button"
          onClick={onLocate}
          disabled={locating}
          aria-label={t("Me recentrer sur la carte", "Recentre the map on me")}
          className="absolute right-3 top-3 z-[500] grid h-10 w-10 place-items-center rounded-full bg-paper text-ink shadow-lift ring-1 ring-line transition-colors hover:text-brand disabled:opacity-60"
        >
          <LocateFixed className={cn("h-5 w-5", locating && "animate-pulse")} />
        </button>
      )}
    </div>
  );
}
