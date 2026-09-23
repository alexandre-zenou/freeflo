"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { MOT_DE_PASSE_MIN_CENTRE } from "@/lib/regles-inscription";
import { cn } from "@/lib/utils";

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
  /* Gardée pour l'écran de confirmation, qui rappelle où le lien est parti. */
  const [emailSaisi, setEmailSaisi] = useState("");

  /*
    Étape 2 : ce qu'il reste à faire, et par qui.
    
    Le calendrier de rendez-vous d'intégration a été RETIRÉ le 23/09/2026 : il
    ne menait nulle part, aucun créneau proposé n'était traité. Le composant
    `callback-scheduler.tsx` reste dans le dépôt, prêt à revenir le jour où
    ces rendez-vous seront réellement pris en charge.
  */
  if (compte) return <DossierDepose email={emailSaisi} confirmation={compte.confirmation} />;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotice(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const lire = (nom: string) => String(data.get(nom) ?? "").trim();
    setEmailSaisi(lire("email"));

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
          {/* Facultatif depuis le 23/09/2026 : la confirmation par e-mail suffit
              à ouvrir l'espace pro. On le demande quand même, il resservira
              pour la facturation et pour Stripe Connect. */}
          <Field
            name="siret"
            label={t("SIRET (facultatif)", "Business ID (optional)")}
            placeholder="812 345 678 00012"
            value={exemple ? EXEMPLE.siret : undefined}
            requis={false}
          />
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
  requis = true,
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
  /** Faux pour un champ facultatif. Tous sont obligatoires par défaut : il vaut
   *  mieux oublier de rendre un champ optionnel que l'inverse. */
  requis?: boolean;
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
        required={requis}
        className={fieldCls}
      />
      {hint && <span className="mt-1 block text-xs text-white/60">{hint}</span>}
    </label>
  );
}

/**
 * Écran de fin d'inscription d'un centre.
 *
 * Il remplace le calendrier de rendez-vous, qui donnait l'illusion d'une étape
 * alors qu'aucun créneau proposé n'était traité. Il dit deux choses, et deux
 * seulement : ce que le centre doit faire, confirmer son adresse, et ce qui
 * arrive alors, son espace pro qui s'ouvre.
 */
function DossierDepose({ email, confirmation }: { email: string; confirmation: boolean }) {
  const t = useT();
  return (
    <div className="rounded-3xl bg-brand-deep p-6 text-white shadow-lift ring-1 ring-white/15 sm:p-8">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15">
        <Check className="h-6 w-6 text-gold-bright" />
      </span>

      <h2 className="display mt-5 text-[clamp(1.6rem,3.4vw,2.2rem)]">
        {t("Votre dossier est déposé.", "Your application is in.")}
      </h2>

      <ol className="mt-6 space-y-4">
        {confirmation && (
          <li className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-bright text-sm font-bold text-ink">
              1
            </span>
            <p className="text-sm leading-relaxed text-white/90">
              <strong className="font-bold text-white">
                {t("Confirmez votre adresse.", "Confirm your email.")}
              </strong>{" "}
              {t(
                `Nous venons d'envoyer un lien à ${email}. Ouvrez-le pour activer votre compte. Pensez à regarder vos indésirables.`,
                `We just sent a link to ${email}. Open it to activate your account. Check your spam folder too.`,
              )}
            </p>
          </li>
        )}

        <li className="flex gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20 text-sm font-bold">
            {confirmation ? 2 : 1}
          </span>
          <p className="text-sm leading-relaxed text-white/90">
            <strong className="font-bold text-white">
              {t("Votre espace pro s'ouvre.", "Your pro area opens.")}
            </strong>{" "}
            {t(
              "Dès votre adresse confirmée, connectez-vous : vous arrivez dans votre espace et vous pouvez publier vos créneaux.",
              "As soon as your email is confirmed, log in: you land in your area and can publish your slots.",
            )}
          </p>
        </li>
      </ol>

      <Link href="/connexion">
        <Button variant="gold" size="lg" className="mt-7 w-full">
          {t("Aller à la connexion", "Go to sign-in")}
        </Button>
      </Link>
    </div>
  );
}
