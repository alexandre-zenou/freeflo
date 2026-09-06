import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase d'ADMINISTRATION, à n'utiliser que côté serveur.
 *
 * Il porte la clé `service_role`, qui **contourne intégralement la RLS** : avec
 * elle, aucune policy ne s'applique, on lit et on écrit tout. C'est l'exact
 * opposé du client du navigateur, dont la sécurité repose sur ces policies.
 *
 * Trois règles, et aucune n'est négociable :
 *
 * 1. ce fichier ne doit JAMAIS être importé depuis un composant `"use client"`,
 *    Next embarquerait la clé dans le bundle de la page ;
 * 2. la variable ne porte pas de préfixe `NEXT_PUBLIC_`, ce qui est justement
 *    ce qui l'empêche de partir au navigateur ;
 * 3. tout appel passant par ici doit avoir vérifié AVANT qui le demande. Ce
 *    client ne pose aucune question, il obéit.
 *
 * `persistSession: false` : il n'y a pas d'utilisateur derrière, rien à
 * conserver entre deux requêtes, et écrire une session serait un état partagé
 * entre des appels qui n'ont rien à voir.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
