"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { CallbackScheduler } from "@/components/vendor/callback-scheduler";

/**
 * Formulaire de création d'espace pro.
 *
 * Retour client (planche 21) : « Fond rouge, écriture blanche, case "continuer"
 * en jaune & connectez-vous en jaune », et « garder sous-titre mais ajouter :
 * Inscrivez votre centre de sport en quelques minutes et remplissez vos heures
 * creuses dès aujourd'hui ! »
 */
/**
 * Jeu d'essai du bouton « Remplir avec un exemple ».
 *
 * Centre fictif et cohérent : le SIRET a bien 14 chiffres, l'email reprend le
 * nom du studio, la ville correspond au code postal. On voit ainsi le
 * formulaire tel qu'il sera vraiment rempli, et non avec du « aaa » partout.
 */
const EXEMPLE = {
  centre: "Studio Harmonie",
  siret: "902 145 776 00018",
  ville: "Paris",
  email: "contact@studioharmonie.fr",
  telephone: "06 12 34 56 78",
} as const;

const fieldCls =
  "w-full rounded-xl border border-white/30 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/50 focus:border-gold";

export function VendorSignup() {
  const t = useT();
  const [done, setDone] = useState(false);
  /*
    Les champs ne sont pas contrôlés : les pré-remplir revient à changer leur
    `defaultValue`, que React n'applique qu'au montage. On force donc le
    remontage par une `key`. Conséquence assumée : cliquer le bouton écrase ce
    qui était déjà saisi, ce qui est précisément ce qu'on lui demande.
  */
  const [exemple, setExemple] = useState(false);

  /* L'envoi passe la main au module de rappel : confirmation, choix des
     disponibilités, puis remerciement. Le formulaire, lui, ne change pas. */
  if (done) return <CallbackScheduler />;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="rounded-3xl bg-brand-deep p-6 text-white shadow-lift ring-1 ring-white/15 sm:p-8"
    >
      <h3 className="display text-2xl text-white">{t("Créer mon espace pro", "Create my pro area")}</h3>
      <p className="mt-1 text-sm text-white/80">{t("2 minutes. Sans engagement, sans carte bancaire.", "2 minutes. No commitment, no card.")}</p>
      <p className="mt-3 text-sm text-white/90">
        {t(
          "Inscrivez votre centre de sport en quelques minutes et remplissez vos heures creuses dès aujourd'hui !",
          "Sign up your sport centre in a few minutes and start filling your quiet hours today!",
        )}
      </p>

      <div key={exemple ? "exemple" : "vierge"} className="mt-6 space-y-3">
        <Field
          label={t("Nom du centre", "Centre name")}
          placeholder="Studio Bloom"
          value={exemple ? EXEMPLE.centre : undefined}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="SIRET" placeholder="812 345 678 00012" value={exemple ? EXEMPLE.siret : undefined} />
          <Field label={t("Ville", "City")} placeholder="Paris" value={exemple ? EXEMPLE.ville : undefined} />
        </div>
        <Field
          label={t("Email professionnel", "Business email")}
          placeholder="contact@studiobloom.fr"
          type="email"
          value={exemple ? EXEMPLE.email : undefined}
        />
        <Field
          label={t("Téléphone", "Phone")}
          placeholder="01 23 45 67 89"
          value={exemple ? EXEMPLE.telephone : undefined}
        />
      </div>

      {/*
        Aide de développement, jamais livrée : `NODE_ENV` est remplacé à la
        compilation, donc ce bloc disparaît du paquet de production au lieu
        d'y rester caché par du CSS.
      */}
      {process.env.NODE_ENV !== "production" && (
        <button
          type="button"
          onClick={() => setExemple(true)}
          className="mt-3 text-xs text-white/70 underline underline-offset-4 transition-colors hover:text-gold"
        >
          {t("Remplir avec un exemple", "Fill in with an example")}
        </button>
      )}

      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-bright px-6 py-4 text-base font-bold text-ink transition-colors hover:bg-gold"
      >
        {t("Continuer", "Continue")} <ArrowRight className="h-4 w-4" />
      </button>

      <p className="mt-4 text-center text-sm text-white/85">
        {t("Vous avez déjà un compte ?", "Already have an account?")}{" "}
        <Link href="/connexion" className="font-bold text-gold underline underline-offset-4 hover:text-gold-bright">
          {t("Connectez-vous", "Log in")}
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-white/70">
        {t("En envoyant, vous acceptez nos", "By sending, you accept our")}{" "}
        <Link href="/cgu-cgv" className="underline underline-offset-2 hover:text-white">
          {t("conditions générales", "terms and conditions")}
        </Link>
        {t(". Vérification SIRET avant activation (anti-fraude).", ". Business verification before activation (anti-fraud).")}
      </p>
    </form>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  placeholder: string;
  type?: string;
  /** Valeur de départ. `defaultValue` et non `value` : le champ reste libre. */
  value?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/80">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={value}
        required
        className={fieldCls}
      />
    </label>
  );
}
