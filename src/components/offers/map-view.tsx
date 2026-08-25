"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as GLMap, Marker as GLMarker } from "maplibre-gl";
import { LocateFixed } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Coords } from "@/components/use-geolocation";
import { frameAround, PARIS_BOUNDS, PARIS_CENTER } from "@/lib/geo";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * La carte du site, sur MapLibre GL et des tuiles VECTORIELLES.
 *
 * Elle a d'abord été bâtie sur Leaflet et des tuiles images. Toute une famille
 * de défauts en découlait, sans solution propre : gris pendant un déplacement
 * vif (l'image du nouveau cadre n'était pas encore arrivée), noms de villes
 * étirés pendant un pincement (l'image de l'ancien zoom, agrandie en attendant),
 * et carte molle aux zooms intermédiaires (une image par niveau entier, étirée
 * entre deux). Un fond de secours, un préchargement et un masquage pendant le
 * geste ont chacun réduit le symptôme, aucun n'a supprimé la cause.
 *
 * Ici, il n'y a plus d'image du tout : le plan arrive en géométrie et se dessine
 * sur le processeur graphique, à l'échelle exacte demandée. Le zoom est continu
 * par construction, les libellés sont toujours nets et à leur taille, et il n'y
 * a rien qui puisse manquer à l'écran.
 *
 * Fond : OpenFreeMap (OpenStreetMap), sans clé, sans compte, sans quota.
 */

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

/** Style clair et sobre : les pastilles rouges et or doivent primer sur le fond. */
const STYLE = "https://tiles.openfreemap.org/styles/positron";

/** MapLibre parle en `[lng, lat]` là où le reste du code parle en `[lat, lng]`. */
type LngLatBounds = [[number, number], [number, number]];

const toLngLat = (b: [[number, number], [number, number]]): LngLatBounds => [
  [b[0][1], b[0][0]],
  [b[1][1], b[1][0]],
];

/** Élément DOM d'un marqueur, dont l'habillage vit dans `globals.css`. */
function markerEl(html: string): HTMLDivElement {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el;
}

export function MapView({
  points,
  districts = [],
  activeId,
  focusId = null,
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
  /**
   * Point sur lequel la carte se recentre, à hauteur de quartier.
   *
   * Distinct d'`activeId`, qui ne fait que mettre une pastille en évidence :
   * ici la carte se déplace. Séparer les deux permet au survol de souligner
   * sans jamais déplacer le cadrage sous les yeux du visiteur.
   */
  focusId?: string | null;
  onHover?: (id: string | null) => void;
  /**
   * Clic sur une pastille. Un seul geste : c'est l'appelant qui décide si un
   * clic sélectionne ou ouvre, selon ce qui était déjà sélectionné.
   */
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
  /* La carte se construit après un `import()` : sa position réelle peut arriver
     AVANT elle. Cet état relance le cadrage une fois l'instance en place. */
  const [ready, setReady] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GLMap | null>(null);
  const markersRef = useRef<Record<string, GLMarker>>({});
  const districtRef = useRef<GLMarker[]>([]);
  /** Le point « vous êtes ici ». Créé SEULEMENT si une position réelle existe. */
  const meRef = useRef<GLMarker | null>(null);
  const GLRef = useRef<typeof import("maplibre-gl") | null>(null);
  const resizeRef = useRef<ResizeObserver | null>(null);

  /* Lu au moment du cadrage seulement : `focus` change à chaque filtre, et il
     n'est pas une raison de rejouer l'effet. L'effet de synchronisation est
     déclaré ICI, avant ceux qui lisent la référence : dans un même rendu, les
     effets partent dans l'ordre où ils sont écrits. */
  /* Lus au moment du recentrage seulement : remettre `points` en dépendance
     ferait revoler la carte à chaque nouveau prix calculé. */
  const pointsRef = useRef(points);
  const focusRef = useRef(focus);
  /*
    Les rappels passent par une référence, et non directement dans l'écouteur.

    Un marqueur n'est créé qu'une fois : son `addEventListener` capturerait
    alors la version des rappels du jour de sa naissance. Un appelant qui décide
    quoi faire d'après son état, par exemple « second clic sur le même item =
    ouvrir la fiche », lirait donc éternellement l'état initial et resterait
    bloqué sur le premier clic.
  */
  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);
  useEffect(() => {
    pointsRef.current = points;
    focusRef.current = focus;
    onSelectRef.current = onSelect;
    onHoverRef.current = onHover;
  });

  const sig = useMemo(
    () =>
      points.map((p) => `${p.id}:${p.label ?? ""}:${p.hot ? 1 : 0}`).join("|") +
      "||" +
      districts.map((d) => d.label).join(","),
    [points, districts],
  );

  /*
    Effet 1 : la carte, et rien d'autre. Un seul montage, un seul démontage.

    Elle se construit après un `import()`, donc de façon asynchrone : le montage
    double du mode strict rejouait l'effet pendant que le premier passage était
    encore en vol, et la suite travaillait alors sur une instance déjà détruite.
    Séparer la création de la pose des marqueurs supprime cette course : ici on
    ne fait que créer, là-bas on ne fait que dessiner, une fois `ready` posé.
  */
  useEffect(() => {
    let cancelled = false;
    /* Un rappel de `ResizeObserver` déjà programmé peut se déclencher pendant la
       destruction de la carte, `disconnect()` n'annulant que les suivants. Ce
       drapeau le neutralise. */
    let alive = true;

    (async () => {
      const GL = await import("maplibre-gl");
      if (cancelled || !elRef.current || mapRef.current) return;
      GLRef.current = GL;

      /*
        MapLibre 6 décode les tuiles vectorielles dans un worker, chargé depuis
        un fichier voisin dont il devine l'adresse avec `import.meta.url`. Sous
        Turbopack, cette adresse est celle du chunk empaqueté : le fichier n'y
        est pas, la requête finit en 404, le worker ne démarre jamais et la
        carte reste vide sans qu'aucune erreur ne soit signalée. On le sert donc
        depuis `public/` (voir `scripts/copy-maplibre-worker.mjs`).
      */
      GL.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

      const map = new GL.Map({
        container: elRef.current,
        style: STYLE,
        center: center ? [center[1], center[0]] : [PARIS_CENTER.lng, PARIS_CENTER.lat],
        zoom,
        minZoom: 9,
        maxZoom: 19,
        interactive,
        attributionControl: { compact: true },
        /*
          La molette SEULE continue de faire défiler la page : la carte occupe
          une grande hauteur, la capturer piégerait le défilement. Ctrl (ou ⌘) +
          molette zoome, et sur téléphone il faut deux doigts. MapLibre tient ce
          contrat lui-même et affiche l'indication qui va avec, ce qui remplace
          le gestionnaire de molette qu'on écrivait à la main.
        */
        cooperativeGestures: interactive,
        locale: {
          "CooperativeGesturesHandler.WindowsHelpText": "Utilisez Ctrl + molette pour zoomer",
          "CooperativeGesturesHandler.MacHelpText": "Utilisez ⌘ + molette pour zoomer",
          "CooperativeGesturesHandler.MobileHelpText": "Utilisez deux doigts pour déplacer la carte",
        },
        /* Carte à plat : ni rotation ni inclinaison. Le plan d'une ville n'a pas
           à basculer parce que deux doigts ont tourné d'un degré. */
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
      });
      mapRef.current = map;
      map.touchZoomRotate?.disableRotation();
      if (interactive) {
        map.addControl(new GL.NavigationControl({ showCompass: false }), "top-left");
      }


      /*
        Les marqueurs et le cadrage attendent que la carte soit prête, mais on
        ne s'en remet pas au seul événement `load` : il n'arrive qu'après le
        premier rendu graphique, et certains contextes (rendu logiciel, onglet
        en arrière-plan, WebGL bridé) ne le voient jamais. `styledata` suffit à
        notre besoin, les marqueurs étant des éléments HTML posés par-dessus la
        carte, indépendants de son moteur de rendu. Le premier des deux gagne.
      */
      const start = () => {
        if (cancelled || !elRef.current || resizeRef.current) return;
        setReady(true);

        /*
          L'attribution se replie derrière son « i ». Dépliée, elle mange deux
          lignes de carte sur un téléphone. Elle reste accessible d'un toucher,
          ce qui satisfait la licence des données.
        */
        elRef.current
          .querySelector(".maplibregl-ctrl-attrib")
          ?.classList.remove("maplibregl-compact-show");

        /*
          Le conteneur peut grandir après coup (révélation au défilement,
          rotation du téléphone, panneau qui s'ouvre). MapLibre ne le voit pas
          seul : sans cette observation, la carte garde son ancienne taille et
          laisse une bande vide sur le côté. Le `try` couvre l'appel qui tombe
          pendant la destruction, où le moteur de rendu n'existe déjà plus.
        */
        const ro = new ResizeObserver(() => {
          if (!alive) return;
          try {
            mapRef.current?.resize();
          } catch {
            /* carte en cours de démontage */
          }
        });
        ro.observe(elRef.current);
        resizeRef.current = ro;
      };
      map.once("load", start);
      map.once("styledata", start);

    })();

    return () => {
      cancelled = true;
      alive = false;
      resizeRef.current?.disconnect();
      resizeRef.current = null;
      markersRef.current = {};
      districtRef.current = [];
      meRef.current = null;
      /* La référence est vidée AVANT la destruction, pas après : l'observateur
         de taille peut être appelé pendant `remove()`, et il travaillerait alors
         sur une carte à moitié démontée. */
      const dying = mapRef.current;
      mapRef.current = null;
      dying?.remove();
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
    Effet 2 : les marqueurs et le cadrage. Il ne s'exécute qu'une fois la carte
    chargée (`ready`), donc jamais sur une instance en cours de création ou déjà
    détruite, et se rejoue à chaque changement de la liste des points.
  */
  useEffect(() => {
    const map = mapRef.current;
    const GL = GLRef.current;
    if (!ready || !map || !GL) return;

    // étiquettes d'arrondissement, sous les pastilles
    districtRef.current.forEach((m) => m.remove());
    districtRef.current = districts.map((d) =>
      new GL.Marker({ element: markerEl(`<div class="ff-arr">${d.label}</div>`), anchor: "center" })
        .setLngLat([d.lng, d.lat])
        .addTo(map),
    );

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    points.forEach((p, i) => {
      // `--pin-i` échelonne l'apparition (cf. `ff-pin-drop` dans globals.css) :
      // la carte se dévoile, puis les prix se posent un par un.
      const html = p.label
        ? `<div class="ff-pin" style="--pin-i:${i}"><span class="ff-pin__pill ${p.hot ? "ff-pin__pill--hot" : ""}">${p.label}</span></div>`
        : '<div class="ff-dot"></div>';
      const el = markerEl(html);
      el.addEventListener("mouseenter", () => onHoverRef.current?.(p.id));
      el.addEventListener("mouseleave", () => onHoverRef.current?.(null));
      el.addEventListener("click", () => onSelectRef.current?.(p.id));
      markersRef.current[p.id] = new GL.Marker({ element: el, anchor: "center" })
        .setLngLat([p.lng, p.lat])
        .addTo(map);
    });

    /*
      Trois cadrages, dans cet ordre :
        1. position réelle, quand l'écran est fait pour ça : le voisinage du
           visiteur, lui au centre ;
        2. adresse imposée (fiche offre) ou sélection resserrée par les filtres ;
        3. rien de tout cela : Paris en entier, la vue par défaut.
    */
    if (me && frameOnUser) {
      map.fitBounds(toLngLat(frameAround(me, focusRef.current)), { maxZoom: 16, animate: false });
    } else if (center) {
      map.jumpTo({ center: [center[1], center[0]], zoom });
    } else if (fitBounds && points.length > 0) {
      const lats = points.map((p) => p.lat);
      const lngs = points.map((p) => p.lng);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 48, maxZoom: 15, animate: false },
      );
    } else {
      map.fitBounds(toLngLat(PARIS_BOUNDS), { padding: 12, animate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, ready]);

  // pastille survolée dans la liste
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, m]) => {
      const el = m.getElement();
      el.querySelector(".ff-pin__pill")?.classList.toggle("ff-pin__pill--active", id === activeId);
      el.style.zIndex = id === activeId ? "1000" : "";
    });
  }, [activeId, sig]);

  /*
    La position réelle arrive après coup : au chargement sur l'accueil, au clic
    ailleurs. Le point « vous êtes ici » apparaît alors, et la carte se recale
    AUTOUR de lui, position au centre, sauf sur la fiche offre (`frameOnUser`).

    Cet effet est le SEUL endroit d'où naît ce point : tant qu'il ne s'exécute
    pas, la carte n'en porte aucun. Aucune position de repli n'existe.
  */
  useEffect(() => {
    const map = mapRef.current;
    const GL = GLRef.current;
    if (!map || !GL || !me) return;

    if (showUser) {
      if (meRef.current) meRef.current.setLngLat([me.lng, me.lat]);
      else {
        const el = markerEl('<div class="ff-here"></div>');
        el.style.zIndex = "500";
        meRef.current = new GL.Marker({ element: el, anchor: "center" })
          .setLngLat([me.lng, me.lat])
          .addTo(map);
      }
    }
    if (frameOnUser) {
      map.fitBounds(toLngLat(frameAround(me, focusRef.current)), { maxZoom: 16, duration: 800 });
    }
  }, [me, ready, showUser, frameOnUser]);

  /*
    Recentrage sur la sélection. `flyTo` et non `jumpTo` : le déplacement doit
    se voir, sinon le visiteur ne comprend pas que la carte a suivi son clic.

    Zoom 13,5, mesuré et non deviné. À 15, une seule pastille sur 18 restait
    dans le cadre : le lieu choisi se retrouvait seul au milieu de sa rue, sans
    rien pour le situer ni le comparer. À 13, cinq à onze pastilles restaient
    visibles, soit presque la vue d'ensemble de départ, et le recentrage ne
    voulait plus dire grand-chose. À 13,5 il en reste deux à cinq : le quartier
    et ses voisins, ce qui situe le lieu tout en gardant la comparaison utile.
  */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusId || !ready) return;
    const cible = pointsRef.current.find((p) => p.id === focusId);
    if (!cible) return;
    map.flyTo({ center: [cible.lng, cible.lat], zoom: 13.5, duration: 700 });
  }, [focusId, ready]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <div ref={elRef} className="h-full w-full" aria-label="Carte des cours" />

      {/*
        Recentrage sur soi, comme le réticule de Google Maps ou de Plans. Il
        déclenche la même demande de permission que le filtre « Autour de moi »,
        donc un visiteur qui a refusé garde un bouton sans effet : c'est le
        navigateur qui retient le refus, le reproposer n'ouvrirait rien.

        Placé en HAUT à droite : l'attribution tient le coin bas-droit et doit
        rester lisible (c'est la licence des données), et les boutons de zoom
        occupent le haut-gauche.
      */}
      {onLocate && (
        <button
          type="button"
          onClick={onLocate}
          disabled={locating}
          aria-label={t("Me recentrer sur la carte", "Recentre the map on me")}
          className="absolute right-3 top-3 z-[5] grid h-10 w-10 place-items-center rounded-full bg-paper text-ink shadow-lift ring-1 ring-line transition-colors hover:text-brand disabled:opacity-60"
        >
          <LocateFixed className={cn("h-5 w-5", locating && "animate-pulse")} />
        </button>
      )}
    </div>
  );
}
