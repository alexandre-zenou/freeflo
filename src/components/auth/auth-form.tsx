"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { adminMember, centreMember, currentMember, demoMembers, signIn, signOut, signUp, useMember } from "@/lib/account";

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
      /*
        L'administration ne va jamais sur une page membre, même si un `next`
        l'y envoyait : son interface se réduit à l'espace pro. Lu par
        `currentMember` et non par le hook, dont la valeur date encore du rendu
        d'avant la connexion.
      */
      const connecte = currentMember();
      router.push(connecte && connecte.role !== "member" ? "/pro" : next);
    }, 400);
  };

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
          {t("Centre de sport :", "Sport centre:")} {centreMember.email}, {t("mot de passe", "password")}{" "}
          <span className="font-mono text-ink">{centreMember.password}</span>
          <br />
          {t("Administration :", "Administration:")} {adminMember.email}, {t("mot de passe", "password")}{" "}
          <span className="font-mono text-ink">{adminMember.password}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <button type="button" onClick={() => fill(demoMembers[0])} className="font-medium text-brand hover:underline">
            {t("Remplir, membre", "Fill in, member")}
          </button>
          <button type="button" onClick={() => fill(centreMember)} className="font-medium text-brand hover:underline">
            {t("Remplir, centre", "Fill in, centre")}
          </button>
          <button type="button" onClick={() => fill(adminMember)} className="font-medium text-brand hover:underline">
            {t("Remplir, administration", "Fill in, administration")}
          </button>
        </div>
      </div>

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
