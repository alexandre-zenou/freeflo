"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { changerMotDePasse, useHydrated, useMember } from "@/lib/auth";
import { MOT_DE_PASSE_MIN } from "@/lib/regles-inscription";

/**
 * Choisir un nouveau mot de passe, au retour du lien reçu par e-mail.
 *
 * On arrive ici DÉJÀ connecté : la route `/auth/confirm` a vérifié le lien et
 * posé la session. Sans session, le lien a expiré ou a déjà servi, et on le
 * dit au lieu d'afficher un formulaire qui échouerait à l'envoi.
 */
export function NouveauMotDePasse() {
  const t = useT();
  const pret = useHydrated();
  const membre = useMember();
  const [mdp, setMdp] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<{ fr: string; en: string } | null>(null);
  const [fait, setFait] = useState(false);

  if (!pret) {
    return <div className="h-64 w-full max-w-md animate-pulse rounded-3xl bg-secondary" />;
  }

  if (fait) {
    return (
      <div className="w-full max-w-md">
        <p className="eyebrow text-brand">{t("C'est fait", "Done")}</p>
        <h1 className="display mt-3 text-3xl text-ink">
          {t("Votre mot de passe est changé.", "Your password has been changed.")}
        </h1>
        <p className="mt-3 text-ink-soft">
          {t(
            "Vous restez connecté. Il servira dès votre prochaine connexion.",
            "You stay signed in. It will be used from your next sign-in.",
          )}
        </p>
        <Link href={membre && membre.role !== "member" ? "/pro" : "/offres"}>
          <Button variant="gold" size="lg" className="mt-7 w-full">
            {t("Continuer", "Continue")}
          </Button>
        </Link>
      </div>
    );
  }

  if (!membre) {
    return (
      <div className="w-full max-w-md">
        <p className="eyebrow text-brand">{t("Lien expiré", "Link expired")}</p>
        <h1 className="display mt-3 text-3xl text-ink">
          {t("Ce lien ne fonctionne plus.", "This link no longer works.")}
        </h1>
        <p className="mt-3 text-ink-soft">
          {t(
            "Un lien de réinitialisation ne sert qu'une fois, et pendant une heure. Demandez-en un nouveau depuis la page de connexion.",
            "A reset link works only once, and for one hour. Request a new one from the sign-in page.",
          )}
        </p>
        <Link href="/connexion?oubli=1">
          <Button variant="gold" size="lg" className="mt-7 w-full">
            {t("Recevoir un nouveau lien", "Get a new link")}
          </Button>
        </Link>
      </div>
    );
  }

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    if (mdp.length < MOT_DE_PASSE_MIN) {
      return setErreur({
        fr: `Au moins ${MOT_DE_PASSE_MIN} caractères.`,
        en: `At least ${MOT_DE_PASSE_MIN} characters.`,
      });
    }
    if (mdp !== confirmation) {
      return setErreur({
        fr: "Les deux mots de passe ne sont pas identiques.",
        en: "The two passwords do not match.",
      });
    }
    setEnvoi(true);
    const r = await changerMotDePasse(mdp);
    setEnvoi(false);
    if (r === "ok") return setFait(true);
    if (r === "session") {
      return setErreur({
        fr: "Votre lien a expiré entre-temps. Demandez-en un nouveau.",
        en: "Your link expired in the meantime. Request a new one.",
      });
    }
    if (r === "faible") {
      return setErreur({
        fr: "Ce mot de passe est refusé : choisissez-en un plus long ou moins courant.",
        en: "This password is refused: choose a longer or less common one.",
      });
    }
    setErreur({ fr: "L'enregistrement a échoué. Réessayez.", en: "Saving failed. Try again." });
  };

  const champ =
    "mt-1.5 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand";

  return (
    <form onSubmit={envoyer} className="w-full max-w-md">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-tint text-brand">
        <KeyRound className="h-6 w-6" />
      </span>
      <h1 className="display mt-5 text-3xl text-ink">
        {t("Choisissez un nouveau mot de passe", "Choose a new password")}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">{membre.email}</p>

      <label className="mt-7 block text-sm font-medium text-ink">
        {t("Nouveau mot de passe", "New password")}
        <input
          type="password"
          autoComplete="new-password"
          minLength={MOT_DE_PASSE_MIN}
          required
          value={mdp}
          onChange={(e) => setMdp(e.target.value)}
          className={champ}
        />
      </label>
      <p className="mt-1.5 text-xs text-ink-soft">
        {t(`${MOT_DE_PASSE_MIN} caractères au minimum.`, `${MOT_DE_PASSE_MIN} characters minimum.`)}
      </p>

      <label className="mt-4 block text-sm font-medium text-ink">
        {t("Le même, une seconde fois", "The same, once more")}
        <input
          type="password"
          autoComplete="new-password"
          required
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className={champ}
        />
      </label>

      {erreur && (
        <p className="mt-4 rounded-2xl bg-brand-tint px-4 py-3 text-sm text-brand">
          {t(erreur.fr, erreur.en)}
        </p>
      )}

      <Button type="submit" variant="gold" size="lg" className="mt-6 w-full" disabled={envoi}>
        {envoi ? t("Enregistrement…", "Saving…") : t("Enregistrer", "Save")}
      </Button>
    </form>
  );
}
