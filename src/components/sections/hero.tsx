"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

/**
 * Héros de la maquette cliente : vidéo plein cadre (boxeuse, ring jaune puis
 * rouge), titre centré en gras, un seul bouton fantôme.
 *
 * Coût réseau — la vidéo était le premier poste de transfert du site. Deux
 * mesures, plutôt que de la couper :
 *
 * 1. **Deux encodages.** L'original fait 1280×720 (618 Ko en webm), ce qui n'a
 *    aucun sens sur un écran de 375 px. Une version 640 px (234 Ko) est servie
 *    en dessous de 768 px : 62 % de moins, sans différence visible à l'écran.
 * 2. **Le poster comme socle.** Il s'affiche immédiatement et reste seul si
 *    l'utilisateur est en « économiseur de données », en 2G, ou demande de
 *    réduire les animations. C'est une image du même plan : rien ne manque.
 */
type Variant = "none" | "mobile" | "desktop";

function useVideoVariant(): Variant {
  const [variant, setVariant] = useState<Variant>("none");

  useEffect(() => {
    const decide = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // `connection` n'existe pas partout : son absence n'est pas un refus.
      const conn = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      const saveData = conn?.saveData === true;
      /*
        On ne bloque que sur le vraiment lent (2G). Volontairement PAS sur « 3g » :
        beaucoup de navigateurs annoncent 3g par prudence, y compris sur des postes
        fixes câblés — la vidéo de la cliente ne se serait jamais affichée.
      */
      const slow = conn?.effectiveType ? /^(slow-)?2g$/.test(conn.effectiveType) : false;

      if (reduced || saveData || slow) return setVariant("none");
      setVariant(window.matchMedia("(min-width: 768px)").matches ? "desktop" : "mobile");
    };

    decide();
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", decide);
    return () => mq.removeEventListener("change", decide);
  }, []);

  return variant;
}

export function Hero() {
  const t = useT();
  const variant = useVideoVariant();
  const suffix = variant === "mobile" ? "-mobile" : "";

  return (
    <section className="relative min-h-dvh overflow-hidden bg-brand-deep">
      <div className="absolute inset-0">
        {/* Toujours présent : c'est le rendu de base, et le poster de la vidéo. */}
        <Image
          src="/video/hero-poster.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {variant !== "none" && (
          /* `key` : changer de variante remonte l'élément, sinon le navigateur
             garderait la source déjà chargée. */
          <video
            key={variant}
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          >
            <source src={`/video/hero${suffix}.webm`} type="video/webm" />
            <source src={`/video/hero${suffix}.mp4`} type="video/mp4" />
          </video>
        )}

        {/* voile rouge : assoit le contraste du titre par-dessus la vidéo */}
        <div className="absolute inset-0 bg-brand-deep/35 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_50%,rgba(131,6,6,0.5),rgba(131,6,6,0.12)_62%,transparent_82%)]" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="display rise max-w-5xl text-[clamp(2.5rem,7vw,5.5rem)] text-white [text-shadow:0_2px_30px_rgba(60,2,2,0.6)]">
          {t("Burn Calories, Not Cash.")}
        </h1>

        <div className="rise mt-10" style={{ animationDelay: "0.18s" }}>
          <Button asChild size="lg" variant="ghostline">
            <Link href="/offres">{t("Trouver mon cours de sport", "Find my class")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
