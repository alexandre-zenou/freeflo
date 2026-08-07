"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PhotoDrop } from "@/components/ui/photo-drop";
import { ACTIVITIES, SOCKS_ACTIVITIES, type VendorOffer } from "@/components/vendor/vendor-data";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

/**
 * Modale de création / modification d'un cours.
 *
 * Refaite d'après le retour client (planche 26) : fond bordeaux légèrement
 * transparent, texte blanc, bouton et astérisque en jaune, champs aux bords
 * arrondis (« la rubrique activité fait très ancien »), plus trois ajouts —
 * description facultative, chaussettes antidérapantes (Pilates et Yoga
 * uniquement) et dépôt de la photo du professeur.
 *
 * Le même composant sert au bouton « Modifier » de l'onglet Mes offres, qui ne
 * faisait rien jusqu'ici : `mode="edit"` le pré-remplit avec l'offre.
 */
function Required() {
  return <span className="text-gold"> *</span>;
}

const fieldCls =
  "w-full rounded-xl border border-white/30 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/50 focus:border-gold";

/** `appearance-none` + chevron dessiné : le menu natif faisait « très ancien ». */
const selectCls = cn(
  fieldCls,
  "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:1rem] bg-[right_0.9rem_center] bg-no-repeat pr-10 [&>option]:bg-brand-deep [&>option]:text-white",
);

export function OfferFormModal({
  mode,
  day,
  initial,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  day: number;
  initial?: VendorOffer;
  onClose: () => void;
  onSubmit: (o: VendorOffer) => void;
}) {
  const t = useT();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [cat, setCat] = useState(initial?.cat ?? ACTIVITIES[0]);
  const [time, setTime] = useState(initial?.time ?? "18:30");
  const [capacity, setCapacity] = useState(initial?.capacity ?? 12);
  const [price, setPrice] = useState(initial?.basePrice ?? 24);
  const [coach, setCoach] = useState("");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [socks, setSocks] = useState(initial?.nonSlipSocks ?? false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const asksSocks = SOCKS_ACTIVITIES.includes(cat);

  const submit = () => {
    if (!title.trim()) return setError(t("Le nom du cours est obligatoire.", "The class name is required."));
    if (capacity < 1 || price <= 0) return setError(t("Places libres et tarif plein doivent être positifs.", "Free places and full price must be positive."));
    onSubmit({
      ...(initial ?? {}),
      id: initial?.id ?? `v-${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${time}`,
      title: title.trim(),
      cat,
      capacity,
      placesLeft: initial ? Math.min(initial.placesLeft, capacity) : capacity,
      basePrice: price,
      startsInHours: initial?.startsInHours ?? 24,
      day: initial?.day ?? day,
      time,
      description: description.trim() || undefined,
      nonSlipSocks: asksSocks ? socks : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button aria-label={t("Fermer", "Close")} onClick={onClose} className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" />

      {/* fond bordeaux légèrement transparent, comme demandé */}
      <div className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-brand-deep/95 p-6 text-white shadow-lift ring-1 ring-white/15 backdrop-blur-md sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="display text-2xl text-white">
            {mode === "edit" ? t("Modifier le cours", "Edit class") : t("Publier un cours", "Publish a class")}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("Fermer", "Close")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">{t("Nom du cours", "Class name")}<Required /></span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vinyasa Flow" className={fieldCls} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">{t("Activité", "Activity")}<Required /></span>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className={selectCls}>
                {ACTIVITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">{t("Heure", "Time")}<Required /></span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldCls} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">{t("Places libres", "Free places")}<Required /></span>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, Number(e.target.value)))}
                className={fieldCls}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">{t("Tarif plein (€)", "Full price (€)")}<Required /></span>
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(Math.max(1, Number(e.target.value)))}
                className={fieldCls}
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">
              {t("Description", "Description")}{" "}
              <span className="font-normal text-white/70">{t("(facultative)", "(optional)")}</span>
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t("Ce que le sportif doit savoir avant de venir.", "What people should know before coming.")}
              className={cn(fieldCls, "resize-y")}
            />
          </label>

          {/* Question posée uniquement pour le Pilates et le Yoga. */}
          {asksSocks && (
            <fieldset className="rounded-xl border border-white/25 p-4">
              <legend className="px-1 text-sm font-medium">{t("Chaussettes antidérapantes obligatoires", "Grip socks required")}</legend>
              <div className="mt-2 flex gap-2">
                {[
                  { v: true, l: t("Oui", "Yes") },
                  { v: false, l: t("Non", "No") },
                ].map((o) => (
                  <button
                    key={o.l}
                    type="button"
                    onClick={() => setSocks(o.v)}
                    aria-pressed={socks === o.v}
                    className={cn(
                      "rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
                      socks === o.v ? "bg-gold-bright text-ink" : "border border-white/35 text-white hover:bg-white/15",
                    )}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">
              {t("Professeur(e)", "Instructor")}{" "}
              <span className="font-normal text-white/70">{t("(facultatif)", "(optional)")}</span>
            </span>
            <input value={coach} onChange={(e) => setCoach(e.target.value)} placeholder="Camille" className={fieldCls} />
          </label>

          <PhotoDrop
            label={t("Photo du professeur(e)", "Instructor photo")}
            hint={t("Facultative, elle pourra être ajoutée plus tard.", "Optional, it can be added later.")}
            aspect="square"
            tone="dark"
          />
        </div>

        {error && <p className="mt-4 text-sm font-medium text-gold">{error}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/20 pt-5">
          <button
            onClick={submit}
            className="rounded-full bg-gold-bright px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-gold"
          >
            {mode === "edit" ? t("Enregistrer", "Save") : t("Publier", "Publish")}
          </button>
          <button onClick={onClose} className="text-sm text-white/80 transition-colors hover:text-white">
            {t("Annuler", "Cancel")}
          </button>
          <span className="ml-auto text-xs text-white/70">
            <Required /> {t("champs obligatoires", "required fields")}
          </span>
        </div>
      </div>
    </div>
  );
}
