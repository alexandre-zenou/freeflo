"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { currentMember, signIn, signOut, signUp, useMember } from "@/lib/account";

type Mode = "login" | "signup";
type Notice = { tone: "error" | "info"; fr: string; en: string };

export function AuthForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const member = useMember();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  /*
    `next` ramène le visiteur là d'où il vient, typiquement l'offre sur laquelle
    il a cliqué « Réserver ». On n'accepte qu'un chemin interne : une URL absolue,
    ou un `//hote` que le navigateur lirait comme tel, renverrait le visiteur
    hors du site depuis un simple lien forgé.
  */
  const raw = params.get("next");
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/offres";

  /*
    La session est un magasin de démo (`lib/account.tsx`), pas une vraie
    authentification : la vérification est instantanée. Le court délai n'est
    donc pas une latence réseau simulée pour faire joli, c'est le temps qu'il
    faut pour que le bouton montre son état avant que la page ne change.
  */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setLoading(true);

    if (mode === "login") {
      const result = await signIn(email, password);

      if (result === "email-not-confirmed") {
        setLoading(false);
        return setNotice({
          tone: "info",
          fr: "Votre compte existe, mais son adresse n'est pas encore confirmée. Ouvrez le message que nous vous avons envoyé, puis revenez ici.",
          en: "Your account exists, but its address is not confirmed yet. Open the message we sent you, then come back here.",
        });
      }
      if (result === "invalid-credentials") {
        setLoading(false);
        /*
          UN SEUL message pour « adresse inconnue » et « mot de passe faux ».
          Les distinguer ferait de ce formulaire un moyen de savoir qui est
          inscrit sur FREEFLO, en essayant des adresses au hasard. Supabase
          renvoie d'ailleurs volontairement la même erreur pour les deux.
        */
        return setNotice({
          tone: "error",
          fr: "Adresse ou mot de passe incorrect.",
          en: "Wrong email or password.",
        });
      }
      if (result === "error") {
        setLoading(false);
        return setNotice({
          tone: "error",
          fr: "La connexion a échoué. Réessayez dans un instant.",
          en: "Sign-in failed. Try again in a moment.",
        });
      }
    } else {
      const result = await signUp(firstName, lastName, email, password);

      if (result === "weak-password") {
        setLoading(false);
        return setNotice({
          tone: "error",
          fr: "Mot de passe trop court : il en faut au moins six caractères.",
          en: "Password too short: at least six characters.",
        });
      }
      if (result === "email-taken") {
        setLoading(false);
        return setNotice({
          tone: "error",
          fr: "Un compte existe déjà avec cette adresse. Connectez-vous.",
          en: "An account already exists with this email. Log in instead.",
        });
      }
      if (result === "error") {
        setLoading(false);
        return setNotice({
          tone: "error",
          fr: "La création du compte a échoué. Réessayez dans un instant.",
          en: "Account creation failed. Try again in a moment.",
        });
      }
      if (result === "confirmation-envoyee") {
        /*
          On ne redirige PAS : sans confirmation d'adresse, il n'y a pas encore
          de session, et l'envoyer vers une page de membre le renverrait
          aussitôt vers la connexion, ce qui donnerait l'impression d'un échec.
        */
        setLoading(false);
        setMode("login");
        return setNotice({
          tone: "info",
          fr: `Compte créé. Nous avons envoyé un lien de confirmation à ${email.trim()} : ouvrez-le, puis connectez-vous ici.`,
          en: `Account created. We sent a confirmation link to ${email.trim()}: open it, then log in here.`,
        });
      }
    }

    /*
      L'administration et les centres ne vont jamais sur une page membre, même
      si un `next` les y envoyait : leur interface se réduit à l'espace pro.
      Lu par `currentMember` et non par le crochet, dont la valeur date encore
      du rendu d'avant la connexion.
    */
    const connecte = currentMember();
    router.push(connecte && connecte.role !== "member" ? "/pro" : next);
  };

  /* Déjà connecté : réafficher le formulaire serait un cul-de-sac, on propose
     de continuer ou de changer de compte. */
  if (member) {
    return (
      <div className="w-full max-w-md">
        <p className="eyebrow text-brand">{t("Session ouverte", "Signed in")}</p>
        <h1 className="display mt-3 text-3xl text-ink">
          {t(`Vous êtes connecté, ${member.firstName}.`, `You are signed in, ${member.firstName}.`)}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">{member.email}</p>

        <Button variant="gold" size="lg" className="mt-7 w-full" onClick={() => router.push(member.role !== "member" ? "/pro" : next)}>
          {t("Continuer", "Continue")} <ArrowRight className="h-4 w-4" />
        </Button>
        <Link
          href="/compte"
          className="mt-3 block w-full rounded-full border border-line bg-paper py-2.5 text-center text-sm text-ink transition-colors hover:border-ink"
        >
          {t("Voir mon compte", "View my account")}
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-ink-soft transition-colors hover:text-brand"
        >
          <LogOut className="h-4 w-4" /> {t("Se déconnecter", "Log out")}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* tabs */}
      <div className="mb-7 flex rounded-full bg-secondary p-1 text-sm">
        {(["login", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setNotice(null);
            }}
            className={cn(
              "flex-1 rounded-full px-4 py-2 font-medium transition-colors",
              mode === m ? "bg-cream text-ink shadow-soft" : "text-ink-soft hover:text-ink",
            )}
          >
            {m === "login" ? t("Se connecter", "Log in") : t("Créer un compte", "Create account")}
          </button>
        ))}
      </div>

      <h1 className="display text-3xl text-ink">
        {mode === "login" ? t("Content de vous revoir.", "Good to see you again.") : t("Rejoignez FREEFLO.", "Join FREEFLO.")}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        {mode === "login"
          ? t("Connectez-vous pour réserver vos cours à prix qui fond.", "Log in to book classes at melting prices.")
          : t("Créez votre compte en 30 secondes et attrapez les meilleures places.", "Create your account in 30 seconds and grab the best spots.")}
      </p>

      <form onSubmit={submit} className="mt-7 space-y-3">
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-3">
            <Field
              label={t("Prénom", "First name")}
              placeholder="Thomas"
              value={firstName}
              onChange={setFirstName}
              autoComplete="given-name"
            />
            <Field
              label={t("Nom", "Last name")}
              placeholder="Durand"
              value={lastName}
              onChange={setLastName}
              autoComplete="family-name"
            />
          </div>
        )}
        <Field
          label="Email"
          type="email"
          placeholder="thomas@email.com"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <Field
          label={t("Mot de passe", "Password")}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        {mode === "login" && (
          <div className="text-right">
            <button
              type="button"
              onClick={() =>
                setNotice({
                  tone: "info",
                  fr: "La réinitialisation du mot de passe arrivera avec les comptes réels. Sur la démo, utilisez le compte de test ci-dessous.",
                  en: "Password reset will arrive with real accounts. On this demo, use the test account below.",
                })
              }
              className="text-xs text-brand hover:underline"
            >
              {t("Mot de passe oublié ?", "Forgot your password?")}
            </button>
          </div>
        )}

        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
          {loading ? t("Un instant…", "One moment…") : mode === "login" ? t("Se connecter", "Log in") : t("Créer mon compte", "Create my account")}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      {notice && (
        <p
          role="status"
          className={cn(
            "mt-3 rounded-xl px-3.5 py-2.5 text-sm",
            notice.tone === "error" ? "bg-brand-tint text-brand" : "bg-secondary text-ink-soft",
          )}
        >
          {t(notice.fr, notice.en)}
        </p>
      )}

      {/* Le bloc des comptes de démonstration a été retiré le 28/08/2026, en
          même temps que ces comptes : l'authentification est réelle, et
          afficher des identifiants sur une page publique n'a plus de sens. */}

      <p className="mt-6 text-center text-sm text-ink-soft">
        {t("Vous gérez un centre de sport ?", "You run a sport centre?")}{" "}
        <Link href="/inscription-centre" className="font-medium text-brand hover:underline">
          {t("Espace pro", "Pro area")}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-ink-soft">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-gold focus:ring-2 focus:ring-gold/30"
      />
    </label>
  );
}
