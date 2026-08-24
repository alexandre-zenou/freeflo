import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase côté NAVIGATEUR.
 *
 * Il n'emporte que la clé « anon », qui est publique par construction : la
 * sécurité ne vient pas du secret de cette clé mais des règles RLS écrites dans
 * Postgres. Tout ce qui n'est pas explicitement autorisé par une policy est
 * refusé, y compris à quelqu'un qui lirait la clé dans le code de la page.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
