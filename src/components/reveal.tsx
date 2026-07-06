"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  /** Décalage entre enfants directs, en secondes (stagger). */
  stagger?: number;
}

/**
 * Reveal-on-scroll robuste : IntersectionObserver + transitions CSS.
 * SSR / sans-JS → contenu visible. Au montage, on masque puis on révèle à
 * l'entrée dans le viewport. Ne peut pas « rester coincé » caché.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  y = 24,
  stagger,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = stagger ? (Array.from(el.children) as HTMLElement[]) : [el];
    targets.forEach((t, i) => {
      t.style.opacity = "0";
      t.style.transform = `translateY(${y}px)`;
      t.style.transition = "opacity 0.8s cubic-bezier(0.2,0.7,0.2,1), transform 0.8s cubic-bezier(0.2,0.7,0.2,1)";
      t.style.transitionDelay = `${delay + i * (stagger ?? 0)}s`;
    });

    const reveal = () => {
      targets.forEach((t) => {
        t.style.opacity = "1";
        t.style.transform = "none";
      });
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
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    // Filet de sécurité : jamais coincé caché.
    const safety = window.setTimeout(reveal, 1600);
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
