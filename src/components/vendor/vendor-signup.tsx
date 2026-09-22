"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { MOT_DE_PASSE_MIN_CENTRE } from "@/lib/regles-inscription";
import { cn } from "@/lib/utils";
import { CallbackScheduler } from "@/components/vendor/callback-scheduler";

/**
 * Inscription d'un centre, en DEUX temps (06/09/2026).
 *
 * 1. le centre crée son compte ET son dossier, côté serveur
 *    (`/api/centres/inscription`) : nom du centre, SIRET, téléphone et ville
 *    sont enregistrés avec le compte, pour que l'administration puisse le
 *    vérifier avant de lui ouvrir l'espace pro ;
 * 2. il prend ensuite son rendez-vous d'intégration, qui n'est pas une
 *    politesse : c'est pendant cet appel que son logiciel de réservation est
 *    raccordé au nôtre, donc rien ne peut se passer sans lui.
 *
 * Avant, l'écran envoyait une simple demande de rappel : aucun compte n'était
 * créé, et le rendez-vous arrivait avant l'inscription. La cliente a demandé
 * l'ordre inverse.
 *
 * Le compte créé est un compte MEMBRE. Le rôle « centre », qui ouvre l'espace
 * pro, reste posé depuis Supabase après vérification du SIRET : une inscription
 * venue du site ne peut pas se l'attribuer elle-même (cf. `lib/auth.tsx`).
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
  prenom: "Camille",
  nom: "Vasseur",
  email: "contact@studioharmonie.fr",
  telephone: "06 12 34 56 78",
  motDePasse: "harmonie2026",
} as const;

/** Longueur minimale acceptée par Supabase. Rappelée sous le champ. */

const fieldCls =
  "w-full rounded-xl border border-white/30 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/50 focus:border-gold";

type Notice = {
  tone: "error" | "info";
  fr: string;
  en: string;
  /** Message brut de Supabase, affiché en petit sous le message lisible. */
  detail?: string | null;
};

export function VendorSignup() {
  const t = useT();
  /** `null` tant que le compte n'existe pas ; sinon, la suite du parcours. */
  const [compte, setCompte] = useState<{ confirmation: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  /*
    Les champs ne sont pas contrôlés : les pré-remplir revient à changer leur
    `defaultValue`, que React n'applique qu'au montage. On force donc le
    remontage par une `key`. Conséquence assumée : cliquer le bouton écrase ce
    qui était déjà saisi, ce qui est précisément ce qu'on lui demande.

    Corollaire, depuis que le formulaire ouvre un vrai compte : les valeurs sont
    lues à l'envoi dans le `FormData`, jamais dans un état React.
  */
  const [exemple, setExemple] = useState(false);

  /* Étape 2 : le rendez-vous d'intégration, dans la même carte bordeaux. */
  if (compte) return <CallbackScheduler confirmation={compte.confirmation} />;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotice(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const lire = (nom: string) => String(data.get(nom) ?? "").trim();

    /*
      TOUT le formulaire part au serveur, qui crée le compte et le dossier d'un
      seul geste (`/api/centres/inscription`). Avant, seuls prénom, nom,
      e-mail et mot de passe étaient enregistrés : le nom du centre, son SIRET,
      son téléphone et sa ville étaient jetés, et l'administration recevait un
      compte anonyme impossible à vérifier.
    */
    let reponse: Response;
    try {
      reponse = await fetch("/api/centres/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: lire("prenom"),
          nom: lire("nom"),
          email: lire("email"),
          motDePasse: String(data.get("motDePasse") ?? ""),
          centre: lire("centre"),
          siret: lire("siret"),
          telephone: lire("telephone"),
          ville: lire("ville"),
        }),
      });
    } catch {
      setLoading(false);
      return setNotice({
        tone: "error",
        fr: "Impossible de joindre le serveur. Vérifiez votre connexion.",
        en: "Could not reach the server. Check your connection.",
      });
    }

    setLoading(false);
    const corps = (await reponse.json().catch(() => ({}))) as { code?: string; confirmation?: boolean };

    if (reponse.ok) {
      /* Le compte existe. Si l'adresse doit être confirmée par e-mail, le
         rendez-vous se prend quand même : il ne dépend pas de la session. */
      return setCompte({ confirmation: Boolean(corps.confirmation) });
    }

    /* Le serveur renvoie un CODE, traduit ici dans la langue du visiteur. */
    const messages: Record<string, { fr: string; en: string }> = {
      champs: { fr: "Prénom et nom sont requis.", en: "First and last name are required." },
      centre: { fr: "Indiquez le nom de votre centre.", en: "Enter your centre's name." },
      email: { fr: "Cette adresse e-mail n'est pas valide.", en: "This email address is not valid." },
      siret: {
        fr: "Le SIRET doit compter 14 chiffres. Il figure sur votre extrait Kbis.",
        en: "The SIRET must have 14 digits. It appears on your company registration.",
      },
      "mot-de-passe": {
        fr: `Mot de passe trop court : il en faut au moins ${MOT_DE_PASSE_MIN_CENTRE} caractères.`,
        en: `Password too short: at least ${MOT_DE_PASSE_MIN_CENTRE} characters.`,
      },
      quota: {
        fr: "Trop d'inscriptions en peu de temps. Réessayez dans une heure.",
        en: "Too many sign-ups in a short time. Try again in an hour.",
      },
      doublon: {
        fr: "Si un compte existe déjà avec cette adresse, connectez-vous pour compléter votre dossier.",
        en: "If an account already exists with this email, log in to complete your application.",
      },
      indisponible: {
        fr: "L'inscription est momentanément indisponible. Réessayez dans quelques minutes.",
        en: "Sign-up is temporarily unavailable. Try again in a few minutes.",
      },
    };
    const m = messages[corps.code ?? ""] ?? {
      fr: "La création du compte a échoué. Réessayez dans un instant.",
      en: "Account creation failed. Try again in a moment.",
    };
    setNotice({ tone: "error", ...m });
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl bg-brand-deep p-6 text-white shadow-lift ring-1 ring-white/15 sm:p-8"
    >
      <p className="eyebrow text-gold">{t("Étape 1 sur 2", "Step 1 of 2")}</p>
      <h3 className="display mt-1 text-2xl text-white">{t("Créer mon espace pro", "Create my pro area")}</h3>
      <p className="mt-1 text-sm text-white/80">{t("2 minutes. Sans engagement, sans carte bancaire.", "2 minutes. No commitment, no card.")}</p>
      <p className="mt-3 text-sm text-white/90">
        {t(
          "Inscrivez votre centre de sport en quelques minutes et remplissez vos heures creuses dès aujourd'hui !",
          "Sign up your sport centre in a few minutes and start filling your quiet hours today!",
        )}
      </p>

      <div key={exemple ? "exemple" : "vierge"} className="mt-6 space-y-3">
        <Field
          name="centre"
          label={t("Nom du centre", "Centre name")}
          placeholder="Studio Bloom"
          value={exemple ? EXEMPLE.centre : undefined}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="siret" label="SIRET" placeholder="812 345 678 00012" value={exemple ? EXEMPLE.siret : undefined} />
          <Field name="ville" label={t("Ville", "City")} placeholder="Paris" value={exemple ? EXEMPLE.ville : undefined} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            name="prenom"
            label={t("Prénom", "First name")}
            placeholder="Camille"
            autoComplete="given-name"
            value={exemple ? EXEMPLE.prenom : undefined}
          />
          <Field
            name="nom"
            label={t("Nom", "Last name")}
            placeholder="Vasseur"
            autoComplete="family-name"
            value={exemple ? EXEMPLE.nom : undefined}
          />
        </div>
        <Field
          name="email"
          label={t("Email professionnel", "Business email")}
          placeholder="contact@studiobloom.fr"
          type="email"
          autoComplete="email"
          value={exemple ? EXEMPLE.email : undefined}
        />
        <Field
          name="telephone"
          label={t("Téléphone", "Phone")}
          placeholder="01 23 45 67 89"
          autoComplete="tel"
          value={exemple ? EXEMPLE.telephone : undefined}
        />
        <Field
          name="motDePasse"
          label={t("Mot de passe", "Password")}
          placeholder="••••••••"
          type="password"
          autoComplete="new-password"
          minLength={MOT_DE_PASSE_MIN_CENTRE}
          hint={t(
            `${MOT_DE_PASSE_MIN_CENTRE} caractères au minimum. Il ouvrira votre espace pro.`,
            `${MOT_DE_PASSE_MIN_CENTRE} characters minimum. It will open your pro area.`,
          )}
          value={exemple ? EXEMPLE.motDePasse : undefined}
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

      {notice && (
        <p
          role="status"
          className={cn(
            "mt-5 rounded-2xl px-4 py-3 text-sm",
            notice.tone === "error" ? "bg-white/15 text-white" : "bg-gold-bright/20 text-white",
          )}
        >
          {t(notice.fr, notice.en)}
          {notice.detail && (
            /* Le motif exact, en anglais et technique : il n'apprend rien au
               centre, mais il nous dit en une seconde ce que Supabase a refusé
               quand l'échec arrive chez la cliente et pas chez nous. */
            <span className="mt-1.5 block font-mono text-xs text-white/60">{notice.detail}</span>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-bright px-6 py-4 text-base font-bold text-ink transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? t("Création du compte…", "Creating your account…") : t("Créer mon compte", "Create my account")}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="mt-3 text-center text-xs text-white/70">
        {t(
          "Vous choisirez ensuite votre rendez-vous d'intégration.",
          "You will then pick your onboarding appointment.",
        )}
      </p>

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
  name,
  label,
  placeholder,
  type = "text",
  value,
  hint,
  autoComplete,
  minLength,
}: {
  /** Clé lue dans le `FormData` à l'envoi. */
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  /** Valeur de départ. `defaultValue` et non `value` : le champ reste libre. */
  value?: string;
  hint?: string;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/80">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={value}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className={fieldCls}
      />
      {hint && <span className="mt-1 block text-xs text-white/60">{hint}</span>}
    </label>
  );
}
