"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Map as LMap, Marker as LMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { userLocation } from "@/lib/site";
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

/** Repères jaunes de la charte cliente (« + jaune pour monument »). */
export interface Monument {
  label: string;
  lat: number;
  lng: number;
}

// Voyager basemap: light + premium, with soft-green parks and blue water.
const CARTO = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

export function LeafletMap({
  points,
  districts = [],
  monuments = [],
  activeId,
  onHover,
  onSelect,
  center,
  zoom = 13,
  fitBounds = false,
  showUser = false,
  interactive = true,
  className,
}: {
  points: MapPoint[];
  districts?: District[];
  monuments?: Monument[];
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
  fitBounds?: boolean;
  showUser?: boolean;
  interactive?: boolean;
  className?: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const markersRef = useRef<Record<string, LMarker>>({});
  const districtRef = useRef<LMarker[]>([]);
  const monumentRef = useRef<LMarker[]>([]);

  const sig = useMemo(
    () =>
      points.map((p) => `${p.id}:${p.label ?? ""}:${p.hot ? 1 : 0}`).join("|") +
      "||" +
      districts.map((d) => d.label).join(",") +
      "||" +
      monuments.map((m) => m.label).join(","),
    [points, districts, monuments],
  );

  // build map + markers (rebuilds markers when points change)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !elRef.current) return;

      if (!mapRef.current) {
        const map = L.map(elRef.current, {
          center: center ?? [userLocation.lat, userLocation.lng],
          zoom,
          scrollWheelZoom: false,
          dragging: interactive,
          zoomControl: interactive,
          doubleClickZoom: interactive,
          attributionControl: true,
        });
        L.tileLayer(CARTO, { attribution: ATTR, maxZoom: 19, subdomains: "abcd" }).addTo(map);
        mapRef.current = map;

        if (showUser) {
          L.marker([userLocation.lat, userLocation.lng], {
            icon: L.divIcon({ className: "", html: '<div class="ff-here"></div>', iconSize: [0, 0], iconAnchor: [0, 0] }),
            interactive: false,
            keyboard: false,
          }).addTo(map);
        }
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

      // repères monuments, en jaune, sous les pastilles de prix
      monumentRef.current.forEach((m) => m.remove());
      monumentRef.current = monuments.map((mo) =>
        L.marker([mo.lat, mo.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div class="ff-pin" style="--pin-i:0"><span class="ff-pin__pill ff-pin__pill--monument">${mo.label}</span></div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
          interactive: false,
          keyboard: false,
          zIndexOffset: -500,
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

      if (fitBounds && points.length > 0) {
        const coords: [number, number][] = points.map((p) => [p.lat, p.lng]);
        if (showUser) coords.push([userLocation.lat, userLocation.lng]);
        map.fitBounds(coords, { padding: [48, 48], maxZoom: 15 });
      } else if (center) {
        map.setView(center, zoom);
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
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
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

  return <div ref={elRef} className={cn("h-full w-full", className)} aria-label="Carte des cours" />;
}
