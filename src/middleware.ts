import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Renouvellement de la session Supabase à chaque requête de page.
 *
 * Sans lui, le jeton d'accès expire au bout d'une heure et n'est rafraîchi que
 * par le navigateur : quelqu'un qui revient le lendemain, ou qui ouvre un lien
 * dans un nouvel onglet, arrive déconnecté le temps que le client s'en aperçoive.
 * Les composants serveur, eux, ne verraient jamais la session du tout.
 *
 * `getClaims()` n'est pas un appel décoratif : c'est LUI qui déclenche le
 * renouvellement quand le jeton est proche de l'expiration. Le retirer sous
 * prétexte qu'on n'utilise pas sa valeur casserait tout le mécanisme.
 *
 * Le `response` est reconstruit à l'identique après l'écriture des cookies,
 * parce que Supabase peut en émettre de nouveaux : les poser sur la requête ET
 * sur la réponse est le patron officiel, et l'oublier fait perdre la session
 * une requête sur deux.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  /*
    SANS CONFIGURATION, ON LAISSE PASSER.

    Ce garde-fou a été écrit après coup, le 28/08/2026, parce que son absence a
    mis le site entier hors ligne : le code est parti en production avant que
    les variables ne soient saisies chez Vercel, `createServerClient` a reçu
    `undefined` et a levé. Le middleware s'exécutant sur TOUTES les pages,
    chacune répondait 500, `MIDDLEWARE_INVOCATION_FAILED`.

    Une variable manquante doit dégrader l'authentification, pas abattre les
    pages publiques : un visiteur qui vient lire les tarifs n'a que faire de
    notre configuration. On sort donc sans rien faire, et le site s'affiche
    déconnecté.
  */
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  /*
    Même principe : Supabase injoignable, jeton illisible, panne de leur côté.
    Rien de tout cela ne justifie de refuser la page. On perd le renouvellement
    de session pour cette requête, le client le retentera.
  */
  try {
    await supabase.auth.getClaims();
  } catch {
    /* session non renouvelée cette fois-ci, la page part quand même */
  }

  return response;
}

export const config = {
  /*
    Tout sauf les fichiers statiques et les images. Faire passer les vidéos et
    les photos par ici ajouterait un appel réseau à chaque octet servi, pour
    rien : elles ne portent pas de session.
  */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand|video|categories|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ico)$).*)",
  ],
};
