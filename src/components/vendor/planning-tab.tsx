"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { weekDays, type VendorOffer } from "@/components/vendor/vendor-data";

/** Astérisque des champs obligatoires (annotation client). */
function Required() {
  return <span className="text-brand"> *</span>;
}

const fieldCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-pro-accent";

function PublishModal({
  day,
  onClose,
  onPublish,
}: {
  day: number;
  onClose: () => void;
  onPublish: (o: VendorOffer) => void;
}) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("Yoga");
  const [time, setTime] = useState("18:30");
  const [capacity, setCapacity] = useState(12);
  const [price, setPrice] = useState(24);
  const [coach, setCoach] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!title.trim()) return setError("Le nom du cours est obligatoire.");
    if (capacity < 1 || price <= 0) return setError("Places et prix doivent être positifs.");
    onPublish({
      id: `v-${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${time}`,
      title: title.trim(),
      cat,
      capacity,
      placesLeft: capacity,
      basePrice: price,
      startsInHours: 24,
      day,
      time,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-lift">
        <div className="flex items-start justify-between">
          <h2 className="serif-display text-2xl text-ink">Publier un cours</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-9 w-9 place-items-center rounded-full bg-pro-surface text-ink-soft transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink">
              Nom du cours<Required />
            </span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vinyasa Flow" className={fieldCls} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">
                Activité<Required />
              </span>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className={fieldCls}>
                {["Yoga", "Pilates", "Boxe", "HIIT", "Cycling"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">
                Heure<Required />
              </span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldCls} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">
                Places<Required />
              </span>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, Number(e.target.value)))}
                className={fieldCls}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">
                Prix plein (€)<Required />
              </span>
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(Math.max(1, Number(e.target.value)))}
                className={fieldCls}
              />
            </label>
          </div>

          {/* annotation client : photo + nom du professeur NON obligatoires */}
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink">
              Professeur <span className="font-normal text-ink-soft">(facultatif)</span>
            </span>
            <input value={coach} onChange={(e) => setCoach(e.target.value)} placeholder="Camille" className={fieldCls} />
          </label>
          <p className="text-xs text-ink-soft">
            Photo du professeur facultative — elle pourra être ajoutée plus tard.
          </p>
        </div>

        {error && <p className="mt-4 text-sm text-brand">{error}</p>}

        <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
          <button
            onClick={submit}
            className="rounded-full bg-pro-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-deep"
          >
            Publier
          </button>
          <button onClick={onClose} className="text-sm text-ink-soft transition-colors hover:text-ink">
            Annuler
          </button>
          <span className="ml-auto text-xs text-ink-soft">
            <Required /> champs obligatoires
          </span>
        </div>
      </div>
    </div>
  );
}

/** Emploi du temps hebdomadaire — nouvel onglet demandé par le client. */
export function PlanningTab({
  offers,
  onPublish,
}: {
  offers: VendorOffer[];
  onPublish: (o: VendorOffer) => void;
}) {
  const [day, setDay] = useState(3); // jeudi, comme la maquette
  const [modal, setModal] = useState(false);

  const slots = offers
    .filter((o) => o.day === day)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-pro-accent">Emploi du temps</p>
          <h2 className="serif-display mt-1 text-3xl text-ink">Planning</h2>
        </div>
        <button
          onClick={() => setModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-pro-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-deep"
        >
          <Plus className="h-4 w-4" /> Publier un cours
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {weekDays.map((d, i) => (
          <button
            key={d.short}
            onClick={() => setDay(i)}
            aria-pressed={day === i}
            className={cn(
              "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border text-sm transition-colors",
              day === i
                ? "border-pro-accent bg-pro-accent text-white"
                : "border-line text-ink-soft hover:border-pro-accent hover:text-pro-accent",
            )}
          >
            <span className="text-[0.7rem] tracking-wide">{d.short}</span>
            <span className="font-medium">{d.date}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {slots.map((o) => {
          const sold = o.capacity - o.placesLeft;
          const full = o.placesLeft === 0;
          const pct = Math.round((sold / o.capacity) * 100);
          return (
            <div
              key={o.id}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-white p-5 ring-1 ring-line"
            >
              <span className="w-16 shrink-0 font-medium tabular-nums text-pro-accent">{o.time}</span>
              <div className="min-w-[10rem] flex-1">
                <p className="font-medium text-ink">{o.title}</p>
                <span className="mt-1 inline-block rounded-full bg-pro-surface px-2 py-0.5 text-xs text-ink-soft">
                  {o.cat}
                </span>
              </div>
              <div className="min-w-[9rem] flex-1">
                <p className="text-sm tabular-nums text-ink-soft">
                  {sold}/{o.capacity} réservées
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                  <div className="h-full rounded-full bg-pro-tan" style={{ width: `${Math.max(4, pct)}%` }} />
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                  full ? "bg-brand-tint text-brand" : "bg-emerald-50 text-emerald-700",
                )}
              >
                {full ? "Complet" : `${o.placesLeft} places restantes`}
              </span>
            </div>
          );
        })}

        <button
          onClick={() => setModal(true)}
          className="w-full rounded-2xl border border-dashed border-line py-4 text-sm text-ink-soft transition-colors hover:border-pro-accent hover:text-pro-accent"
        >
          + Ajouter un cours à ce jour
        </button>
      </div>

      {modal && (
        <PublishModal
          day={day}
          onClose={() => setModal(false)}
          onPublish={(o) => {
            onPublish(o);
            setModal(false);
          }}
        />
      )}
    </div>
  );
}
