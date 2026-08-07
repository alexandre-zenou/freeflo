"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export default function NotFound() {
  const t = useT();

  return (
    <>
      <SiteHeader />
      <main className="grid min-h-dvh place-items-center brand-mesh grain">
        <div className="ff-container text-center">
          <p className="display text-[clamp(4rem,14vw,9rem)] text-ink">404</p>
          <p className="accent-em -mt-2 text-2xl text-brand">
            {t("Ce créneau est déjà parti.", "That slot is already gone.")}
          </p>
          <p className="mx-auto mt-4 max-w-md text-ink/70">
            {t(
              "La page n'existe plus, mais d'autres cours se libèrent en ce moment près de vous.",
              "This page is gone, but other classes are opening up near you right now.",
            )}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg" variant="solid">
              <Link href="/offres">{t("Voir les cours", "See classes")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">{t("Accueil", "Home")}</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
