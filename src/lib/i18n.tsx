"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

export type Locale = "fr" | "en";

const STORAGE_KEY = "ff-locale";
const EVENT = "ff-locale-change";

/**
 * i18n volontairement minimal : pas de fichiers de traduction à maintenir,
 * chaque composant passe ses deux versions — `t("Réserver", "Book")`. Les
 * données (offres, étapes, textes légaux…) portent des champs `*En` jumeaux.
 * Sans version anglaise, on retombe sur le français plutôt qu'une clé nue.
 *
 * La préférence vit dans `localStorage`, lu via `useSyncExternalStore` : c'est
 * un magasin externe, donc React s'en charge sans setState dans un effet, le
 * rendu serveur reste en français et l'hydratation ne diverge pas. Bonus : le
 * changement de langue se propage aux autres onglets.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "en" ? "en" : "fr";
  } catch {
    /* localStorage indisponible (navigation privée) : on reste en français */
    return "fr";
  }
}

/** Le serveur rend toujours le français ; la préférence s'applique après hydratation. */
const getServerSnapshot = (): Locale => "fr";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({ locale: "fr", setLocale: () => {} });

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((l: Locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* préférence non persistée, sans conséquence pour l'affichage */
    }
    document.documentElement.lang = l;
    window.dispatchEvent(new Event(EVENT));
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
