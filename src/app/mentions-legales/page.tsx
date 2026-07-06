import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales & CGU",
  description: "Mentions légales, CGU/CGV et politique de confidentialité (RGPD) de FREEFLO.",
  robots: { index: false, follow: false },
};

const sections = [
  {
    h: "Éditeur du site",
    p: `${site.name} — plateforme de mise en relation entre centres de sport et sportifs. Contenu de démonstration produit par le studio Orvane. Les informations légales définitives (raison sociale, SIRET, siège, hébergeur) seront renseignées avant mise en production.`,
  },
  {
    h: "Objet de la plateforme",
    p: "FREEFLO permet aux centres de sport (entités professionnelles) de publier des places de cours invendues à prix réduit, et aux clients de les réserver et payer en ligne. Le prix affiché est recalculé en continu selon la grille de dégressivité tarifaire.",
  },
  {
    h: "CGU — clients",
    p: "La réservation est validée après confirmation du paiement. Annulation avec remboursement intégral jusqu'à 6 h avant le créneau ; au-delà, la place est due. En cas de cours annulé par le centre, remboursement automatique et possibilité de réclamation.",
  },
  {
    h: "CGU / CGV — centres partenaires",
    p: "Aucun abonnement. Une commission dégressive est prélevée sur chaque vente (25 % au plein tarif, jusqu'à 8 % en sprint final). Les reversements sont effectués quotidiennement sur l'IBAN vérifié du centre. L'activation d'un compte est conditionnée à la vérification du SIRET et de l'IBAN.",
  },
  {
    h: "Paiement",
    p: "Les paiements sont traités par Stripe. FREEFLO ne stocke aucune donnée de carte bancaire. (Version de démonstration : aucun paiement réel n'est traité.)",
  },
  {
    h: "Responsabilité",
    p: "FREEFLO agit comme intermédiaire technique. La bonne exécution du cours, la sécurité et les assurances (RC pro) relèvent du centre de sport. Une clause de non-responsabilité en cas de blessure sera validée par un juriste avant production.",
  },
  {
    h: "Données personnelles (RGPD)",
    p: "Consentement explicite au traitement, droit d'accès, de rectification et à l'effacement, export des données personnelles sur demande. Les données de géolocalisation ne sont utilisées que pour afficher les offres proches et ne sont pas conservées sans consentement.",
  },
];

export default function MentionsLegalesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero compact eyebrow="Informations légales" title="Mentions légales & conditions" />
        <section className="ff-container max-w-3xl py-16">
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="font-display text-2xl text-ink">{s.h}</h2>
                <p className="mt-3 leading-relaxed text-ink-soft">{s.p}</p>
              </div>
            ))}
          </div>
          <p className="mt-14 border-t border-line pt-6 text-sm text-ink-soft">
            Document de démonstration — non contractuel. Dernière mise à jour : 2026.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
