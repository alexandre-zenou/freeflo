"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { categories } from "@/lib/site";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Bandeau des catégories, défilant en boucle et reprenable à la main.
 *
 * Le défilement n'est plus une animation CSS sur `transform` mais une boucle
 * `requestAnimationFrame` qui pilote `scrollLeft`. C'est ce qui rend possible la
 * demande « reprendre là où l'utilisateur l'a laissé » : la position de
 * défilement devient l'unique source de vérité, partagée par l'automatique et
 * par le doigt. Avec un `transform` animé, les deux vivaient dans des repères
 * séparés et il aurait fallu convertir l'un dans l'autre à chaque bascule.
 *
 * Trois raisons de mise en pause, volontairement distinctes :
 * · `userPaused` — clic, glissement ou molette. Repart seul après IDLE_MS.
 * · `hovering`   — survol souris, comportement d'origine. Repart au départ du
 *                  curseur, sans minuteur : on ne relance pas sous le pointeur.
 * · `reduced`    — `prefers-reduced-motion`. L'ancienne règle globale de
 *                  `globals.css` neutralisait l'animation CSS ; elle n'a aucune
 *                  prise sur une boucle JS, donc on la réapplique ici.
 */
const LOOP_SECONDS = 32; // durée d'un tour, identique à l'ancienne animation
const IDLE_MS = 2500; // inactivité avant reprise automatique
const DRAG_PX = 8; // au-delà, c'est un glissement, pas un tap
/*
  Nombre de copies du catalogue. Deux suffisaient à la boucle automatique, qui
  revenait à zéro toute seule ; le doigt, lui, atteignait la fin de la seconde
  copie et se cognait au bord. On garde la position dans la 2e copie et on la
  ramène d'une période dès qu'elle en sort : il reste alors en permanence une
  copie entière de marge de chaque côté.

  Le nombre de copies n'est pas décoratif : le repli haut se déclenche à
  `2 × période`, qui doit rester atteignable. Il faut donc
  `largeur d'écran ≤ (COPIES − 2) × période`. Six copies couvrent 5440 px,
  soit au-delà de tout écran réel, ultra-large compris. Le catalogue ne compte
  que cinq visuels, tous déjà en cache : la répétition ne coûte que des nœuds.
*/
const COPIES = 6;

/** Largeur d'un tour : le gap qui sépare deux copies en fait partie. */
function periodOf(el: HTMLElement): number {
  const track = el.firstElementChild;
  const gap = track ? parseFloat(getComputedStyle(track).columnGap) || 0 : 0;
  return (el.scrollWidth + gap) / COPIES;
}

/**
 * Ramène la position dans la 2e copie, `[période, 2 × période[`.
 * Le décalage vaut exactement une période, donc l'image à l'écran ne change pas.
 */
function wrap(offset: number, period: number): number {
  if (period <= 0) return offset;
  let v = offset;
  while (v >= 2 * period) v -= period;
  while (v < period) v += period;
  return v;
}

export function Categories() {
  const t = useT();
  const viewport = useRef<HTMLDivElement>(null);

  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [grabbing, setGrabbing] = useState(false);

  const idle = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  /*
    Glisser-déposer à la SOURIS uniquement. Au doigt, le navigateur fait déjà
    défiler le conteneur nativement : reprendre la main dessus donnerait un
    défilement saccadé et casserait l'inertie iOS. `null` hors interaction.
  */
  const mouseDrag = useRef<{ x: number; captured: boolean } | null>(null);

  /* Miroir de `userPaused` lisible depuis `onScroll` sans le remettre en
     dépendance : le gestionnaire doit juste savoir qui bouge la barre. */
  useEffect(() => {
    pausedRef.current = userPaused;
  }, [userPaused]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Départ dans la 2e copie et non à zéro : il faut de la marge à GAUCHE dès la
     première seconde, sinon un balayage vers la droite bute immédiatement. */
  useEffect(() => {
    const el = viewport.current;
    if (el) el.scrollLeft = periodOf(el);
  }, []);

  /** Repousse la reprise automatique : appelé à chaque signe de vie. */
  const armIdle = useCallback(() => {
    if (idle.current) window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => {
      setUserPaused(false);
      /*
        Le survol est levé lui aussi, sinon le défilement ne repartirait jamais
        pour qui lâche la souris sur le bandeau après l'avoir tiré : la pause au
        survol prendrait le relais du minuteur. Un survol repart de zéro au
        prochain `pointerenter`, donc simplement passer dessus met toujours en
        pause — c'est l'interaction qui a eu lieu qui donne la priorité au délai.
      */
      setHovering(false);
    }, IDLE_MS);
  }, []);

  useEffect(
    () => () => {
      if (idle.current) window.clearTimeout(idle.current);
    },
    [],
  );

  useEffect(() => {
    const el = viewport.current;
    if (!el || userPaused || hovering || reduced) return;

    let raf = 0;
    let last: number | null = null;
    /*
      Position tenue en flottant ici, et non relue dans le DOM à chaque image :
      à 42 px/s l'incrément vaut ~0,68 px par image, or WebKit tronque
      `scrollLeft` à l'entier. Repartir de la valeur tronquée reperdait la
      fraction à chaque tour et le bandeau restait cloué sur place.
      L'amorçage depuis `scrollLeft` ne se fait qu'ici, au (re)démarrage de la
      boucle : c'est ce qui fait reprendre le défilement là où le doigt l'a laissé.
    */
    let offset = el.scrollLeft;

    const tick = (ts: number) => {
      /*
        La période est un jeu de tuiles, gap de fin COMPRIS. L'ancienne animation
        s'arrêtait à `translateX(-50%)`, soit la moitié de la piste : elle
        oubliait ce dernier gap et sautait de 8 px à chaque tour.
      */
      const period = periodOf(el);

      if (last !== null && period > 0) {
        // Onglet en arrière-plan : rAF gèle, le premier `dt` au retour serait énorme.
        const dt = Math.min((ts - last) / 1000, 0.1);
        offset = wrap(offset + (period / LOOP_SECONDS) * dt, period);
        el.scrollLeft = offset;
      }
      last = ts;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [userPaused, hovering, reduced]);

  const takeOver = useCallback(() => {
    setUserPaused(true);
    armIdle();
  }, [armIdle]);

  return (
    <section className="bg-secondary/50 py-6">
      <div className="mb-4 ff-container">
        <p className="accent-em text-xl text-brand">
          {t("Tous les sports, moins chers.", "Every sport, for less.")}
        </p>
      </div>

      <div
        ref={viewport}
        /*
          `overflow-x-auto` sert aux deux usages : c'est lui qui autorise le
          balayage tactile natif, et c'est la même propriété que la boucle
          automatique manipule. `overscroll-x-contain` empêche le geste de
          déclencher le « retour » du navigateur en bout de course.
        */
        className={cn(
          "no-scrollbar relative select-none overflow-x-auto overscroll-x-contain",
          // affordance : la main ouverte annonce qu'on peut saisir, fermée qu'on tient
          grabbing ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={(e) => {
          origin.current = { x: e.clientX, y: e.clientY };
          dragged.current = false;
          takeOver();

          if (e.pointerType === "mouse") {
            /*
              Pas de `setPointerCapture` ici : tant que la capture est active, le
              navigateur redirige aussi le `click` vers l'élément capturant, et
              un clic net n'atteindrait plus la tuile. On ne capture qu'une fois
              le glissement engagé, où le clic est de toute façon annulé.
            */
            mouseDrag.current = { x: e.clientX, captured: false };
            setGrabbing(true);
          }
        }}
        onPointerMove={(e) => {
          if (origin.current && Math.abs(e.clientX - origin.current.x) > DRAG_PX) {
            dragged.current = true;
            armIdle();
          }

          const drag = mouseDrag.current;
          if (!drag) return;

          /* Le geste devient un vrai glissement : on prend la capture pour
             continuer à le suivre même si le curseur quitte le bandeau. */
          if (!drag.captured && dragged.current) {
            drag.captured = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          /*
            Déplacement RELATIF à la dernière position, et non à celle du clic
            initial : la position peut être repliée d'une période en cours de
            geste, un calcul absolu ferait alors un saut d'un tour de catalogue.
          */
          const el = e.currentTarget;
          const dx = e.clientX - drag.x;
          drag.x = e.clientX;
          el.scrollLeft = wrap(el.scrollLeft - dx, periodOf(el));
          armIdle();
        }}
        onPointerUp={(e) => {
          origin.current = null;
          if (mouseDrag.current) {
            const captured = mouseDrag.current.captured;
            mouseDrag.current = null;
            setGrabbing(false);
            if (captured && e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
          }
          armIdle();
        }}
        onPointerCancel={() => {
          origin.current = null;
          mouseDrag.current = null;
          setGrabbing(false);
          armIdle();
        }}
        /* Un glissement ne doit pas ouvrir la tuile relâchée sous le doigt. */
        onClickCapture={(e) => {
          if (dragged.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        /* Molette : on ne prend la main que sur un geste horizontal, sinon un
           simple défilement vertical de la page figerait le bandeau au passage. */
        onWheel={(e) => {
          if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) takeOver();
        }}
        /* En pause, la boucle ne touche plus à `scrollLeft` : tout événement de
           défilement vient donc de l'utilisateur, inertie iOS comprise. C'est
           donc ici qu'on l'empêche d'atteindre un bord, en le replaçant dans la
           copie centrale dès qu'il en sort. */
        onScroll={(e) => {
          if (!pausedRef.current) return;
          armIdle();
          const el = e.currentTarget;
          const period = periodOf(el);
          const wrapped = wrap(el.scrollLeft, period);
          if (Math.abs(wrapped - el.scrollLeft) > 1) el.scrollLeft = wrapped;
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHovering(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setHovering(false);
        }}
      >
        <div className="flex w-max gap-4">
          {Array.from({ length: COPIES }, () => categories)
            .flat()
            .map((c, i) => {
              /* Les copies ne sont là que pour la boucle : les lecteurs d'écran
                 et la tabulation ne doivent parcourir le catalogue qu'une fois. */
              const copy = i >= categories.length;
              return (
                <Link
                  key={`${c.slug}-${i}`}
                  /* Le sport voyage dans l'URL : la page de recherche ouvre
                     avec son filtre « Type de cours » déjà posé. */
                  href={`/offres?sport=${c.slug}`}
                  className="relative h-40 w-64 shrink-0 overflow-hidden rounded-2xl ring-1 ring-line"
                  aria-label={copy ? undefined : t(c.label, c.labelEn)}
                  aria-hidden={copy || undefined}
                  tabIndex={copy ? -1 : undefined}
                  /* Le navigateur propose sinon son propre glisser-déposer
                     d'image et de lien, qui avale le geste de balayage. */
                  draggable={false}
                >
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="256px"
                    draggable={false}
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-lg font-medium text-white">
                    {t(c.label, c.labelEn)}
                  </span>
                </Link>
              );
            })}
        </div>
      </div>
    </section>
  );
}
