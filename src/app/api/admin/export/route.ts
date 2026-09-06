import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Export CSV des inscrits et des centres, pour Google Sheets.
 *
 * Pourquoi passer par ici plutôt que d'interroger Supabase depuis la feuille :
 * il faudrait y mettre la clé `service_role`, laquelle contourne toute la RLS.
 * Quiconque a l'accès en ÉDITION à la feuille peut ouvrir l'éditeur de script
 * et la lire. Sur une base qui contient les adresses des clients, c'est non.
 * Ici la clé reste sur Vercel, et la feuille ne connaît qu'un secret d'export,
 * révocable en changeant une variable d'environnement.
 *
 * L'appelant s'authentifie par l'en-tête `x-freeflo-export-key`. En-tête et non
 * paramètre d'URL : les URL se retrouvent dans les journaux du serveur, dans
 * l'historique et dans les référents, un secret n'y a pas sa place.
 *
 * Aucune donnée n'est renvoyée si `EXPORT_SECRET` n'est pas configurée : une
 * variable oubliée doit fermer la porte, jamais l'ouvrir.
 */
export const runtime = "nodejs";
/* Jamais mis en cache : ce sont des données qui changent, et une réponse
   partagée exposerait le contenu d'un export à qui n'a pas le secret. */
export const dynamic = "force-dynamic";

/**
 * Comparaison à temps CONSTANT.
 *
 * `a === b` s'arrête au premier caractère qui diffère : le temps de réponse
 * renseigne alors sur la longueur du préfixe correct, ce qui permet de
 * reconstituer un secret caractère par caractère. Rare sur un réseau public,
 * mais le coût d'y parer est nul.
 */
function memeSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Échappement CSV : guillemets doublés, et champ cité dès qu'il contient un
 *  séparateur, un guillemet ou un saut de ligne. Sans quoi un nom composé
 *  comme « Durand, Thomas » décalerait toute la ligne. */
function cellule(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const csv = (lignes: unknown[][]) => lignes.map((l) => l.map(cellule).join(",")).join("\n");

export async function GET(request: Request) {
  const attendu = process.env.EXPORT_SECRET;
  if (!attendu) {
    return NextResponse.json({ error: "Export non configuré." }, { status: 503 });
  }

  const fourni = request.headers.get("x-freeflo-export-key") ?? "";
  if (!memeSecret(fourni, attendu)) {
    /* Message volontairement muet : ne pas dire si le secret est absent,
       trop court ou faux. */
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY manque côté serveur." },
      { status: 503 },
    );
  }

  const quoi = new URL(request.url).searchParams.get("table") ?? "profiles";

  if (quoi === "vendors") {
    const { data, error } = await supabase
      .from("vendors")
      .select("name, address, arrondissement, lat, lng, stripe_account_id, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("export vendors:", error);
      return NextResponse.json({ error: "Lecture impossible." }, { status: 502 });
    }
    return texte(
      csv([
        ["nom", "adresse", "arrondissement", "lat", "lng", "compte_stripe", "cree_le"],
        ...(data ?? []).map((v) => [
          v.name, v.address, v.arrondissement, v.lat, v.lng, v.stripe_account_id, v.created_at,
        ]),
      ]),
    );
  }

  /*
    Colonnes choisies UNE À UNE, jamais `select("*")`. Une colonne ajoutée plus
    tard à la table, un jeton ou une note interne par exemple, partirait sinon
    dans la feuille sans que personne ne l'ait décidé.
  */
  const { data, error } = await supabase
    .from("profiles")
    .select("email, first_name, last_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("export profiles:", error);
    return NextResponse.json({ error: "Lecture impossible." }, { status: 502 });
  }

  return texte(
    csv([
      ["email", "prenom", "nom", "role", "inscrit_le"],
      ...(data ?? []).map((p) => [p.email, p.first_name, p.last_name, p.role, p.created_at]),
    ]),
  );
}

function texte(corps: string) {
  return new NextResponse(corps, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
