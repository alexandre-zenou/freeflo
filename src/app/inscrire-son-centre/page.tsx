import type { Metadata } from "next";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { VendorSignup } from "@/components/vendor/vendor-signup";
import { vendorValue, stats } from "@/lib/site";
import { TIERS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Inscrire mon centre de sport",
  description:
    "Remplissez vos créneaux vides sans abonnement. Commission dégressive, virements quotidiens, mise en ligne en 2 minutes. FREEFLO recrute les centres de sport.",
};

const onboarding = [
  { n: "01", t: "Créez votre compte pro", d: "Nom du centre, SIRET, coordonnées. Gratuit, sans carte." },
  { n: "02", t: "On vérifie votre entité", d: "Contrôle SIRET / IBAN sous 24 h (anti-fraude), puis activation." },
  { n: "03", t: "Publiez une offre", d: "Quantité, créneau, prix plein. Dupliquez celle d'hier en un clic." },
  { n: "04", t: "Encaissez, chaque jour", d: "Paiement Stripe, virement quotidien. Suivez tout depuis votre tableau de bord." },
];

const bands = ["> 5 places", "3 à 5 places", "1 à 2 places"];

export default function InscrirePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Espace centres de sport"
          title={<>Une place vide ne rapporte rien. <span className="serif-em text-brand">Changez ça.</span></>}
          intro="FREEFLO transforme vos créneaux invendus en revenus, sans abonnement ni risque. Vous ne payez qu'une commission quand vous vendez — et elle baisse quand vous bradez."
        />

        {/* value + form */}
        <section className="ff-container py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <Reveal stagger={0.1} className="grid gap-4 sm:grid-cols-2">
                {vendorValue.map((v) => (
                  <div key={v.title} className="rounded-2xl bg-paper p-6 shadow-soft ring-1 ring-line">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-tint text-brand">
                      <Check className="h-4 w-4" />
                    </span>
                    <h3 className="mt-4 font-medium text-ink">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.text}</p>
                  </div>
                ))}
              </Reveal>
              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="font-display text-3xl font-medium text-ink">{s.value}</dt>
                    <dd className="mt-1 text-xs text-ink-soft">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div id="signup" className="lg:sticky lg:top-28 lg:self-start">
              <VendorSignup />
            </div>
          </div>
        </section>

        {/* onboarding */}
        <section className="bg-secondary/40 py-20">
          <div className="ff-container">
            <SectionHeading eyebrow="La mise en route" title="En ligne en 2 minutes, payé dès demain." />
            <Reveal stagger={0.1} className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-line sm:grid-cols-2 lg:grid-cols-4">
              {onboarding.map((s) => (
                <div key={s.n} className="bg-cream p-7">
                  <span className="font-display text-4xl font-light text-gold">{s.n}</span>
                  <h3 className="mt-5 font-medium text-ink">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.d}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* commission grid */}
        <section className="ff-container py-20">
          <SectionHeading
            eyebrow="Commission dégressive"
            title="Plus vous bradez, moins on prélève."
            intro="La réduction s'aligne sur le temps restant et les places libres. Notre commission suit l'inverse : elle baisse quand la remise monte, pour que lister jusqu'au bout reste toujours votre intérêt."
          />
          <div className="mt-10 overflow-x-auto rounded-3xl bg-paper p-2 shadow-soft ring-1 ring-line">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-ink-soft">
                  <th className="p-3 font-medium">Temps avant l&apos;échéance</th>
                  {bands.map((b) => (
                    <th key={b} className="p-3 text-center font-medium">{b} libres</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...TIERS].reverse().map((tier) => (
                  <tr key={tier.label} className="border-t border-line">
                    <td className="p-3 text-ink">{tier.label}</td>
                    {tier.discount.map((d, i) => (
                      <td key={i} className="p-3 text-center tabular-nums">
                        <span className={d > 0 ? "font-medium text-brand-deep" : "text-ink-soft"}>
                          {d === 0 ? "plein tarif" : `−${d}%`}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Commission plateforme : 25 % au plein tarif, dégressive jusqu&apos;à 8 % en sprint final. Aucun coût fixe.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
