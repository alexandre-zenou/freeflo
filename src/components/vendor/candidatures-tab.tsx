"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { createClient, supabaseConfigure } from "@/lib/supabase/client";

/**
 * Candidatures des centres, à valider ou refuser. RÉSERVÉ À L'ADMINISTRATION.
 *
 * Aucune route du site ne se charge de la sécurité ici, et c'est voulu :
 *
 * · la LECTURE passe par la RLS de Postgres. Seule l'administration voit tous
 *   les dossiers ; un centre qui ouvrirait cet écran ne recevrait que le sien ;
 * · la DÉCISION passe par la fonction `trancher_candidature`, qui vérifie
 *   elle-même, dans la base, que l'appelant est administrateur. Cacher le
 *   bouton ne protège rien, c'est la base qui refuse.
 *
 * Valider fait trois choses d'un coup, dans une seule transaction : le dossier
 * passe à « validé », le compte passe à « centre », sa fiche est créée. Le
 * centre peut alors ouvrir son espace pro à sa prochaine connexion.
 */
interface Dossier {
  id: string;
  nom_centre: string;
  siret: string;
  telephone: string;
  ville: string;
  statut: "en_attente" | "validee" | "refusee";
  created_at: string;
  profiles: { email: string; first_name: string; last_name: string } | null;
}

/** SIRET lu par blocs, comme sur un Kbis : 902 145 776 00018. */
const siretLisible = (s: string) => `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 9)} ${s.slice(9)}`;

/** Lit les dossiers sous la session courante. Ne touche à AUCUN état React. */
async function lireDossiers(): Promise<{ dossiers: Dossier[]; erreur: string | null }> {
  if (!supabaseConfigure()) return { dossiers: [], erreur: "Supabase non configuré." };
  const { data, error } = await createClient()
    .from("candidatures_centres")
    /*
      `profiles!profile_id` et non `profiles` : la table pointe DEUX fois vers
      les profils, le candidat (`profile_id`) et l'administrateur qui a tranché
      (`traitee_par`). Sans la précision, PostgREST refuse la jointure pour
      ambiguïté, et l'écran restait vide sur une erreur. Relevé en testant
      contre la vraie base, pas au premier essai.
    */
    .select("id, nom_centre, siret, telephone, ville, statut, created_at, profiles!profile_id(email, first_name, last_name)")
    .order("created_at", { ascending: false });
  if (error) return { dossiers: [], erreur: error.message };
  return { dossiers: (data ?? []) as unknown as Dossier[], erreur: null };
}

export function CandidaturesTab() {
  const t = useT();
  const [dossiers, setDossiers] = useState<Dossier[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  /*
    Écrire l'état dans le RAPPEL de la promesse, pas dans l'effet. La lecture
    elle-même (`lireDossiers`) ne touche à aucun état ; seul `appliquer` le
    fait, une fois la réponse arrivée. C'est ce qui tient cet écran dans la
    règle `react-hooks/set-state-in-effect`, qui refuse les écritures
    synchrones dans le corps d'un effet.
  */
  const appliquer = useCallback((r: Awaited<ReturnType<typeof lireDossiers>>) => {
    if (r.erreur) return setErreur(r.erreur);
    setDossiers(r.dossiers);
  }, []);

  useEffect(() => {
    let vivant = true;
    void lireDossiers().then((r) => {
      if (vivant) appliquer(r);
    });
    return () => {
      vivant = false;
    };
  }, [appliquer]);

  /* Hors effet : appelé par un clic, il a le droit d'écrire l'état. */
  const charger = async () => appliquer(await lireDossiers());

  const trancher = async (id: string, decision: "validee" | "refusee") => {
    setErreur(null);
    setEnCours(id);
    const { error } = await createClient().rpc("trancher_candidature", {
      p_candidature: id,
      p_decision: decision,
    });
    setEnCours(null);
    if (error) return setErreur(error.message);
    await charger();
  };

  if (!dossiers) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-ink-soft">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("Chargement des dossiers…", "Loading applications…")}
      </div>
    );
  }

  const enAttente = dossiers.filter((d) => d.statut === "en_attente");
  const traites = dossiers.filter((d) => d.statut !== "en_attente");

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-soft">
        {enAttente.length === 0
          ? t("Aucun dossier en attente.", "No pending application.")
          : t(
              `${enAttente.length} dossier${enAttente.length > 1 ? "s" : ""} en attente. Vérifiez le SIRET avant de valider.`,
              `${enAttente.length} pending application${enAttente.length > 1 ? "s" : ""}. Check the SIRET before approving.`,
            )}
      </p>

      {erreur && (
        <p className="rounded-2xl bg-brand-tint px-4 py-3 text-sm text-brand">{erreur}</p>
      )}

      {enAttente.map((d) => (
        <div key={d.id} className="rounded-2xl bg-paper p-5 ring-1 ring-line">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="pro-display text-xl text-ink">{d.nom_centre}</h3>
              <p className="mt-1 text-sm text-ink-soft">
                {[d.profiles?.first_name, d.profiles?.last_name].filter(Boolean).join(" ")}
                {d.profiles?.email ? `, ${d.profiles.email}` : ""}
              </p>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-ink-soft">SIRET</dt>
                <dd className="font-mono tabular-nums text-ink">{siretLisible(d.siret)}</dd>
                {d.telephone && (
                  <>
                    <dt className="text-ink-soft">{t("Téléphone", "Phone")}</dt>
                    <dd className="text-ink">{d.telephone}</dd>
                  </>
                )}
                {d.ville && (
                  <>
                    <dt className="text-ink-soft">{t("Ville", "City")}</dt>
                    <dd className="text-ink">{d.ville}</dd>
                  </>
                )}
                <dt className="text-ink-soft">{t("Reçu le", "Received")}</dt>
                <dd className="text-ink">{new Date(d.created_at).toLocaleDateString("fr-FR")}</dd>
              </dl>
              {/* Lien direct vers l'annuaire officiel des entreprises : la
                  vérification demande dix secondes, autant la faciliter. */}
              <a
                href={`https://annuaire-entreprises.data.gouv.fr/etablissement/${d.siret}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-pro-accent underline underline-offset-4"
              >
                {t("Vérifier ce SIRET sur l'annuaire officiel", "Check this SIRET in the official registry")}
              </a>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => trancher(d.id, "refusee")}
                disabled={enCours !== null}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
              >
                <X className="h-4 w-4" /> {t("Refuser", "Reject")}
              </button>
              <button
                onClick={() => trancher(d.id, "validee")}
                disabled={enCours !== null}
                className="inline-flex items-center gap-1.5 rounded-full bg-pro-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-deep disabled:opacity-50"
              >
                {enCours === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {t("Valider", "Approve")}
              </button>
            </div>
          </div>
        </div>
      ))}

      {traites.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-ink-soft">{t("Déjà traités", "Already processed")}</h3>
          <ul className="divide-y divide-line rounded-2xl bg-paper ring-1 ring-line">
            {traites.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="min-w-0 truncate text-ink">
                  {d.nom_centre}
                  <span className="text-ink-soft">{d.profiles?.email ? `, ${d.profiles.email}` : ""}</span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    d.statut === "validee" ? "bg-emerald-50 text-emerald-700" : "bg-brand-tint text-brand",
                  )}
                >
                  {d.statut === "validee" ? t("Validé", "Approved") : t("Refusé", "Rejected")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
