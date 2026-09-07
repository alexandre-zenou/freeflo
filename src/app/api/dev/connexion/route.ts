import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Connexion de DÉMONSTRATION, réservée au développement.
 *
 * Écrite pour une contrainte précise : présenter les trois rôles en public sans
 * que le moindre identifiant n'apparaisse à l'écran, ni dans le code, ni dans
 * le terminal, ni dans une page.
 *
 * D'où le sens de la circulation. Un bouton qui pré-remplirait le formulaire
 * ferait forcément transiter le mot de passe par le navigateur : Supabase
 * authentifie côté client, la valeur serait dans la mémoire de la page et dans
 * le corps de la requête, donc lisible dans l'onglet réseau. Ici c'est le
 * SERVEUR qui s'authentifie et qui pose les cookies de session. Le navigateur
 * n'envoie qu'un mot : « admin », « client » ou « centre ».
 *
 * Conséquence à connaître : le mot de passe n'est jamais dans le bundle, jamais
 * dans le HTML, jamais dans une requête du navigateur. Ce qui revient au
 * navigateur, ce sont les cookies de session, exactement comme après une
 * connexion normale.
 *
 * FERMÉE EN PRODUCTION. Deux verrous plutôt qu'un, parce qu'un seul oubli
 * ouvrirait une porte d'administration à tout internet :
 *
 * 1. `NODE_ENV`, que Next fige à « production » dans un build déployé ;
 * 2. l'absence des variables `DEMO_*`, qui ne sont que dans `.env.local`, un
 *    fichier jamais commité. Même en forçant le premier verrou, la route n'a
 *    rien à lire.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES = {
  admin: "DEMO_ADMIN",
  client: "DEMO_CLIENT",
  centre: "DEMO_CENTRE",
} as const;

type Cle = keyof typeof ROLES;

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    /* 404 et non 403 : en production, cette route ne doit pas exister du tout,
       pas même se signaler comme interdite. */
    return new NextResponse("Not found", { status: 404 });
  }

  let role: string;
  try {
    role = String((await request.json())?.role ?? "");
  } catch {
    return NextResponse.json({ error: "Corps illisible." }, { status: 400 });
  }

  if (!Object.prototype.hasOwnProperty.call(ROLES, role)) {
    return NextResponse.json({ error: "Rôle inconnu." }, { status: 400 });
  }

  const prefixe = ROLES[role as Cle];
  const email = process.env[`${prefixe}_EMAIL`];
  const password = process.env[`${prefixe}_PASSWORD`];

  if (!email || !password) {
    return NextResponse.json(
      { error: `${prefixe}_EMAIL ou ${prefixe}_PASSWORD manque dans .env.local.` },
      { status: 503 },
    );
  }

  /*
    Client SSR et non le client d'administration : on veut une vraie session,
    avec ses cookies, pas un contournement de la RLS. Ce compte sera soumis aux
    mêmes règles que n'importe quel visiteur connecté, ce qui est le but d'une
    démonstration honnête.
  */
  const store = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => store.set(name, value, options)),
      },
    },
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    /*
      Le message de Supabase est renvoyé : on est en développement, et savoir
      que le mot de passe stocké ne correspond plus au compte fait gagner un
      quart d'heure. Il ne contient pas le mot de passe.
    */
    console.error("connexion démo:", error.message);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  /* 204 sans corps : rien à dire, les cookies portent tout. */
  return new NextResponse(null, { status: 204 });
}
