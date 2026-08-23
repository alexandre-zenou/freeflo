"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
 *    l'utilisateur est en « économiseur de données » ou en 2G. C'est une image
 *    du même plan : rien ne manque.
 */
type Variant = "none" | "mobile" | "desktop";

function useVideoVariant(): Variant {
  const [variant, setVariant] = useState<Variant>("none");

  useEffect(() => {
    const decide = () => {
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

      /*
        `prefers-reduced-motion` ne coupe PLUS la vidéo (décision cliente du
        22/08/2026) : la bannière doit être vue par tout le monde. Seules les
        deux raisons de coût réseau subsistent ci-dessus, parce qu'elles
        répondent à une demande explicite du visiteur d'économiser ses données.
      */
      if (saveData || slow) return setVariant("none");

      if (window.matchMedia("(min-width: 768px)").matches) return setVariant("desktop");

      /*
        Encodage mobile (640 px) seulement si l'écran en tire vraiment parti.
        En portrait, `object-cover` cadre sur la HAUTEUR : sur un iPhone 390x844
        la source est étirée à 1500 px de large, soit 4500 px réels en densité 3.
        Le fichier 640 px y est agrandi 7 fois et la vidéo de la cliente paraît
        floue. Au-delà de la densité 2, on sert donc l'encodage 1280 px.
      */
      const dense = window.devicePixelRatio >= 2;
      setVariant(dense ? "desktop" : "mobile");
    };

    decide();
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", decide);
    return () => mq.removeEventListener("change", decide);
  }, []);

  return variant;
}

/**
 * Démarrage de la lecture sur iOS. Trois obstacles que Chrome ignore et que
 * Safari sur iPhone applique strictement :
 *
 * 1. **`muted` doit être un attribut du DOM**, pas seulement une propriété.
 *    React ne pose que la propriété : au moment où Safari évalue l'autoplay,
 *    la balise n'annonce pas qu'elle est muette et la lecture est refusée.
 * 2. **`autoplay` seul ne suffit pas toujours** : on rappelle `play()` une fois
 *    les premières données reçues. La promesse rejetée est normale (mode économie
 *    d'énergie) — on l'avale, le poster reste alors seul à l'écran.
 * 3. **iOS met la vidéo en pause en quittant l'onglet** et ne la reprend pas
 *    toujours au retour : on relance sur `visibilitychange`.
 */
function useAutoplay(enabled: boolean) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!enabled || !v) return;

    v.defaultMuted = true;
    v.muted = true;
    v.setAttribute("muted", "");

    const play = () => void v.play().catch(() => {});
    const onVisible = () => {
      if (document.visibilityState === "visible") play();
    };

    play();
    v.addEventListener("loadeddata", play);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      v.removeEventListener("loadeddata", play);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);

  return ref;
}

export function Hero() {
  const t = useT();
  const variant = useVideoVariant();
  const suffix = variant === "mobile" ? "-mobile" : "";
  const videoRef = useAutoplay(variant !== "none");

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
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/video/hero-poster.jpg"
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
          {t("Burn Calories, Not Cash")}
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
