import Link from "next/link";
import { Logo } from "@/components/logo";
import { site, nav } from "@/lib/site";

const columns = [
  {
    title: "Découvrir",
    links: [
      { label: "Trouver un cours", href: "/offres" },
      { label: "Comment ça marche", href: "/comment-ca-marche" },
      { label: "Catégories", href: "/offres" },
    ],
  },
  {
    title: "Les centres",
    links: [
      { label: "Inscrire mon centre", href: "/inscrire-son-centre" },
      { label: "Espace pro", href: "/pro" },
      { label: "Tarifs & commission", href: "/inscrire-son-centre" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "CGU / CGV", href: "/mentions-legales" },
      { label: "Confidentialité (RGPD)", href: "/mentions-legales" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink text-bone">
      <div className="ff-container grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo onDark />
          <p className="mt-4 text-sm leading-relaxed text-white/60">{site.description}</p>
          <div className="mt-6 flex gap-4 text-sm text-white/60">
            <a href={site.social.instagram} className="hover:text-white">Instagram</a>
            <a href={site.social.tiktok} className="hover:text-white">TikTok</a>
            <a href={site.social.linkedin} className="hover:text-white">LinkedIn</a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="eyebrow text-white/45">{col.title}</h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/75 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="ff-container flex flex-col items-start justify-between gap-3 py-6 text-xs text-white/45 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {site.name}. Le sport de dernière minute. — Démo studio Orvane.</p>
          <p className="serif-em text-sm text-white/60">« {site.tagline} »</p>
        </div>
      </div>
      <Link href={nav.vendorCta.href} className="sr-only">
        {nav.vendorCta.label}
      </Link>
    </footer>
  );
}
