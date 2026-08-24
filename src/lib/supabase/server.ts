import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase côté SERVEUR (composants serveur, Server Actions, routes).
 *
 * La session vit dans les cookies : ce client les lit pour savoir qui parle, et
 * les réécrit quand le jeton est renouvelé. `cookies()` est asynchrone depuis
 * Next 15, d'où le `await` ; la fonction doit donc l'être aussi.
 *
 * Le `try/catch` sur l'écriture n'est pas une négligence : depuis un composant
 * serveur en lecture seule, poser un cookie lève. Le middleware rafraîchit alors
 * la session, et ignorer l'erreur ici est le comportement recommandé.
 */
export async function createClient() {
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            /* composant serveur en lecture seule : le middleware s'en charge */
          }
        },
      },
    },
  );
}
