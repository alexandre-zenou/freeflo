"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export function CommentCaMarcheHero() {
  const t = useT();

  return (
    <PageHero
      eyebrow={t("Le concept", "The idea")}
      title={
        <>
          {t("Le bon plan sport, ", "The good sport deal, ")}
          <span className="accent-em text-gold">{t("en direct.", "live.")}</span>
        </>
      }
      intro={t(
        "Les salles ont des places vides à chaque créneau. FREEFLO les libère à prix cassé, en temps réel, pour les sportifs près de chez elles. Tout le monde y gagne.",
        "Studios have empty places at every slot. FREEFLO releases them at a cut price, in real time, to people training nearby. Everyone wins.",
      )}
    >
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg" variant="gold">
          <Link href="/offres">
            {t("Voir les cours près de moi", "See classes near me")} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="ghostline">
          <Link href="/inscription-centre">{t("Je gère un centre", "I run a centre")}</Link>
        </Button>
      </div>
    </PageHero>
  );
}
