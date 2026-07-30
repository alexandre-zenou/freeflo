"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VendorSignup() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-3xl bg-ink p-8 text-center text-cream">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand text-white">
          <Check className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-display text-2xl">Demande envoyée !</h3>
        <p className="mt-2 text-sm text-white/70">
          Notre équipe vérifie votre SIRET sous 24 h. Vous recevrez un email pour activer votre espace pro
          et publier votre première offre. (Démo — aucune donnée envoyée.)
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
      className="rounded-3xl bg-paper p-6 shadow-lift ring-1 ring-line sm:p-8"
    >
      <h3 className="font-display text-2xl text-ink">Créer mon espace pro</h3>
      <p className="mt-1 text-sm text-ink-soft">2 minutes. Sans engagement, sans carte bancaire.</p>

      <div className="mt-6 space-y-3">
        <Field label="Nom du centre" placeholder="Studio Bloom" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="SIRET" placeholder="812 345 678 00012" />
          <Field label="Ville" placeholder="Paris" />
        </div>
        <Field label="Email professionnel" placeholder="contact@studiobloom.fr" type="email" />
        <Field label="Téléphone" placeholder="01 23 45 67 89" />
      </div>

      <Button type="submit" variant="gold" size="lg" className="mt-6 w-full">
        Envoyer ma demande <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="mt-3 text-center text-xs text-ink-soft">
        En envoyant, vous acceptez nos CGU pros. Vérification SIRET avant activation (anti-fraude).
      </p>
    </form>
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
        className="w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-gold focus:ring-2 focus:ring-gold/30"
      />
    </label>
  );
}
