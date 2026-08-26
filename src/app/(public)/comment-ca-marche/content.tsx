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
      /*
        Trois fragments et non deux : le segment en or n'occupe pas la même
        place dans les deux langues. Il finit le titre français et se glisse
        au milieu de l'anglais, où « last-minute » qualifie « sport deal ».
      */
      title={
        <>
          {t("Le bon plan sport ", "The ")}
          <span className="accent-em text-gold">{t("de dernière minute", "last-minute")}</span>
          {t("", " sport deal")}
        </>
      }
      intro={t(
        "FREEFLO permet de réserver des cours de pilates, yoga, boxe ou HIIT en dernière minute, à prix réduit, en valorisant les places vides des studios pour encourager l'activité sportive.",
        "FREEFLO lets you book Pilates, yoga, boxing or HIIT classes at the last minute, at a reduced price, by putting studios' empty places to use and getting more people moving.",
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
