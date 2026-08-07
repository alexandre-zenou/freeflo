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

/**
 * Titre qui apparaît ligne par ligne.
 *
 * Retour client : « faire apparaître de manière fluide, le texte ». Le texte est
 * découpé aux retours de ligne RÉELS (mesurés après mise en page), donc le
 * découpage suit la largeur de la fenêtre au lieu d'être figé dans le code.
 *
 * Sans JS, le titre s'affiche normalement : le découpage n'a lieu qu'au montage.
 */
export function RevealLines({
  children,
  as: Tag = "h2",
  className,
  delay = 0,
}: {
  children: string;
  as?: ElementType;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /*
      La source de vérité est la PROP, pas `el.textContent` : l'effet remplace le
      contenu par ses masques de ligne, donc relire le DOM renverrait le texte de
      la langue précédente au changement FR/EN.
    */
    const text = children;
    if (!text.trim()) return;

    /** Regroupe les mots par ligne d'après leur position verticale réelle. */
    const measure = (): string[][] => {
      el.textContent = "";
      el.style.opacity = "";
      const probes = text.split(/\s+/).filter(Boolean).map((w) => {
        const s = document.createElement("span");
        s.textContent = w;
        el.append(s, document.createTextNode(" "));
        return s;
      });
      const lines: string[][] = [];
      let lastTop: number | null = null;
      probes.forEach((s) => {
        const top = Math.round(s.getBoundingClientRect().top);
        if (lastTop === null || Math.abs(top - lastTop) > 4) {
          lines.push([]);
          lastTop = top;
        }
        lines[lines.length - 1].push(s.textContent ?? "");
      });
      return lines;
    };

    const lines = measure();
    if (lines.length === 0) {
      el.textContent = text;
      return;
    }

    // Chaque ligne devient un masque avec son propre décalage.
    el.textContent = "";
    const inners: HTMLElement[] = [];
    lines.forEach((words, i) => {
      const mask = document.createElement("span");
      mask.style.display = "block";
      mask.style.overflow = "hidden";
      const inner = document.createElement("span");
      inner.style.display = "block";
      inner.style.transform = "translateY(105%)";
      inner.style.willChange = "transform";
      inner.style.transition = `transform 1.3s ${EASE}`;
      inner.style.transitionDelay = `${delay + i * STAGGER}s`;
      // Espace de fin sur toutes les lignes sauf la dernière : visuellement
      // sans effet (bloc), mais le copier-coller et les lecteurs d'écran
      // retrouvent « sport, sans » au lieu de « sport,sans ».
      inner.textContent = words.join(" ") + (i < lines.length - 1 ? " " : "");
      mask.append(inner);
      el.append(mask);
      inners.push(inner);
    });

    const reveal = () => inners.forEach((n) => { n.style.transform = "none"; });

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    const safety = window.setTimeout(reveal, 1800);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
      el.textContent = text;
    };
  }, [children, delay]);

  const Tag2 = Tag as ElementType;
  return (
    <Tag2 ref={ref} className={className}>
      {children}
    </Tag2>
  );
}
