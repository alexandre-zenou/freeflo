"use client";

import { Check } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { VendorSignup } from "@/components/vendor/vendor-signup";
import { vendorValue, stats } from "@/lib/site";
import { useT } from "@/lib/i18n";

const onboarding = [
  {
    n: "01",
    t: "Créez votre compte pro",
    tEn: "Create your pro account",
    d: "Nom du centre, SIRET, coordonnées. Gratuit, sans carte.",
    dEn: "Centre name, business number, contact details. Free, no card needed.",
  },
  {
    n: "02",
    t: "On vérifie votre entité",
    tEn: "We check your business",
    d: "Contrôle SIRET / IBAN sous 24 h (anti-fraude), puis activation.",
    dEn: "Business and bank details checked within 24 h (anti-fraud), then activation.",
  },
  {
    n: "03",
    t: "Publiez une offre",
    tEn: "Publish an offer",
    d: "Quantité, créneau, tarif plein. Dupliquez celle d'hier en un clic.",
    dEn: "Quantity, time slot, full price. Duplicate yesterday's in one click.",
  },
  {
    n: "04",
    t: "Encaissez, chaque jour",
    tEn: "Get paid, every day",
    d: "Paiement Stripe, virement quotidien. Suivez tout depuis votre tableau de bord.",
    dEn: "Stripe payment, daily payout. Follow everything from your dashboard.",
  },
];

export function InscrireContent() {
  const t = useT();

  return (
    <>
      <PageHero
        eyebrow={t("Espace centres de sport", "For sport centres")}
        title={
          <>
            {t("Une place vide ne rapporte rien. ", "An empty place earns nothing. ")}
            <span className="accent-em text-gold">{t("Changez ça.", "Change that.")}</span>
          </>
        }
        intro={t(
          "FREEFLO transforme vos créneaux invendus en revenus, sans abonnement ni risque. Vous ne payez qu'une commission quand vous vendez, et elle baisse quand vous bradez.",
          "FREEFLO turns your unsold slots into revenue, with no subscription and no risk. You only pay a commission when you sell, and it drops as the discount deepens.",
        )}
      />

      <section className="ff-container py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <Reveal stagger={0.1} className="grid gap-4 sm:grid-cols-2">
              {vendorValue.map((v) => (
                <div key={v.title} className="rounded-2xl bg-paper p-6 shadow-soft ring-1 ring-line">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-tint text-brand">
                    <Check className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 font-medium text-ink">{t(v.title, v.titleEn)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(v.text, v.textEn)}</p>
                </div>
              ))}
            </Reveal>
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl font-medium text-ink">{s.value}</dt>
                  <dd className="mt-1 text-xs text-ink-soft">{t(s.label, s.labelEn)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div id="signup" className="lg:sticky lg:top-28 lg:self-start">
            <VendorSignup />
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="ff-container">
          <SectionHeading
            eyebrow={t("La mise en route", "Getting started")}
            title={t("En ligne en 2 minutes, payé dès demain.", "Live in 2 minutes, paid tomorrow.")}
          />
          <Reveal stagger={0.1} className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-line sm:grid-cols-2 lg:grid-cols-4">
            {onboarding.map((s) => (
              <div key={s.n} className="bg-cream p-7">
                <span className="font-display text-4xl font-light text-gold">{s.n}</span>
                <h3 className="mt-5 font-medium text-ink">{t(s.t, s.tEn)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(s.d, s.dEn)}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
