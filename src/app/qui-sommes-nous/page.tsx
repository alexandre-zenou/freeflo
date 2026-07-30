import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { steps } from "@/lib/site";

export const metadata: Metadata = {
  title: "Qui sommes nous ?",
  description:
    "FREEFLO libère les places de cours de sport invendues près de chez vous. Notre mission : remplir les salles, faire bouger plus de monde, sans abonnement.",
};

const convictions = [
  {
    title: "Une place vide ne vaut rien",
    text: "Chaque créneau non rempli est une perte sèche pour le centre et une occasion manquée pour le sportif. Nous transformons ce vide en valeur, des deux côtés.",
  },
  {
    title: "Le sport sans abonnement",
    text: "Pas d'engagement, pas de carte à l'année. On réserve une séance quand on en a envie, au prix du moment, près de chez soi.",
  },
  {
    title: "Les centres restent maîtres",
    text: "Le centre choisit ses créneaux, son prix plein et son prix plancher. FREEFLO ne prélève une commission que lorsqu'une place se vend.",
  },
];

export default function QuiSommesNousPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Qui sommes nous ?"
          title={<>Remplir les salles, faire bouger plus de monde.</>}
          intro="FREEFLO est né d'un constat simple : chaque soir, des milliers de places de cours partent à la poubelle pendant que des sportifs renoncent faute de budget. Nous mettons les deux en relation, à la dernière minute."
        >
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="gold">
              <Link href="/offres">Trouver mon cours de sport <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/inscrire-son-centre">Je gère un centre</Link>
            </Button>
          </div>
        </PageHero>

        <section className="ff-container py-20 md:py-24">
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-3">
            {convictions.map((c) => (
              <div key={c.title} className="border-t border-brand/25 pt-5">
                <h2 className="display text-xl text-brand">{c.title}</h2>
                <p className="mt-3 leading-relaxed text-ink-soft">{c.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-brand-deep py-20 text-white md:py-24">
          <div className="ff-container">
            <h2 className="display text-[clamp(1.75rem,3.4vw,2.6rem)] uppercase">
              Comment ça marche
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <div key={s.n}>
                  <h3 className="display text-2xl text-gold">{s.n}. {s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/85">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
