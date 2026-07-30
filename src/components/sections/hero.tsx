"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

/**
 * Héros de la maquette cliente : plein cadre rouge, titre centré en gras,
 * un seul bouton fantôme. La photo boxe fournie par le client (salle rouge,
 * cordes jaunes) reprend exactement le cadrage de la maquette.
 */
export function Hero() {
  const t = useT();

  return (
    <section className="relative min-h-dvh overflow-hidden bg-brand-deep">
      <div className="absolute inset-0">
        <Image
          src="/categories/boxe.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* voile rouge : unifie la photo avec la charte et pose le contraste du titre */}
        <div className="absolute inset-0 bg-brand-deep/45 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_50%,rgba(131,6,6,0.55),rgba(131,6,6,0.12)_62%,transparent_82%)]" />
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
