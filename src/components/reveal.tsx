"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/** Courbe, durée et décalage relevés sur microsoft.ai (cf. `globals.css`). */
const EASE = "cubic-bezier(0.43, 0.195, 0.02, 1)";
const DURATION = 1.1;
const STAGGER = 0.07;

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  /** Décalage entre enfants directs, en secondes. Par défaut 0,07 s si activé. */
  stagger?: number;
}

/**
 * Reveal-on-scroll : IntersectionObserver + transitions CSS.
 *
 * SSR / sans-JS → contenu visible. Au montage on masque, puis on révèle à
 * l'entrée dans le viewport. Ne peut pas rester coincé caché (filet de sécurité).
 *
 * Rappel projet : ne PAS repasser à `gsap.from()` pour les entrées — sous React 19
 * en StrictMode il laisse les éléments à `opacity: 0`.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  y = 32,
  stagger,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const step = stagger ?? STAGGER;
    const targets = stagger !== undefined ? (Array.from(el.children) as HTMLElement[]) : [el];
    targets.forEach((t, i) => {
      t.style.opacity = "0";
      t.style.transform = `translateY(${y}px)`;
      t.style.willChange = "opacity, transform";
      t.style.transition = `opacity ${DURATION}s ${EASE}, transform ${DURATION}s ${EASE}`;
      t.style.transitionDelay = `${delay + i * step}s`;
    });

    const reveal = () => {
      targets.forEach((t) => {
        t.style.opacity = "1";
        t.style.transform = "none";
      });
      // Libère la couche de composition une fois l'animation finie.
      window.setTimeout(() => {
        targets.forEach((t) => { t.style.willChange = "auto"; });
      }, (DURATION + delay + targets.length * step) * 1000);
    };

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);

    // Filet de sécurité : jamais coincé caché.
    const safety = window.setTimeout(reveal, 1800);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, [delay, y, stagger]);

  const Tag2 = Tag as ElementType;
  return (
    <Tag2 ref={ref} className={className}>
      {children}
    </Tag2>
  );
}
