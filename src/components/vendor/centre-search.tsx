"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Building2, ArrowRight } from "lucide-react";
import { offers } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

/**
 * Première étape de l'inscription d'un centre : « identifions votre commerce ».
 *
 * Retour client (planche 22) : un champ « Rechercher le nom du commerce », un
 * bouton « Continuer » jaune, un lien « Connectez-vous » jaune, et les liens vers
 * la politique de confidentialité et les CGU.
 *
 * Démo : les suggestions viennent des centres du jeu de données. En production,
 * ce champ interrogera un annuaire d'établissements (SIRENE ou équivalent).
 */
export function CentreSearch() {
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);

  const known = useMemo(
    () => [...new Set(offers.map((o) => `${o.gym}, ${o.arrondissement}`))].sort(),
    [],
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return known.filter((k) => k.toLowerCase().includes(q)).slice(0, 5);
  }, [known, query]);

  const canContinue = Boolean(picked ?? query.trim());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    // L'étape suivante est le formulaire complet (SIRET, IBAN, coordonnées).
    router.push("/inscrire-son-centre#signup");
  };

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-xl">
      <div className="relative">
        <label className="flex items-center gap-3 rounded-full border-2 border-white/40 bg-white/10 px-6 py-4 text-white transition-colors focus-within:border-gold">
          <Search className="h-5 w-5 shrink-0 text-gold" />
          <span className="sr-only">{t("Rechercher le nom du commerce", "Search for the business name")}</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPicked(null);
            }}
            placeholder={t("Rechercher le nom du commerce", "Search for the business name")}
            className="w-full bg-transparent text-base outline-none placeholder:text-white/60"
          />
        </label>

        {suggestions.length > 0 && !picked && (
          <ul className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-paper p-1.5 text-left shadow-lift">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => {
                    setPicked(s);
                    setQuery(s);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink transition-colors hover:bg-secondary"
                >
                  <Building2 className="h-4 w-4 shrink-0 text-brand" />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 text-sm text-white/80">
        {t("En poursuivant, vous acceptez la", "By continuing, you accept the")}{" "}
        <Link href="/confidentialite" className="font-bold text-gold underline underline-offset-4 hover:text-gold-bright">
          {t("politique de confidentialité", "privacy policy")}
        </Link>{" "}
        {t("et les", "and the")}{" "}
        <Link href="/cgu-cgv" className="font-bold text-gold underline underline-offset-4 hover:text-gold-bright">
          {t("conditions générales d'utilisation", "terms of use")}
        </Link>{" "}
        {t("de FREEFLO.", "of FREEFLO.")}
      </p>

      <button
        type="submit"
        disabled={!canContinue}
        className={cn(
          "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-bold transition-colors",
          canContinue
            ? "bg-gold-bright text-ink hover:bg-gold"
            : "cursor-not-allowed bg-white/20 text-white/60",
        )}
      >
        {t("Continuer", "Continue")} <ArrowRight className="h-4 w-4" />
      </button>

      <p className="mt-6 text-sm text-white/85">
        {t("Vous avez déjà un compte commerçant ?", "Already have a merchant account?")}{" "}
        <Link href="/connexion" className="font-bold text-gold underline underline-offset-4 hover:text-gold-bright">
          {t("Connectez-vous", "Log in")}
        </Link>
      </p>
    </form>
  );
}
