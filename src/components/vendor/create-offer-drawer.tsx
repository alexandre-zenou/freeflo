"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { categories } from "@/lib/site";
import type { VendorOffer } from "@/components/vendor/vendor-data";
import { useT } from "@/lib/i18n";

/**
 * Retour client 08/2026 : la courbe « Votre prix fondra ainsi » et l'échelle de
 * commission ont été retirées du tiroir (information privée). Le tiroir ne fait
 * plus que créer l'offre.
 */
const SLOTS = [
  { label: "Aujourd'hui, 18h30", labelEn: "Today, 18:30", startsInHours: 2.5, day: 3 },
  { label: "Aujourd'hui, 20h00", labelEn: "Today, 20:00", startsInHours: 4, day: 3 },
  { label: "Demain, 7h30", labelEn: "Tomorrow, 07:30", startsInHours: 15, day: 4 },
  { label: "Demain, 12h00", labelEn: "Tomorrow, 12:00", startsInHours: 20, day: 4 },
  { label: "Après-demain, 18h30", labelEn: "In two days, 18:30", startsInHours: 44, day: 5 },
];

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand";

/** Retour client : « rendre les cases Catégorie et Créneau plus modernes ». */
const selectCls =
  `${inputCls} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236a6560%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:1rem] bg-[right_0.9rem_center] bg-no-repeat pr-10`;

export function CreateOfferDrawer({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (offer: VendorOffer) => void;
}) {
  const t = useT();
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState(categories[0].label);
  const [slot, setSlot] = useState(0);
  const [capacity, setCapacity] = useState(10);
  const [basePrice, setBasePrice] = useState(24);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = () => {
    if (!title.trim()) return setError(t("Donnez un titre à l'offre : c'est ce que voient les sportifs.", "Give the offer a title: it is what people see."));
    if (basePrice <= 0 || capacity < 1) return setError(t("Tarif plein et places doivent être positifs.", "Full price and places must be positive."));
    onCreate({
      id: `v-${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: title.trim(),
      cat,
      capacity,
      placesLeft: capacity,
      basePrice,
      startsInHours: SLOTS[slot].startsInHours,
      day: SLOTS[slot].day,
      time: SLOTS[slot].label.split(", ")[1].trim(),
    });
    setTitle("");
    setError(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label={t("Fermer", "Close")} onClick={onClose} className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto bg-paper p-6 shadow-lift sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-brand">{t("Nouvelle offre", "New offer")}</p>
            <h2 className="display mt-1 text-2xl text-ink">{t("Deux minutes, montre en main.", "Two minutes, timed.")}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t("Fermer le panneau", "Close panel")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-ink-soft transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-7 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink">{t("Titre du cours", "Class title")}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vinyasa Flow"
              className={inputCls}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">{t("Catégorie", "Category")}</span>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className={selectCls}>
                {categories.map((c) => (
                  <option key={c.slug}>{t(c.label, c.labelEn)}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">{t("Créneau", "Time slot")}</span>
              <select value={slot} onChange={(e) => setSlot(Number(e.target.value))} className={selectCls}>
                {SLOTS.map((s, i) => (
                  <option key={s.label} value={i}>{t(s.label, s.labelEn)}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">{t("Places libres", "Free places")}</span>
              <input
                type="number"
                min={1}
                max={40}
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, Number(e.target.value)))}
                className={inputCls}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">{t("Tarif plein (€)", "Full price (€)")}</span>
              <input
                type="number"
                min={1}
                max={200}
                value={basePrice}
                onChange={(e) => setBasePrice(Math.max(1, Number(e.target.value)))}
                className={inputCls}
              />
            </label>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-brand-deep">{error}</p>}

        <div className="mt-8 flex items-center gap-3 border-t border-ink/20 pt-5">
          <button
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-white gold-glow transition-colors hover:bg-brand-deep"
          >
            {t("Publier l'offre", "Publish the offer")}
          </button>
          <button onClick={onClose} className="text-sm text-ink-soft transition-colors hover:text-ink">
            {t("Annuler", "Cancel")}
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          {t("Aucun coût fixe : vous n'êtes prélevé que si la place se vend.", "No fixed cost: you are only charged if the place sells.")}
        </p>
      </aside>
    </div>
  );
}
