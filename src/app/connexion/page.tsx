import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthForm } from "@/components/auth/auth-form";
import { ConnexionBrandPanel } from "./brand-panel";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous ou créez votre compte FREEFLO pour réserver vos cours de sport à prix qui fond.",
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-20 md:pt-24">
        <div className="grid min-h-[calc(100dvh-6rem)] lg:grid-cols-2">
          <ConnexionBrandPanel />
          {/*
            Alignement haut à partir de `lg`, et non centrage : le volet de
            gauche a une hauteur fixe, alors que le formulaire change de taille
            entre « Se connecter » et « Créer un compte ». Centré, il descendait
            de 9 px sur l'un et remontait de 20 px sur l'autre, si bien que les
            deux colonnes ne commençaient jamais au même niveau.

            `lg:pt-12` respire ensuite de 48 px : la photo garde son bord haut
            collé à la barre, le formulaire descend un peu pour ne pas démarrer
            au ras de l'en-tête. La photo, elle, n'est pas touchée.

            Sous `lg`, le volet est masqué : le centrage et sa marge haute
            restent, il n'y a plus rien à aligner.
          */}
          <div className="flex items-center justify-center px-6 py-16 lg:items-start lg:pt-12">
            <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-3xl bg-secondary/50" />}>
              <AuthForm />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
