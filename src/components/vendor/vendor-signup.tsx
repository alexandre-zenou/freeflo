"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";

/**
 * Formulaire de création d'espace pro.
 *
 * Retour client (planche 21) : « Fond rouge, écriture blanche, case "continuer"
 * en jaune & connectez-vous en jaune », et « garder sous-titre mais ajouter :
 * Inscrivez votre centre de sport en quelques minutes et remplissez vos heures
 * creuses dès aujourd'hui ! »
 */
const fieldCls =
  "w-full rounded-xl border border-white/30 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/50 focus:border-gold";

export function VendorSignup() {
  const t = useT();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-3xl bg-brand-deep p-8 text-center text-white ring-1 ring-white/15">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-bright text-ink">
          <Check className="h-7 w-7" />
        </span>
        <h3 className="display mt-4 text-2xl">{t("Demande envoyée !", "Request sent!")}</h3>
        <p className="mt-2 text-sm text-white/80">
          {t(
            "Notre équipe vérifie votre SIRET sous 24 h. Vous recevrez un email pour activer votre espace pro et publier votre première offre. (Démo : aucune donnée envoyée.)",
            "Our team checks your business details within 24 h. You will get an email to activate your pro area and publish your first offer. (Demo: no data sent.)",
          )}
        </p>
      </div>
    );
  }

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

      <div className="mt-6 space-y-3">
        <Field label={t("Nom du centre", "Centre name")} placeholder="Studio Bloom" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="SIRET" placeholder="812 345 678 00012" />
          <Field label={t("Ville", "City")} placeholder="Paris" />
        </div>
        <Field label={t("Email professionnel", "Business email")} placeholder="contact@studiobloom.fr" type="email" />
        <Field label={t("Téléphone", "Phone")} placeholder="01 23 45 67 89" />
      </div>

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

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/80">{label}</span>
      <input type={type} placeholder={placeholder} required className={fieldCls} />
    </label>
  );
}
