"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Ajoute une classe d'animation quand l'élément entre dans le viewport.
 *
 * Sert à déclencher `.map-in` sur les cartes Leaflet : la cliente demande
 * explicitement « la même fluidité quand la carte apparaît ». On ne peut pas
 * poser l'animation directement dans le CSS de la carte, sinon elle se joue au
 * chargement de la page, avant même qu'on l'ait à l'écran.
 */
export function RevealOnView({
  children,
  animationClass = "map-in",
  className,
  threshold = 0.2,
}: {
  children: React.ReactNode;
  animationClass?: string;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Masqué seulement une fois le JS présent : sans JS, le contenu reste visible.
    el.style.opacity = "0";

    const play = () => {
      el.style.opacity = "";
      el.classList.add(animationClass);
    };

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            play();
            obs.disconnect();
          }
        });
      },
      { threshold },
    );
    io.observe(el);

    const safety = window.setTimeout(play, 1800);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, [animationClass, threshold]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
