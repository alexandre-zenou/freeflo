"use client";

import { useMemo, useState } from "react";
import { Check, CalendarClock, ChevronLeft, ChevronRight, Phone, Plus, X } from "lucide-react";
import { useLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { save, slotKey, type CallbackSlot } from "@/lib/callback-slots";

/**
 * Ce qui suit l'envoi du formulaire « Créer mon espace pro » : la confirmation,
 * puis le choix des moments où l'équipe peut rappeler, puis le remerciement.
 *
 * Le formulaire lui-même n'est pas touché. Cet écran prend la suite, dans la
 * même carte bordeaux, avec les mêmes jaunes : c'est la continuité du bloc, pas
 * une fenêtre qui s'ouvre par-dessus.
 *
 * Les dates ne se calculent qu'ICI, jamais au rendu d'une page : ce composant
 * n'apparaît qu'après un clic, donc `Date` ne peut pas faire diverger le rendu
 * serveur de celui du navigateur (le piège habituel du projet).
 */

/** Amplitude d'appel, par demi-heures. */
const PREMIERE_HEURE = 9;
const DERNIERE_HEURE = 18;
const PAS_MINUTES = 30;

/** Durée réservée par créneau : le modèle porte un début ET une fin. */
const DUREE_MINUTES = 30;

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** Toutes les heures proposées, de 09:00 à 18:00 par demi-heures. */
function heuresPossibles(): string[] {
  const out: string[] = [];
  for (let m = PREMIERE_HEURE * 60; m <= DERNIERE_HEURE * 60; m += PAS_MINUTES) out.push(hhmm(m));
  return out;
}

/** Fin déduite du début : le stockage attend une plage, l'écran une heure. */
const finDe = (debut: string) => {
  const [h, m] = debut.split(":").map(Number);
  return hhmm(h * 60 + m + DUREE_MINUTES);
};

/**
 * Grille du mois affiché, alignée sur le lundi.
 *
 * `null` pour les cases d'avant le 1er : elles gardent l'alignement des colonnes
 * sans être des jours cliquables.
 */
function grilleDuMois(annee: number, mois: number): (Date | null)[] {
  const premier = new Date(annee, mois, 1);
  const decalage = (premier.getDay() + 6) % 7; // 0 = lundi
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  const cases: (Date | null)[] = Array.from({ length: decalage }, () => null);
  for (let j = 1; j <= nbJours; j++) cases.push(new Date(annee, mois, j));
  return cases;
}

export function CallbackScheduler() {
  const t = useT();
  const { locale } = useLocale();
  const tag = locale === "en" ? "en-GB" : "fr-FR";

  /* Aujourd'hui à minuit : borne basse des jours cliquables. On rappelle à
     partir de demain, pas le jour même. */
  const aujourdhui = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [mois, setMois] = useState(() => new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1));
  const [jour, setJour] = useState<Date | null>(null);
  const [heure, setHeure] = useState<string>("");
  const [picked, setPicked] = useState<CallbackSlot[]>([]);
  const [ref, setRef] = useState<string | null>(null);

  const heures = useMemo(() => heuresPossibles(), []);
  const cases = useMemo(() => grilleDuMois(mois.getFullYear(), mois.getMonth()), [mois]);

  const dayLabel = (d: Date) =>
    d.toLocaleDateString(tag, { weekday: "long", day: "numeric", month: "long" });

  /* Un jour est ouvert s'il est à venir et n'est pas un dimanche. */
  const ouvrable = (d: Date) => d > aujourdhui && d.getDay() !== 0;

  const dejaPris = jour && heure ? picked.some((s) => slotKey(s) === `${isoDay(jour)} ${heure}`) : false;
  const peutAjouter = Boolean(jour && heure) && !dejaPris;

  const ajouter = () => {
    if (!jour || !heure) return;
    setPicked((c) => [...c, { day: isoDay(jour), start: heure, end: finDe(heure) }]);
    /* On remet l'heure à zéro, pas le jour : on enchaîne souvent deux créneaux
       le même jour, et reperdre la date à chaque ajout serait pénible. */
    setHeure("");
  };

  const retirer = (cle: string) => setPicked((c) => c.filter((s) => slotKey(s) !== cle));

  /* Remerciement final : la demande est enregistrée, les créneaux avec elle. */
  if (ref) {
    const sorted = [...picked].sort((a, b) => slotKey(a).localeCompare(slotKey(b)));
    return (
      <div className="rounded-3xl bg-brand-deep p-8 text-center text-white shadow-lift ring-1 ring-white/15">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-bright text-ink">
          <Phone className="h-7 w-7" />
        </span>
        <h3 className="display mt-4 text-2xl">{t("Merci, c'est noté.", "Thank you, it's noted.")}</h3>
        <p className="mt-2 text-sm text-white/85">
          {t(
            "Votre demande est enregistrée. Nous vous appellerons sur l'un des créneaux que vous avez indiqués.",
            "Your request is registered. We will call you during one of the times you picked.",
          )}
        </p>

        <ul className="mx-auto mt-6 max-w-sm space-y-1.5 text-left text-sm">
          {sorted.map((s) => (
            <li key={slotKey(s)} className="flex items-center gap-2 text-white/90">
              <Check className="h-4 w-4 shrink-0 text-gold" />
              <span className="inline-block first-letter:uppercase">{dayLabel(new Date(`${s.day}T12:00`))}</span>, {s.start}
            </li>
          ))}
        </ul>

        <p className="mt-6 font-mono text-xs text-white/70">
          {t("Référence :", "Reference:")} {ref}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-brand-deep p-6 text-white shadow-lift ring-1 ring-white/15 sm:p-8">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-bright text-ink">
          <Check className="h-7 w-7" />
        </span>
        <h3 className="display mt-4 text-2xl">{t("Parfait !", "Perfect!")}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
          {t(
            "Nous vous contacterons dans les prochains jours pour intégrer votre logiciel au nôtre.",
            "We will get in touch in the coming days to connect your software to ours.",
          )}
        </p>
      </div>

      <div className="mt-8 border-t border-white/20 pt-6">
        <h4 className="flex items-center gap-2 text-lg font-bold">
          <CalendarClock className="h-5 w-5 text-gold" />
          {t("Quand pouvons-nous vous appeler ?", "When can we call you?")}
        </h4>
        <p className="mt-1 text-sm text-white/80">
          {t(
            "Choisissez autant de créneaux que vous voulez, nous en retiendrons un.",
            "Pick as many times as you like, we will use one of them.",
          )}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-[auto_minmax(15rem,1fr)]">
          {/* calendrier */}
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label={t("Mois précédent", "Previous month")}
                onClick={() => setMois((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                /* On ne remonte pas avant le mois courant : aucun jour n'y serait
                   cliquable, et l'utilisateur croirait la grille cassée. */
                disabled={mois <= new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1)}
                className="grid h-8 w-8 place-items-center rounded-full text-white transition-colors hover:bg-white/15 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm font-bold first-letter:uppercase">
                {mois.toLocaleDateString(tag, { month: "long", year: "numeric" })}
              </p>
              <button
                type="button"
                aria-label={t("Mois suivant", "Next month")}
                onClick={() => setMois((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                className="grid h-8 w-8 place-items-center rounded-full text-white transition-colors hover:bg-white/15"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-white/60">
              {["L", "M", "M", "J", "V", "S", "D"].map((j, i) => (
                <span key={i}>{j}</span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {cases.map((d, i) =>
                d === null ? (
                  <span key={`vide-${i}`} />
                ) : (
                  <button
                    key={isoDay(d)}
                    type="button"
                    disabled={!ouvrable(d)}
                    aria-pressed={jour ? isoDay(jour) === isoDay(d) : false}
                    onClick={() => setJour(d)}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-full text-sm transition-colors",
                      jour && isoDay(jour) === isoDay(d)
                        ? "bg-gold-bright font-bold text-ink"
                        : "text-white hover:bg-white/15 disabled:text-white/25 disabled:hover:bg-transparent",
                    )}
                  >
                    {d.getDate()}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* heure précise + ajout */}
          <div className="rounded-2xl bg-white/10 p-4">
            <label className="block">
              <span className="mb-1 block text-xs text-white/80">{t("Heure", "Time")}</span>
              <select
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                disabled={!jour}
                className="w-full rounded-xl border border-white/30 bg-brand-deep px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-gold disabled:opacity-50"
              >
                <option value="">{t("Choisir une heure", "Pick a time")}</option>
                {heures.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>

            <p className="mt-2 text-xs text-white/70">
              {jour ? (
                <span className="inline-block first-letter:uppercase">{dayLabel(jour)}</span>
              ) : (
                t("Choisissez d'abord un jour dans le calendrier.", "Pick a day in the calendar first.")
              )}
            </p>

            <button
              type="button"
              onClick={ajouter}
              disabled={!peutAjouter}
              /* Pas de `whitespace-nowrap` : la colonne fait 208 px et le libellé est plus
                 large, il déborderait de la pastille au lieu de passer à la ligne. */
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold px-4 py-2.5 text-center text-sm font-bold leading-snug text-gold transition-colors hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gold"
            >
              <Plus className="h-4 w-4 shrink-0" />
              {picked.length === 0
                ? t("Ajouter cette disponibilité", "Add this time")
                : t("Ajouter une autre disponibilité", "Add another time")}
            </button>

            {dejaPris && (
              <p className="mt-2 text-xs text-gold">
                {t("Ce créneau est déjà dans votre liste.", "That time is already on your list.")}
              </p>
            )}
          </div>
        </div>

        {picked.length > 0 && (
          <ul className="mt-4 space-y-2">
            {[...picked]
              .sort((a, b) => slotKey(a).localeCompare(slotKey(b)))
              .map((s) => (
                <li
                  key={slotKey(s)}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 text-sm"
                >
                  <Check className="h-4 w-4 shrink-0 text-gold" />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="inline-block first-letter:uppercase">{dayLabel(new Date(`${s.day}T12:00`))}</span>
                    , {s.start}
                  </span>
                  <button
                    type="button"
                    onClick={() => retirer(slotKey(s))}
                    aria-label={t("Retirer ce créneau", "Remove this time")}
                    className="shrink-0 text-white/70 transition-colors hover:text-gold"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
          </ul>
        )}

        <button
          type="button"
          disabled={picked.length === 0}
          onClick={() => setRef(save(picked).ref)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-bright px-6 py-4 text-base font-bold text-ink transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {picked.length > 1
            ? t(`Valider mes ${picked.length} disponibilités`, `Confirm my ${picked.length} times`)
            : t("Valider mes disponibilités", "Confirm my availability")}
        </button>
      </div>
    </div>
  );
}
