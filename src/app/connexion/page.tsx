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
      <main className="pt-16 md:pt-[4.5rem]">
        <div className="grid min-h-[calc(100dvh-4.5rem)] lg:grid-cols-2">
          <ConnexionBrandPanel />
          <div className="flex items-center justify-center px-6 py-16">
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
