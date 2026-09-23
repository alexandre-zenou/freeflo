import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOT_DE_PASSE_MIN_CENTRE, normaliserSiret, siretValide } from "@/lib/regles-inscription";

/**
 * Inscription d'un centre : le compte ET son dossier, d'un seul geste, côté
 * serveur.
 *
 * Avant, le formulaire appelait `signUp` depuis le navigateur avec quatre des
 * huit champs, et le nom du centre, son SIRET, son téléphone et sa ville
 * étaient jetés. L'administration recevait un compte anonyme.
 *
 * Pourquoi le serveur plutôt que le navigateur :
 *
 * · créer le dossier exige de connaître l'identifiant du compte. Si le
 *   navigateur le fournissait, n'importe qui pourrait rattacher un faux dossier
 *   au compte de quelqu'un d'autre. Ici, l'identifiant vient de la réponse de
 *   Supabase au serveur, jamais du client ;
 * · les règles (SIRET à 14 chiffres, mot de passe d'au moins dix caractères)
 *   ne valent que si le serveur les applique. Un formulaire se contourne ;
 * · si le dossier ne peut pas être enregistré, on supprime le compte qu'on
 *   vient de créer, pour que le centre puisse recommencer au lieu de se
 *   retrouver bloqué avec un compte sans dossier.
 *
 * Le compte créé reste un compte MEMBRE : devenir « centre » est une décision
 * de l'administration, prise depuis l'espace pro après vérification.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  Un CODE plutôt qu'une phrase : le site est bilingue, et c'est au formulaire,
  qui connaît la langue du visiteur, de choisir le texte. Le message français
  reste joint pour les journaux et le débogage.
*/
type Code =
  | "champs" | "centre" | "email" | "siret" | "mot-de-passe"
  | "quota" | "doublon" | "indisponible" | "echec";

const erreur = (code: Code, message: string, status = 400) =>
  NextResponse.json({ code, error: message }, { status });

export async function POST(request: Request) {
  let corps: Record<string, unknown>;
  try {
    corps = await request.json();
  } catch {
    return erreur("champs", "Corps illisible.");
  }

  const lire = (k: string) => String(corps[k] ?? "").trim();
  const prenom = lire("prenom");
  const nom = lire("nom");
  const email = lire("email").toLowerCase();
  const motDePasse = String(corps.motDePasse ?? "");
  const nomCentre = lire("centre");
  /* Le SIRET s'écrit souvent avec des espaces, « 902 145 776 00018 » : on ne
     garde que les chiffres avant de le contrôler. */
  const siret = normaliserSiret(lire("siret"));
  const telephone = lire("telephone");
  const ville = lire("ville");

  if (!prenom || !nom) return erreur("champs", "Prénom et nom sont requis.");
  if (!nomCentre) return erreur("centre", "Le nom du centre est requis.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return erreur("email", "Adresse e-mail invalide.");
  if (!siretValide(siret)) return erreur("siret", "SIRET invalide : 14 chiffres, ou laissez vide.");
  if (motDePasse.length < MOT_DE_PASSE_MIN_CENTRE) {
    return erreur("mot-de-passe", `Mot de passe trop court : au moins ${MOT_DE_PASSE_MIN_CENTRE} caractères.`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const admin = createAdminClient();
  if (!url || !anon || !admin) return erreur("indisponible", "Inscription indisponible pour le moment.", 503);

  /*
    `signUp` et non `admin.createUser` : c'est lui qui envoie l'e-mail de
    confirmation. Le centre prouve ainsi qu'il détient l'adresse, comme
    n'importe quel inscrit.
  */
  const publique = createClient(url, anon, { auth: { persistSession: false } });
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const { data, error } = await publique.auth.signUp({
    email,
    password: motDePasse,
    options: {
      data: { first_name: prenom, last_name: nom },
      emailRedirectTo: `${origin}/connexion?confirme=1`,
    },
  });

  if (error) {
    const m = error.message.toLowerCase();
    if (error.status === 429 || m.includes("rate limit")) {
      return erreur("quota", "Trop d'inscriptions en peu de temps. Réessayez dans une heure.", 429);
    }
    if (m.includes("password")) return erreur("mot-de-passe", "Mot de passe refusé : choisissez-en un plus long.");
    console.error("inscription centre, signUp:", error.message);
    return erreur("echec", "La création du compte a échoué.", 502);
  }

  /*
    Adresse déjà inscrite : Supabase répond « ok » avec une liste d'identités
    VIDE, pour ne pas révéler qui est inscrit. On le dit sans le confirmer : le
    message vaut pour les deux cas.
  */
  const user = data.user;
  if (!user || (user.identities && user.identities.length === 0)) {
    return erreur(
      "doublon",
      "Si un compte existe déjà avec cette adresse, connectez-vous pour compléter votre dossier.",
      409,
    );
  }

  const { error: e2 } = await admin.from("candidatures_centres").insert({
    profile_id: user.id,
    nom_centre: nomCentre,
    siret,
    telephone,
    ville,
  });

  if (e2) {
    console.error("inscription centre, dossier:", e2.message);
    /* On défait le compte : sans dossier, il serait inutilisable et bloquerait
       l'adresse pour une nouvelle tentative. */
    await admin.auth.admin.deleteUser(user.id);
    return erreur("echec", "Le dossier n'a pas pu être enregistré. Recommencez.", 502);
  }

  return NextResponse.json({ ok: true, confirmation: !data.session }, { status: 201 });
}
