"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Locale = "fr" | "en";

const STORAGE_KEY = "ff-locale";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({ locale: "fr", setLocale: () => {} });

/**
 * i18n volontairement minimal : pas de fichiers de traduction à maintenir,
 * chaque composant passe ses deux versions — `t("Réserver", "Book")`.
 * Sans version anglaise, on retombe sur le français plutôt que d'afficher une clé.
 *
 * Le rendu initial est toujours `fr` (serveur et client) : la préférence
 * enregistrée n'est appliquée qu'après hydratation, ce qui évite tout mismatch.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "fr") {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      /* localStorage indisponible (mode privé) : on reste en français */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    document.documentElement.lang = l;
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* préférence non persistée, sans conséquence pour l'affichage */
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** `t(fr, en)` — renvoie l'anglais si disponible et actif, sinon le français. */
export function useT() {
  const { locale } = useLocale();
  return useCallback(
    (fr: string, en?: string) => (locale === "en" && en ? en : fr),
    [locale],
  );
}
