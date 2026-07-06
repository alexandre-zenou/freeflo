"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

export function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "login");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Démo : on simule l'authentification puis on entre dans l'app.
    window.setTimeout(() => router.push("/offres"), 700);
  };

  return (
    <div className="w-full max-w-md">
      {/* tabs */}
      <div className="mb-7 flex rounded-full bg-secondary p-1 text-sm">
        {(["login", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 rounded-full px-4 py-2 font-medium transition-colors",
              mode === m ? "bg-bone text-ink shadow-soft" : "text-ink-soft hover:text-ink",
            )}
          >
            {m === "login" ? "Se connecter" : "Créer un compte"}
          </button>
        ))}
      </div>

      <h1 className="display text-3xl text-ink">
        {mode === "login" ? "Content de vous revoir." : "Rejoignez FREEFLO."}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        {mode === "login"
          ? "Connectez-vous pour réserver vos cours à prix qui fond."
          : "Créez votre compte en 30 secondes et attrapez les meilleures places."}
      </p>

      <form onSubmit={submit} className="mt-7 space-y-3">
        {mode === "signup" && <Field label="Prénom" placeholder="Thomas" />}
        <Field label="Email" type="email" placeholder="thomas@email.com" />
        <Field label="Mot de passe" type="password" placeholder="••••••••" />
        {mode === "login" && (
          <div className="text-right">
            <Link href="/connexion" className="text-xs text-peri-deep hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
        )}

        <Button type="submit" variant="ember" size="lg" className="w-full" disabled={loading}>
          {loading ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-ink-soft">
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={submit}
          className="flex items-center justify-center gap-2 rounded-full border border-line bg-paper py-2.5 text-sm text-ink transition-colors hover:border-ink"
        >
          <GoogleMark /> Google
        </button>
        <button
          onClick={submit}
          className="flex items-center justify-center gap-2 rounded-full border border-line bg-paper py-2.5 text-sm text-ink transition-colors hover:border-ink"
        >
          <AppleMark /> Apple
        </button>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
        <Lock className="h-3 w-3" /> Démo — aucune donnée n&apos;est envoyée.
      </p>

      <p className="mt-4 text-center text-sm text-ink-soft">
        Vous gérez un centre de sport ?{" "}
        <Link href="/inscrire-son-centre" className="font-medium text-peri-deep hover:underline">
          Espace pro
        </Link>
      </p>
    </div>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-ink-soft">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        required
        className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-peri focus:ring-2 focus:ring-peri/30"
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
