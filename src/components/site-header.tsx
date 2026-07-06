"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader({ overHero = false }: { overHero?: boolean }) {
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
        solid ? "border-b border-line bg-bone/85 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      <div className="ff-container flex h-16 items-center justify-between md:h-[4.5rem]">
        <Logo onDark={onDark} />

        <nav className="hidden items-center gap-8 md:flex">
          {nav.primary.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm transition-colors",
                onDark ? "text-white/85 hover:text-white" : "text-ink-soft hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={nav.auth[0].href}
            className={cn(
              "text-sm transition-colors",
              onDark ? "text-white/85 hover:text-white" : "text-ink-soft hover:text-ink",
            )}
          >
            Connexion
          </Link>
          <Button asChild variant={onDark ? "ghostline" : "solid"} size="sm">
            <Link href={nav.vendorCta.href}>{nav.vendorCta.label}</Link>
          </Button>
        </div>

        <button
          className={cn("md:hidden", onDark ? "text-white" : "text-ink")}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-bone md:hidden">
          <div className="ff-container flex flex-col gap-1 py-4">
            {[...nav.primary, nav.vendorCta].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-ink hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
