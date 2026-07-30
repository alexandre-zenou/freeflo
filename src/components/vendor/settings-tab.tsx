"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand" : "bg-ink/15",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left]",
          checked ? "left-[1.375rem]" : "left-0.5",
        )}
      />
    </button>
  );
}

const FLOORS = [
  { value: 40, label: "−40% max" },
  { value: 50, label: "−50% max" },
  { value: 60, label: "−60% max (recommandé)" },
] as const;

export function SettingsTab() {
  const [floor, setFloor] = useState(60);
  const [autoPause, setAutoPause] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);

  return (
    <div className="space-y-4">
      {/* le moteur, sous VOTRE contrôle */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
        <h3 className="serif-display text-xl text-ink">Dégressivité</h3>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <div>
            <p className="text-sm font-medium text-ink">Prix plancher</p>
            <p className="mt-0.5 max-w-md text-xs leading-relaxed text-ink-soft">
              La remise ne descendra jamais en dessous. Vous gardez la main sur le moteur, pas
              l&apos;inverse.
            </p>
          </div>
          <div className="flex gap-2">
            {FLOORS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFloor(f.value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  floor === f.value ? "bg-ink text-cream" : "bg-secondary text-ink-soft hover:text-ink",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <div>
            <p className="text-sm font-medium text-ink">Pause automatique</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              L&apos;offre se met en pause dès que le cours est plein.
            </p>
          </div>
          <Toggle checked={autoPause} onChange={setAutoPause} label="Pause automatique" />
        </div>
      </div>

      {/* notifications */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
        <h3 className="serif-display text-xl text-ink">Notifications</h3>
        <p className="mt-1 text-xs text-ink-soft">Réservations, passage en sprint final, virements.</p>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <p className="text-sm text-ink">E-mail · bonjour@studiobloom.fr</p>
          <Toggle checked={notifEmail} onChange={setNotifEmail} label="Notifications e-mail" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <p className="text-sm text-ink">SMS · 06 52 11 48 90</p>
          <Toggle checked={notifSms} onChange={setNotifSms} label="Notifications SMS" />
        </div>
      </div>

      {/* statut du compte — plus de cartes mortes */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
        <h3 className="serif-display text-xl text-ink">Votre compte</h3>
        <ul className="mt-4 divide-y divide-line text-sm">
          {[
            { t: "Informations du centre", d: "Studio Bloom · 9 rue de Turenne, 75004" },
            { t: "Coordonnées bancaires", d: "IBAN ···· 4821 · virements quotidiens actifs" },
            { t: "Informations légales", d: "SIRET validé · CGU pros signées" },
          ].map((s) => (
            <li key={s.t} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
              <div>
                <p className="serif-display text-xl text-ink">{s.t}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{s.d}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-pro-surface px-2.5 py-1 text-xs font-medium text-pro-accent">
                <BadgeCheck className="h-3.5 w-3.5" /> Vérifié
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-line pt-3 text-xs text-ink-soft">
          Boutons de réservation Instagram : disponible en V2.
        </p>
      </div>
    </div>
  );
}
