import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Point d'arrivée des liens reçus par e-mail (réinitialisation, confirmation).
 *
 * Pourquoi une route SERVEUR. Par défaut, Supabase protège ces liens par un
 * secret gardé dans le navigateur qui les a DEMANDÉS (échange « PKCE »). Or le
 * cas le plus courant pour un mot de passe oublié, c'est de demander depuis son
 * ordinateur et d'ouvrir l'e-mail sur son téléphone : le lien échouait alors,
 * sans explication, et la personne restait bloquée.
 *
 * Ici, le lien porte un `token_hash` que le serveur vérifie auprès de Supabase
 * (`verifyOtp`). Aucun secret de navigateur n'est nécessaire : le lien marche
 * sur n'importe quel appareil. La session est ensuite posée en cookies, et le
 * visiteur arrive sur la page demandée déjà authentifié.
 *
 * Exige que le modèle d'e-mail de Supabase pointe ici, avec
 * `{{ .TokenHash }}` : voir `docs/DEPLOIEMENT.md`.
 */
export const dynamic = "force-dynamic";

/*
  Seulement un chemin INTERNE. `next` vient de l'URL, donc de n'importe qui :
  l'accepter tel quel ferait de ce lien, qui porte le nom de FREEFLO, un moyen
  d'envoyer quelqu'un sur un site d'hameçonnage après une vraie connexion.
*/
function cheminSur(brut: string | null, defaut: string): string {
  if (!brut || !brut.startsWith("/") || brut.startsWith("//") || brut.includes("\\")) return defaut;
  return brut;
}

const TYPES: EmailOtpType[] = ["recovery", "signup", "email", "invite", "magiclink", "email_change"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const defaut = type === "recovery" ? "/nouveau-mot-de-passe" : "/connexion?confirme=1";
  const suite = cheminSur(searchParams.get("next"), defaut);

  if (tokenHash && type && TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${suite}`);
    console.error("auth/confirm:", error.message);
  }

  /* Lien expiré, déjà utilisé ou trafiqué : on le dit, plutôt que de laisser
     la personne sur une page qui ne comprendrait pas pourquoi elle est là. */
  return NextResponse.redirect(`${origin}/connexion?lien=invalide`);
}
