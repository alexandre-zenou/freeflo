"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionHeading } from "@/components/section-heading";
import { steps } from "@/lib/site";

/**
 * Scroll-driven concept walkthrough for /comment-ca-marche.
 * Adapted from 21st.dev "Timeline" (aceternity, id 857) — sticky step titles +
 * scroll-progress beam — re-skinned to the FREEFLO editorial system: serif
 * numerals, hairline rail, and a beam that heats from periwinkle to ember as
 * you scroll (the dégressivité metaphor).
 */
const details = [
  "La carte affiche le prix à l'instant T, recalculé en continu — pas une estimation.",
  "Une fois bloqué, votre prix ne bouge plus, même si la jauge continue de chauffer.",
  "Votre QR code vit dans le navigateur — rien à installer, rien à imprimer.",
  "Votre note fait remonter les centres fiables. Et le prochain cours est déjà moins cher.",
];

export function ConceptTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) setHeight(ref.current.getBoundingClientRect().height);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <section ref={containerRef} className="ff-container py-24 md:py-32">
      <SectionHeading
        title={<>Le parcours, pas à pas.</>}
        intro="Quatre gestes, de la découverte au cours. Aucun compte à créer avant de voir les prix."
      />

      <div ref={ref} className="relative mt-16">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className="flex justify-start gap-6 pt-16 first:pt-0 md:gap-10 md:pt-28"
          >
            <div className="sticky top-28 z-10 flex max-w-[9rem] flex-col self-start sm:max-w-xs md:w-full lg:max-w-sm">
              <div className="flex items-baseline gap-4 rounded-r-full bg-bone/90 py-1 pl-12 pr-3 backdrop-blur-sm md:pl-16">
                <span className="serif-em text-2xl text-peri-deep md:text-3xl">{s.n}</span>
                <h3 className="display hidden text-2xl text-ink md:block md:text-4xl">
                  {s.title}
                </h3>
              </div>
            </div>

            <div className="relative w-full">
              <h3 className="display mb-3 block text-2xl text-ink md:hidden">{s.title}</h3>
              <p className="max-w-prose leading-relaxed text-ink/80">{s.text}</p>
              <p className="mt-6 max-w-prose border-t border-ink/20 pt-4 text-sm text-ink-soft">
                {details[i]}
              </p>
            </div>
          </div>
        ))}

        {/* rail + heat beam */}
        <div
          style={{ height: height + "px" }}
          className="absolute left-5 top-0 w-px overflow-hidden bg-line [mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_92%,transparent_100%)] md:left-7"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-px bg-gradient-to-b from-peri via-peri-deep to-ember-deep"
          />
        </div>
      </div>
    </section>
  );
}
