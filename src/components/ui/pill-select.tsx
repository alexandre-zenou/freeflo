"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PillOption {
  value: string;
  label: string;
}

/**
 * Liste déroulante en pastille ovale.
 *
 * Retour client : « Remplacer le visuel des listes déroulantes par des cases
 * ovales comme les cases "dernière chance" en dessous. Celles-ci font trop old
 * school. » Les `<select>` natifs affichaient le menu système ; on garde le
 * comportement (clavier, échappement, sélection) mais avec notre propre habillage.
 */
export function PillSelect({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: PillOption[];
  onChange: (v: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

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

  return (
    <div ref={root} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          selected
            ? "bg-brand text-white hover:bg-brand-deep"
            : "border border-brand/35 text-brand hover:bg-brand hover:text-white",
        )}
      >
        {selected ? selected.label : label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full z-40 mt-2 max-h-72 min-w-[12rem] overflow-y-auto rounded-2xl bg-paper p-1.5 shadow-lift ring-1 ring-line"
        >
          <Item
            selected={value === ""}
            onSelect={() => {
              onChange("");
              setOpen(false);
            }}
          >
            {label} (tous)
          </Item>
          {options.map((o) => (
            <Item
              key={o.value}
              selected={o.value === value}
              onSelect={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </Item>
          ))}
        </ul>
      )}
    </div>
  );
}

function Item({
  children,
  selected,
  onSelect,
}: {
  children: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onSelect}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
          selected ? "bg-brand-tint font-medium text-brand" : "text-ink hover:bg-secondary",
        )}
      >
        {children}
        {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
      </button>
    </li>
  );
}
