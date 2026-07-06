import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthForm } from "@/components/auth/auth-form";
import { site } from "@/lib/site";

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
          {/* brand panel */}
          <div className="relative hidden overflow-hidden peri-mesh grain lg:block">
            <Image
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
              alt=""
              fill
              sizes="50vw"
              className="object-cover opacity-60 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-between p-12">
              <p className="eyebrow text-white/80">{site.city} · Le sport de dernière minute</p>
              <div>
                <p className="display text-5xl text-white">
                  Burn Calories,<br />Not <span className="serif-em">Cash.</span>
                </p>
                <p className="mt-4 max-w-sm text-white/80">
                  Des centaines de places de cours se libèrent chaque jour près de vous. Ne les laissez pas filer.
                </p>
              </div>
            </div>
          </div>

          {/* form */}
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
