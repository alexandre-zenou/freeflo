"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { LocaleSwitch } from "@/components/locale-switch";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function SiteHeader({ overHero = false }: { overHero?: boolean }) {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !overHero || open;
  const onDark = overHero && !solid;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid ? "border-b border-line bg-cream/85 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      {/*
        Retour client : « décaler le texte vers la droite » et « ajouter rubrique
        inscrire mon centre à droite d'espace pro ». Le logo reste seul à gauche,
        tout le reste forme un bloc aligné à droite.
      */}
      <div className="ff-container flex h-16 items-center justify-between md:h-[4.5rem]">
        <Logo onDark={onDark} />

        <div className="hidden items-center gap-7 md:flex">
          <nav className="flex items-center gap-7">
            {nav.primary.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm transition-colors",
                  onDark ? "text-white/85 hover:text-white" : "text-ink-soft hover:text-ink",
                )}
              >
                {t(l.label, l.labelEn)}
              </Link>
            ))}
            <Link
              href={nav.vendorCta.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                onDark
                  ? "bg-white/15 text-white hover:bg-white/25"
                  : "bg-brand-tint text-brand hover:bg-brand hover:text-white",
              )}
            >
              {t(nav.vendorCta.label, nav.vendorCta.labelEn)}
            </Link>
          </nav>
          <LocaleSwitch onDark={onDark} />
        </div>

        <button
          className={cn("md:hidden", onDark ? "text-white" : "text-ink")}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t("Fermer le menu", "Close menu") : t("Ouvrir le menu", "Open menu")}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-cream md:hidden">
          <div className="ff-container flex flex-col gap-1 py-4">
            {[...nav.primary, nav.vendorCta].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-ink hover:bg-secondary"
              >
                {t(l.label, l.labelEn)}
              </Link>
            ))}
            <div className="px-2 pt-2">
              <LocaleSwitch onDark={false} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
