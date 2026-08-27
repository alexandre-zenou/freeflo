"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, LogOut, Settings } from "lucide-react";
import { nav } from "@/lib/site";
import { signOut, useMember } from "@/lib/account";
import { useLocale, useT, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Pastille du compte, à l'extrême droite de l'en-tête, et son menu.
 *
 * Elle remplace le lien « Thomas » : le prénom en clair prenait la largeur d'une
 * rubrique de navigation sans en être une, et poussait le reste vers la gauche.
 *
 * Le menu regroupe ce qui relève du compte et non du site : la langue, les
 * informations du compte, et la déconnexion. C'est aussi ce qui permet de
 * retirer « FR / EN » de la barre pour un membre connecté.
 *
 * Le sélecteur de langue reste visible dans l'en-tête pour un VISITEUR, faute de
 * quoi le site perdrait son anglais pour qui n'a pas de compte.
 */
export function AccountMenu({ onDark = false }: { onDark?: boolean }) {
  const t = useT();
  const router = useRouter();
  const member = useMember();
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const racine = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  /*
    Fermeture : clic en dehors, et Échap. `mousedown` et non `click`, sinon un
    clic amorcé dans le menu et relâché dehors le refermerait, et inversement.
    Échap rend le focus à la pastille : au clavier, on le perdrait sans cela.
  */
  useEffect(() => {
    if (!open) return;
    /* Ouvrir le menu, c'est déjà viser la déconnexion : on prépare l'accueil
       maintenant plutôt qu'au clic. L'accueil est la route la plus lourde du
       site, et sur un écran connecté rien ne l'avait préchargée. */
    router.prefetch("/");
    const dehors = (e: MouseEvent) => {
      if (!racine.current?.contains(e.target as Node)) setOpen(false);
    };
    const touche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        bouton.current?.focus();
      }
    };
    document.addEventListener("mousedown", dehors);
    document.addEventListener("keydown", touche);
    return () => {
      document.removeEventListener("mousedown", dehors);
      document.removeEventListener("keydown", touche);
    };
  }, [open, router]);

  if (!member) return null;

  const nomComplet = [member.firstName, member.lastName].filter(Boolean).join(" ");
  const initiale = member.firstName.trim().slice(0, 1).toUpperCase();

  /* `push` avant `signOut` : dans l'autre sens, la page courante se re-rendait
     déconnectée pendant le trajet, et `/compte` montrait « réservé aux
     membres » à quelqu'un qui venait tout juste de partir. */
  const quitter = () => {
    setOpen(false);
    router.push("/");
    signOut();
  };

  return (
    <div ref={racine} className="relative">
      <button
        ref={bouton}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t(`Compte de ${member.firstName}`, `${member.firstName}'s account`)}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-full text-sm font-bold transition-colors",
          onDark
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-brand text-white hover:bg-brand-deep",
        )}
      >
        {initiale}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-line bg-paper shadow-lift"
        >
          {/* Qui est connecté : la pastille ne porte qu'une initiale, et deux
              comptes de la même famille partageraient la même. */}
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium text-ink">{nomComplet}</p>
            <p className="truncate text-xs text-ink-soft">{member.email}</p>
          </div>

          <div className="border-b border-line px-4 py-3">
            <p className="eyebrow text-ink-soft">{t("Langue", "Language")}</p>
            <div className="mt-2 flex gap-2">
              {nav.locales.map((l) => {
                const actif = locale === l.code;
                return (
                  <button
                    key={l.code}
                    role="menuitemradio"
                    aria-checked={actif}
                    onClick={() => setLocale(l.code as Locale)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm transition-colors",
                      actif
                        ? "bg-brand text-white"
                        : "bg-secondary text-ink-soft hover:bg-secondary/70 hover:text-ink",
                    )}
                  >
                    {actif && <Check className="h-3.5 w-3.5" />}
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Link
            href="/compte"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-ink transition-colors hover:bg-secondary"
          >
            <Settings className="h-4 w-4 text-ink-soft" />
            {t("Paramètres du compte", "Account settings")}
          </Link>

          <button
            role="menuitem"
            onClick={quitter}
            className="flex w-full items-center gap-3 border-t border-line px-4 py-3 text-left text-sm text-ink transition-colors hover:bg-brand-tint hover:text-brand"
          >
            <LogOut className="h-4 w-4 text-ink-soft" />
            {t("Se déconnecter", "Log out")}
          </button>
        </div>
      )}
    </div>
  );
}
