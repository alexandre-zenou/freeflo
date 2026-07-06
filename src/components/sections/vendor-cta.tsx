import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { vendorValue, stats } from "@/lib/site";

export function VendorCta() {
  return (
    <section className="ff-container py-24 md:py-32">
      <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeading
            lead="Vous gérez un centre de sport ?"
            title={<>Remplissez vos créneaux vides. <span className="serif-em text-peri-deep">Gratuitement.</span></>}
            intro="Chaque place non vendue est une perte sèche. Listez-la sur FREEFLO en 2 minutes et récupérez de la valeur, sans abonnement ni engagement."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="ember">
              <Link href="/inscrire-son-centre">Inscrire mon centre <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pro">Voir l&apos;espace pro</Link>
            </Button>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-line pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-4xl font-medium text-ink">{s.value}</dt>
                <dd className="mt-1 text-sm text-ink-soft">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Reveal stagger={0.1} className="self-center">
          <ul className="divide-y divide-line border-y border-line">
            {vendorValue.map((v) => (
              <li key={v.title} className="grid gap-2 py-6 sm:grid-cols-[190px_1fr] sm:gap-8">
                <h3 className="font-medium leading-snug text-ink">{v.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{v.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
