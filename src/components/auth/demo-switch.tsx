"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bascule rapide entre les trois rôles, POUR LA DÉMONSTRATION EN LOCAL.
 *
 * Aucun identifiant n'est ici, et c'est le point. Le composant n'envoie qu'un
 * mot, « admin », « client » ou « centre » ; c'est la route `/api/dev/connexion`
 * qui lit les variables `DEMO_*` et s'authentifie côté serveur. Rien à lire
 * dans le bundle, rien dans le HTML, rien dans l'onglet réseau.
 *
 * ABSENT DU BUILD DE PRODUCTION. `process.env.NODE_ENV` est remplacé par sa
 * valeur à la compilation : en production la condition devient `"production"
 * !== "production"`, le compilateur supprime tout le composant, et il ne reste
 * pas même un bouton caché en CSS.
 *
 * Raccourcis clavier volontairement ABSENTS : une combinaison mal choisie se
 * déclenche pendant une démonstration, devant témoins. Trois boutons se
 * cliquent sans risque.
 */
const ROLES = [
  { cle: "client", libelle: "Client", vers: "/offres" },
  { cle: "centre", libelle: "Centre", vers: "/pro" },
  { cle: "admin", libelle: "Admin", vers: "/pro" },
] as const;

export function DemoSwitch() {
  const [enCours, setEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  if (process.env.NODE_ENV === "production") return null;

  const basculer = async (role: string, vers: string) => {
    setErreur(null);
    setEnCours(role);
    try {
      const r = await fetch("/api/dev/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setEnCours(null);
        return setErreur(d.error ?? `Échec (${r.status})`);
      }
      /*
        Rechargement COMPLET et non `router.push` : la session vient d'être
        posée en cookies par le serveur, et le fournisseur d'authentification
        du navigateur ne la connaît pas encore. Une navigation interne
        garderait l'état React d'avant la connexion.
      */
      window.location.assign(vers);
    } catch {
      setEnCours(null);
      setErreur("Serveur injoignable.");
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[100] rounded-2xl border border-dashed border-line bg-paper/95 px-3 py-2.5 shadow-lift backdrop-blur">
      <p className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
        <KeyRound className="h-3.5 w-3.5" />
        Connexion démo
        <span className="rounded-full bg-secondary px-1.5 text-[10px] uppercase">local</span>
      </p>
      <div className="mt-2 flex gap-1.5">
        {ROLES.map((r) => (
          <button
            key={r.cle}
            onClick={() => basculer(r.cle, r.vers)}
            disabled={enCours !== null}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
              enCours === r.cle
                ? "bg-brand text-white"
                : "bg-secondary text-ink hover:bg-brand hover:text-white",
            )}
          >
            {enCours === r.cle ? "…" : r.libelle}
          </button>
        ))}
      </div>
      {erreur && <p className="mt-1.5 max-w-52 text-[11px] text-brand">{erreur}</p>}
    </div>
  );
}
