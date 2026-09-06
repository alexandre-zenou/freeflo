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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  await supabase.auth.getClaims();

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
