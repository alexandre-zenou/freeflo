"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { PhotoDrop } from "@/components/ui/photo-drop";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

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
  { value: 60, label: "−60% max", recommended: true },
] as const;

export function SettingsTab() {
  const t = useT();
  const [floor, setFloor] = useState(60);
  const [autoPause, setAutoPause] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);

  return (
    <div className="space-y-4">
      {/*
        Retour client : « Ajouter une rubrique photo tout en haut, en horizontale
        pour la devanture de leur centre dans notre site. Glisser ou télécharger
        une photo : comme un linkedin. »
      */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
        <h3 className="pro-display text-xl text-ink">{t("Photo de votre devanture", "Photo of your storefront")}</h3>
        <p className="mt-1 text-xs text-ink-soft">
          {t(
            "C'est la première chose que voient les sportifs sur votre fiche. Une photo large, prise de jour, donne les meilleurs résultats.",
            "It is the first thing people see on your listing. A wide shot, taken in daylight, works best.",
          )}
        </p>
        <PhotoDrop
          label=""
          hint={t("JPEG ou PNG, 8 Mo maximum. Format large recommandé.", "JPEG or PNG, 8 MB max. Wide format recommended.")}
          aspect="wide"
          className="mt-4"
        />
      </div>

      {/* le moteur, sous VOTRE contrôle */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
        <h3 className="pro-display text-xl text-ink">{t("Dégressivité", "Sliding price")}</h3>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <div>
            <p className="text-sm font-medium text-ink">{t("Prix plancher", "Floor price")}</p>
            <p className="mt-0.5 max-w-md text-xs leading-relaxed text-ink-soft">
              {t(
                "La remise ne descendra jamais en dessous. Vous gardez la main sur le moteur, pas l'inverse.",
                "The discount will never go below this. You stay in control of the engine, not the other way round.",
              )}
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
                {"recommended" in f && f.recommended ? ` (${t("recommandé", "recommended")})` : ""}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <div>
            <p className="text-sm font-medium text-ink">{t("Pause automatique", "Automatic pause")}</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {t("L'offre se met en pause dès que le cours est plein.", "The offer pauses as soon as the class is full.")}
            </p>
          </div>
          <Toggle checked={autoPause} onChange={setAutoPause} label={t("Pause automatique", "Automatic pause")} />
        </div>
      </div>

      {/* notifications */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
        <h3 className="pro-display text-xl text-ink">{t("Notifications", "Notifications")}</h3>
        <p className="mt-1 text-xs text-ink-soft">{t("Réservations, passage en sprint final, virements.", "Bookings, final sprint, payouts.")}</p>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <p className="text-sm text-ink">E-mail : bonjour@studiobloom.fr</p>
          <Toggle checked={notifEmail} onChange={setNotifEmail} label={t("Notifications e-mail", "Email notifications")} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <p className="text-sm text-ink">SMS : 06 52 11 48 90</p>
          <Toggle checked={notifSms} onChange={setNotifSms} label={t("Notifications SMS", "SMS notifications")} />
        </div>
      </div>

      {/* statut du compte — plus de cartes mortes */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
        <h3 className="pro-display text-xl text-ink">{t("Votre compte", "Your account")}</h3>
        <ul className="mt-4 divide-y divide-line text-sm">
          {[
            { t: "Informations du centre", tEn: "Centre details", d: "Studio Bloom, 9 rue de Turenne, 75004", dEn: "Studio Bloom, 9 rue de Turenne, 75004" },
            { t: "Coordonnées bancaires", tEn: "Bank details", d: "IBAN se terminant par 4821, virements mensuels actifs", dEn: "IBAN ending 4821, monthly payouts active" },
            { t: "Informations légales", tEn: "Legal details", d: "SIRET validé, CGU pros signées", dEn: "Business number verified, pro terms signed" },
          ].map((s) => (
            <li key={s.t} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
              <div>
                <p className="pro-display text-xl text-ink">{t(s.t, s.tEn)}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{t(s.d, s.dEn)}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-pro-surface px-2.5 py-1 text-xs font-medium text-pro-accent">
                <BadgeCheck className="h-3.5 w-3.5" /> {t("Vérifié", "Verified")}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-line pt-3 text-xs text-ink-soft">
          {t("Boutons de réservation Instagram : disponible en V2.", "Instagram booking buttons: coming in V2.")}
        </p>
      </div>
    </div>
  );
}
