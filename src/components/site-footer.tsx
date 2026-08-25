"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";
import { useT } from "@/lib/i18n";
import { useMember } from "@/lib/account";

/**
 * Pied de page.
 *
 * Retour client : fond rouge (« changer le gris anthracite par du rouge, le même
 * que le reste »), nouveau texte de présentation, lien « Tarifs & commission »
 * supprimé, et les trois liens légaux mènent enfin à trois pages distinctes.
 */
const columns = [
  {
    title: "Découvrir",
    titleEn: "Discover",
    links: [
      { label: "Trouver un cours", labelEn: "Find a class", href: "/offres" },
      { label: "Comment ça fonctionne", labelEn: "How it works", href: "/comment-ca-marche" },
      { label: "Catégories", labelEn: "Categories", href: "/offres" },
    ],
  },
  {
    title: "Les centres",
    titleEn: "For centres",
    links: [
      { label: "Inscrire mon centre", labelEn: "Sign up my centre", href: "/inscription-centre" },
    ],
  },
  {
    title: "Légal",
    titleEn: "Legal",
    links: [
      { label: "Mentions légales", labelEn: "Legal notice", href: "/mentions-legales" },
      { label: "CGU / CGV", labelEn: "Terms of use and sale", href: "/cgu-cgv" },
      { label: "Confidentialité (RGPD)", labelEn: "Privacy (GDPR)", href: "/confidentialite" },
    ],
  },
];

export function SiteFooter() {
  const t = useT();
  const member = useMember();

  /*
    « Inscrire mon centre » ne s'adresse qu'aux visiteurs non connectés, comme
    dans l'en-tête : une fois identifié, on a déjà un compte, et le parcours
    d'inscription d'un centre part d'une recherche de commerce.

    Une colonne vidée de tous ses liens disparaît : garder un intitulé « Les
    centres » au-dessus du vide se lirait comme une page cassée.
  */
  const isPro = member?.role === "admin" || member?.role === "centre";

  const visibles = columns
    /* L'administration ne voit plus le parcours sportif : ni « Trouver un
       cours », ni « Catégories », qui mènent à des pages dont sa navigation et
       ses gardes l'écartent déjà. Elle garde le légal et les pages centres. */
    .filter((col) => !(isPro && col.title === "Découvrir"))
    .map((col) => ({
      ...col,
      links: col.links.filter((l) => !(member && l.href === "/inscription-centre")),
    }))
    .filter((col) => col.links.length > 0);

  return (
    // Filet supérieur : sur les pages dont la dernière section est déjà rouge,
    // le pied de page s'y fondrait sans lui.
    <footer className="border-t border-gold/25 bg-brand-deep text-white">
      <div className="ff-container grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo onDark />
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            {t(
              "FREEFLO libère les places de cours de sport invendues près de chez vous. Plus l'heure approche, plus le prix fond. Réservez en dernière minute, et profitez-en !",
              "FREEFLO releases unsold sport class places near you. The closer the class, the lower the price. Book at the last minute, and make the most of it!",
            )}
          </p>
        </div>

        {visibles.map((col) => (
          <div key={col.title}>
            <h3 className="eyebrow text-gold">{t(col.title, col.titleEn)}</h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/85 transition-colors hover:text-gold">
                    {t(l.label, l.labelEn)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/15">
        <div className="ff-container flex flex-col items-start justify-between gap-3 py-6 text-xs text-white/65 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {site.name}. {t("Le sport de dernière minute. Démo studio Orvane.", "Last-minute sport. Studio Orvane demo.")}</p>
          <p className="accent-em text-sm text-gold">« {site.tagline} »</p>
        </div>
      </div>
    </footer>
  );
}
