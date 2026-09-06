import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase côté NAVIGATEUR.
 *
 * Il n'emporte que la clé « anon », qui est publique par construction : la
 * sécurité ne vient pas du secret de cette clé mais des règles RLS écrites dans
 * Postgres. Tout ce qui n'est pas explicitement autorisé par une policy est
 * refusé, y compris à quelqu'un qui lirait la clé dans le code de la page.
 */
/*
  Instance UNIQUE, et ce n'en est pas une optimisation.

  Chaque appel à `createBrowserClient` construit un client qui pose ses propres
  écouteurs sur le stockage et sa propre minuterie de renouvellement de jeton.
  En créer un par composant ferait cohabiter plusieurs machines à état sur la
  même session : les événements d'authentification partiraient en double, et
  deux clients pourraient renouveler le même jeton en même temps, l'un
  invalidant celui que l'autre vient d'obtenir.
*/
/* Typé par `SupabaseClient` et non par `ReturnType<typeof createBrowserClient>` :
   cette fonction est générique, et son type de retour brut fait perdre
   l'inférence à tout ce qui l'utilise ensuite. */
let client: SupabaseClient | null = null;

export class SupabaseNonConfigure extends Error {
  constructor() {
    super("Supabase n'est pas configuré : NEXT_PUBLIC_SUPABASE_URL ou _ANON_KEY manque.");
    this.name = "SupabaseNonConfigure";
  }
}

/** Les variables sont-elles là ? À vérifier avant d'appeler `createClient`. */
export function supabaseConfigure(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function createClient(): SupabaseClient {
  if (client) return client;
  /*
    Erreur NOMMÉE plutôt qu'un `undefined` passé à Supabase, qui lève un message
    obscur. Les appelants attrapent ce cas et traitent le visiteur comme
    déconnecté, plutôt que de laisser l'exception remonter et blanchir la page.
  */
  if (!supabaseConfigure()) throw new SupabaseNonConfigure();
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return client;
}
