"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface StudioOption {
  /** Nom du centre, qui sert aussi de valeur : il identifie le studio ici. */
  name: string;
  /** Nombre d'offres de ce studio dans la sélection courante. */
  count: number;
}

/**
 * Filtre par studio : une recherche par nom, puis des cases à cocher.
 *
 * Sélection MULTIPLE, contrairement à `PillSelect` : on compare volontiers deux
 * ou trois salles d'un même quartier, et n'en autoriser qu'une obligerait à
 * refaire la recherche à chaque comparaison.
 *
 * La liste proposée ne contient que les studios ayant encore une offre après
 * les autres filtres : cocher un nom ne peut donc jamais donner zéro résultat
 * par surprise. Le compte affiché à droite de chaque nom dit d'avance ce qu'on
 * va obtenir.
 */
export function StudioFilter({
  options,
  value,
  onChange,
  className,
}: {
  options: StudioOption[];
  /** Noms des studios cochés. Tableau vide : aucun filtre. */
  value: string[];
  onChange: (v: string[]) => void;
  className?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  const bascule = (nom: string) =>
    onChange(value.includes(nom) ? value.filter((v) => v !== nom) : [...value, nom]);

  const actif = value.length > 0;
  const libelle = !actif
    ? t("Studio", "Studio")
    : value.length === 1
      ? value[0]
      : `${value.length} ${t("studios", "studios")}`;

  return (
    <div ref={root} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex max-w-[14rem] items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          actif
            ? "bg-brand text-white hover:bg-brand-deep"
            : "border border-brand/35 text-brand hover:bg-brand hover:text-white",
        )}
      >
        <span className="truncate">{libelle}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t("Filtrer par studio", "Filter by studio")}
          className="absolute left-0 top-full z-40 mt-2 w-[17rem] rounded-2xl bg-paper p-3 shadow-lift ring-1 ring-line"
        >
          <label className="flex items-center gap-2 rounded-full border border-brand/35 px-3 py-2 text-sm text-ink focus-within:border-brand">
            <Search className="h-4 w-4 shrink-0 text-brand" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Chercher un studio", "Search a studio")}
              className="w-full bg-transparent outline-none placeholder:text-ink-soft/70"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label={t("Effacer", "Clear")}>
                <X className="h-3.5 w-3.5 text-ink-soft hover:text-ink" />
              </button>
            )}
          </label>

          {/*
            Cinq lignes et demie, soit 198 px pour des lignes de 36. La demi
            ligne n'est pas un accident de calcul : c'est l'indice qui dit qu'il
            reste des studios en dessous. Une hauteur ronde couperait pile entre
            deux noms et la liste passerait pour complète.
          */}
          <ul className="mt-2 max-h-[198px] overflow-y-auto overscroll-contain">
            {visibles.map((o) => {
              const coche = value.includes(o.name);
              return (
                <li key={o.name}>
                  <button
                    type="button"
                    onClick={() => bascule(o.name)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-secondary"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors",
                        coche ? "border-brand bg-brand text-white" : "border-line-strong",
                      )}
                    >
                      {coche && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ink">{o.name}</span>
                    <span className="shrink-0 text-xs text-ink-soft">{o.count}</span>
                  </button>
                </li>
              );
            })}

            {visibles.length === 0 && (
              <li className="px-2 py-3 text-sm text-ink-soft">
                {t("Aucun studio à ce nom.", "No studio by that name.")}
              </li>
            )}
          </ul>

          <button
            type="button"
            onClick={() => onChange([])}
            disabled={!actif}
            className="mt-2 text-sm text-brand underline underline-offset-4 transition-colors hover:text-brand-deep disabled:opacity-45 disabled:no-underline"
          >
            {t("Réinitialiser", "Reset")}
          </button>
        </div>
      )}
    </div>
  );
}
