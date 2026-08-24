"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { adminMember, demoMembers, signIn, signOut, signUp, useMember } from "@/lib/account";

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
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setLoading(true);

    window.setTimeout(() => {
      if (mode === "login") {
        const result = signIn(email, password);
        if (result === "unknown-email") {
          setLoading(false);
          return setNotice({
            tone: "error",
            fr: "Aucun compte ne correspond à cet email. Créez un compte, ou utilisez le compte de démonstration ci-dessous.",
            en: "No account matches this email. Create an account, or use the demo account below.",
          });
        }
        if (result === "wrong-password") {
          setLoading(false);
          return setNotice({
            tone: "error",
            fr: "Mot de passe incorrect.",
            en: "Wrong password.",
          });
        }
      } else {
        if (signUp(firstName, lastName, email, password) === "email-taken") {
          setLoading(false);
          return setNotice({
            tone: "error",
            fr: "Un compte existe déjà avec cet email. Connectez-vous.",
            en: "An account already exists with this email. Log in instead.",
          });
        }
      }
      router.push(next);
    }, 400);
  };

  /*
    Aucun fournisseur OAuth n'est branché en phase 1 (pas de next-auth, pas de
    Supabase, pas de backend). Ces boutons partageaient le handler du formulaire :
    ils faisaient donc semblant de connecter l'utilisateur, sans le moindre
    retour visuel pendant 700 ms, ce qui donnait un bouton mort à l'écran.

    En attendant les identifiants, le clic dit ce qu'il en est au lieu de mentir.
    Pour brancher le vrai flux : installer le fournisseur, puis remplacer le
    corps de cette fonction par son appel de connexion avec `provider`.
  */
  const oauthSignIn = (provider: "Google" | "Apple") =>
    setNotice({
      tone: "info",
      fr: `La connexion ${provider} n'est pas encore active sur cette démo. Utilisez l'email et le mot de passe ci-dessus.`,
      en: `${provider} sign in is not live on this demo yet. Use the email and password above.`,
    });

  /* Les comptes de test remplissent le formulaire plutôt que de connecter d'un
     clic : on veut voir passer le vrai parcours, y compris en démonstration. */
  const fill = (account: { email: string; password: string }) => {
    setMode("login");
    setEmail(account.email);
    setPassword(account.password);
    setNotice(null);
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

        <Button variant="gold" size="lg" className="mt-7 w-full" onClick={() => router.push(next)}>
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

      <div className="my-6 flex items-center gap-3 text-xs text-ink-soft">
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => oauthSignIn("Google")}
          className="flex items-center justify-center gap-2 rounded-full border border-line bg-paper py-2.5 text-sm text-ink transition-colors hover:border-ink"
        >
          <GoogleMark /> Google
        </button>
        <button
          type="button"
          onClick={() => oauthSignIn("Apple")}
          className="flex items-center justify-center gap-2 rounded-full border border-line bg-paper py-2.5 text-sm text-ink transition-colors hover:border-ink"
        >
          <AppleMark /> Apple
        </button>
      </div>

      {/*
        Compte de test, affiché plutôt que caché dans un README : la cliente doit
        pouvoir entrer dans la partie membre depuis la démo en ligne, sans nous.
        Ce bloc disparaît avec `demoMembers` quand les vrais comptes arrivent.
      */}
      <div className="mt-6 rounded-2xl border border-dashed border-line bg-secondary/50 px-4 py-3.5 text-sm">
        <p className="font-medium text-ink">{t("Comptes de démonstration", "Demo accounts")}</p>
        <p className="mt-1 text-ink-soft">
          {t("Membre :", "Member:")} {demoMembers[0].email}, {t("mot de passe", "password")}{" "}
          <span className="font-mono text-ink">{demoMembers[0].password}</span>
        </p>
        {/* L'administration ouvre l'espace pro, et rien d'autre. */}
        <p className="mt-1 text-ink-soft">
          {t("Administration :", "Administration:")} {adminMember.email}, {t("mot de passe", "password")}{" "}
          <span className="font-mono text-ink">{adminMember.password}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <button type="button" onClick={() => fill(demoMembers[0])} className="font-medium text-brand hover:underline">
            {t("Remplir, membre", "Fill in, member")}
          </button>
          <button type="button" onClick={() => fill(adminMember)} className="font-medium text-brand hover:underline">
            {t("Remplir, administration", "Fill in, administration")}
          </button>
        </div>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
        <Lock className="h-3 w-3" /> {t("Démo : aucune donnée n'est envoyée.", "Demo: no data is sent.")}
      </p>

      <p className="mt-4 text-center text-sm text-ink-soft">
        {t("Vous gérez un centre de sport ?", "You run a sport centre?")}{" "}
        <Link href="/inscrire-son-centre" className="font-medium text-brand hover:underline">
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

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 12.54c-.02-2.05 1.67-3.03 1.75-3.08-.95-1.4-2.44-1.59-2.97-1.61-1.26-.13-2.47.74-3.11.74-.64 0-1.63-.72-2.68-.7-1.38.02-2.65.8-3.36 2.03-1.43 2.48-.37 6.16 1.03 8.18.68.99 1.5 2.1 2.56 2.06 1.03-.04 1.42-.66 2.66-.66 1.25 0 1.59.66 2.68.64 1.11-.02 1.81-1 2.49-2 .78-1.15 1.1-2.26 1.12-2.32-.02-.01-2.15-.83-2.17-3.28l-.02.02ZM15.1 6.5c.56-.68.94-1.63.83-2.58-.81.03-1.79.54-2.37 1.22-.52.6-.98 1.56-.86 2.48.9.07 1.83-.46 2.4-1.12Z" />
    </svg>
  );
}
