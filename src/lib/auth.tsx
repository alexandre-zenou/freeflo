"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { ROLE_COOKIE } from "@/lib/auth-cookie";
import { createClient, supabaseConfigure } from "@/lib/supabase/client";

/**
 * Authentification RÉELLE, sur Supabase.
 *
 * Elle remplace le magasin de démonstration de `lib/account.tsx`, qui gardait
 * comptes et session dans `localStorage` et ne protégeait donc rien. Ici, la
 * session est un jeton signé par Supabase, et ce que le porteur a le droit de
 * lire ou d'écrire est décidé par les policies RLS de Postgres, pas par du
 * code de navigateur qu'on peut contourner depuis la console.
 *
 * La SURFACE est volontairement identique à l'ancienne (`useMember`,
 * `useHydrated`, `useIsPro`…) : quinze composants s'en servent, et les
 * réécrire tous aurait multiplié les occasions de casser quelque chose.
 * Seul `auth-form.tsx` change, parce que la connexion devient asynchrone.
 */
export type Role = "member" | "centre" | "admin";

/**
 * Cookie d'INDICE, lisible par le navigateur, portant le seul rôle.
 *
 * Il n'est pas un jeton et ne protège rien : n'importe qui peut le réécrire
 * depuis la console. Ce que ce compte a le droit de lire reste décidé par les
 * policies RLS de Postgres, qui ne le regardent jamais.
 *
 * Il existe pour une raison purement visuelle. `ProHomeGate` doit décider AVANT
 * la peinture si un compte professionnel doit quitter l'accueil, or la session
 * Supabase est un jeton signé qu'un script bloquant ne peut pas décoder, et le
 * rôle vit dans `profiles`, donc à un aller-retour réseau de là. Sans cet
 * indice, un centre verrait le héros une demi-seconde avant d'être renvoyé.
 *
 * `SameSite=Lax` et pas de `HttpOnly` : il DOIT être lisible par le script de
 * la page, c'est tout son objet.
 */
export { ROLE_COOKIE };

function ecrireRole(role: Role | null) {
  if (typeof document === "undefined") return;
  document.cookie =
    role === null
      ? `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`
      : `${ROLE_COOKIE}=${role}; path=/; max-age=2592000; SameSite=Lax`;
}

export interface Member {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

interface AuthState {
  member: Member | null;
  /** L'état de la session est-il CONNU ? Faux tant que Supabase n'a pas répondu. */
  pret: boolean;
}

const AuthContext = createContext<AuthState>({ member: null, pret: false });

/*
  Copie hors de React, pour `currentMember()`.

  Le formulaire de connexion en a besoin : juste après `signIn`, il doit savoir
  si le compte est un centre pour l'envoyer vers l'espace pro plutôt que vers la
  page demandée. À cet instant le hook renvoie encore la valeur du rendu
  précédent, celui d'avant la connexion.
*/
let dernier: Member | null = null;

/*
  Constante de BUILD : Next remplace les `process.env.NEXT_PUBLIC_*` par leur
  valeur à la compilation. Le test ne coûte donc rien à l'exécution, et surtout
  il est connu dès le premier rendu, ce qui permet de partir avec le bon état
  plutôt que de le corriger dans un effet.
*/
const CONFIGURE = supabaseConfigure();

/**
 * Lit le profil et en déduit le membre.
 *
 * Partagée entre le fournisseur et `signIn`, et c'est tout l'intérêt : sans
 * cela, `signIn` rendait la main avant que le rôle ne soit connu. Le formulaire
 * lisait alors `currentMember()` vide, concluait « ce n'est pas un compte pro »
 * et envoyait un centre vers le catalogue, d'où il était aussitôt renvoyé vers
 * l'espace pro. Le visiteur voyait passer une page qui ne le concernait pas.
 *
 * Le rôle n'est PAS dans le jeton, volontairement : l'y mettre obligerait à
 * réémettre un jeton à chaque changement de rôle, et un jeton déjà distribué
 * continuerait d'affirmer l'ancien. Il faut donc bien ce second aller-retour,
 * et c'est à `signIn` de l'attendre.
 */
async function lireMembre(
  supabase: SupabaseClient,
  userId: string,
  email: string,
): Promise<Member> {
  const { data } = await supabase
    .from("profiles")
    .select("first_name, last_name, role")
    .eq("id", userId)
    .maybeSingle();

  /*
    Profil absent : le déclencheur vient peut-être d'être posé, ou la ligne a
    été supprimée à la main. On tient quand même la session, avec le rôle le
    MOINS privilégié. Ne jamais deviner un rôle élevé en cas de doute.
  */
  return {
    firstName: data?.first_name || email.split("@")[0],
    lastName: data?.last_name || "",
    email,
    role: (data?.role as Role) ?? "member",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  /*
    Sans configuration, l'état est déjà DÉFINITIF : personne n'est connecté, et
    on le sait. `pret: true` d'emblée, sinon les gardes attendraient une réponse
    qui ne viendra jamais et afficheraient leur squelette pour toujours.
  */
  const [state, setState] = useState<AuthState>({ member: null, pret: !CONFIGURE });

  useEffect(() => {
    /*
      Pas de configuration : rien à faire, l'état initial dit déjà tout. Sans ce
      test, `createClient` lèverait dans l'effet du fournisseur, qui enveloppe
      TOUTES les pages, et le site entier deviendrait blanc pour une variable
      oubliée. C'est exactement ce qui est arrivé en production le 28/08/2026.
    */
    if (!CONFIGURE) return;

    const supabase = createClient();
    let vivant = true;

    /*
      Le rôle, le prénom et le nom vivent dans `public.profiles`, pas dans le
      jeton : les y mettre obligerait à réémettre un jeton à chaque changement
      de rôle, et un jeton déjà distribué continuerait d'affirmer l'ancien.
      On lit donc la table, protégée par RLS (chacun ne voit que son profil).
    */
    const charger = async (userId: string, email: string) => {
      const membre = await lireMembre(supabase, userId, email);
      if (!vivant) return;
      dernier = membre;
      ecrireRole(membre.role);
      setState({ member: membre, pret: true });
    };

    const appliquer = async (session: Session | null) => {
      if (!session?.user) {
        dernier = null;
        ecrireRole(null);
        if (vivant) setState({ member: null, pret: true });
        return;
      }
      await charger(session.user.id, session.user.email ?? "");
    };

    /* Session déjà ouverte au chargement de la page. */
    void supabase.auth.getSession().then(({ data }) => appliquer(data.session));

    /*
      Puis on suit les changements : connexion, déconnexion, renouvellement du
      jeton, et surtout les DEUX ONGLETS. Supabase propage la session entre
      onglets, l'écouteur nous l'apprend sans qu'on ait à surveiller le stockage.
    */
    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      void appliquer(session);
    });

    return () => {
      vivant = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  /* Mémorisé : sans cela chaque rendu du fournisseur donnerait un nouvel objet
     de contexte et rerendrait tous les consommateurs pour rien. */
  const valeur = useMemo(() => state, [state]);
  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export function useMember(): Member | null {
  return useContext(AuthContext).member;
}

/**
 * « Sait-on qui regarde ? »
 *
 * Garde le nom de l'ancien crochet, mais le sens s'est déplacé : il ne s'agit
 * plus d'attendre l'hydratation de React, mais la réponse de Supabase. Les
 * gardes s'en servaient déjà exactement pour ça, ne pas afficher « accès
 * réservé » à quelqu'un qui est connecté, donc rien à changer chez elles.
 */
export function useHydrated(): boolean {
  return useContext(AuthContext).pret;
}

export function useIsAdmin(): boolean {
  return useMember()?.role === "admin";
}

export function useIsPro(): boolean {
  const role = useMember()?.role;
  return role === "admin" || role === "centre";
}

/** Le membre connu au dernier événement, hors du cycle de rendu. */
export function currentMember(): Member | null {
  return dernier;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type SignInResult =
  | "ok"
  | "invalid-credentials"
  | "email-not-confirmed"
  | "quota-emails"
  | "error";

/**
 * Un seul verdict pour « e-mail inconnu » et « mauvais mot de passe ».
 *
 * Ce n'est pas une paresse : Supabase renvoie volontairement le même message
 * pour les deux. Les distinguer transformerait le formulaire en outil de
 * vérification d'adresses, permettant de savoir qui est inscrit sur FREEFLO en
 * essayant des e-mails au hasard. L'ancienne version de démonstration le
 * faisait, ce qui était sans conséquence sur des comptes fictifs.
 */
export async function signIn(email: string, password: string): Promise<SignInResult> {
  if (!supabaseConfigure()) return "error";
  if (!supabaseConfigure()) return "error";
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (!error) {
    /*
      On ATTEND le profil avant de rendre la main. L'écouteur du fournisseur
      finira par le charger de son côté, mais plus tard : l'appelant, lui,
      décide tout de suite vers où rediriger, et doit connaître le rôle.
    */
    if (data.user) {
      const membre = await lireMembre(supabase, data.user.id, data.user.email ?? email.trim());
      dernier = membre;
      ecrireRole(membre.role);
    }
    return "ok";
  }
  const m = error.message.toLowerCase();
  if (m.includes("rate limit") || error.status === 429) return "quota-emails";
  if (m.includes("not confirmed") || m.includes("email not confirmed")) return "email-not-confirmed";
  if (m.includes("invalid login credentials")) return "invalid-credentials";
  return "error";
}

export type SignUpResult =
  | "ok"
  | "confirmation-envoyee"
  | "email-taken"
  | "weak-password"
  /**
   * Quota d'envoi atteint.
   *
   * Le serveur d'e-mails intégré de Supabase plafonne à quelques messages par
   * heure : il est prévu pour développer, pas pour recevoir du public. Sans
   * serveur d'envoi configuré (Authentication → SMTP Settings), les inscrits
   * au-delà du quota ne reçoivent RIEN, et sans ce cas ils lisaient « réessayez
   * dans un instant », ce qui est faux : il faut attendre une heure.
   */
  | "quota-emails"
  /** Adresse refusée par Supabase (format, ou domaine jugé inexistant). */
  | "email-invalide"
  /** Les inscriptions sont fermées dans Authentication → Providers. */
  | "inscriptions-fermees"
  /**
   * « Database error saving new user » : le compte n'a pas pu être écrit.
   *
   * En pratique c'est le déclencheur `handle_new_user` qui échoue, donc un
   * problème de BASE, pas de saisie. Le distinguer évite de renvoyer le
   * visiteur « réessayez dans un instant » sur une panne qui ne passera pas
   * toute seule.
   */
  | "base-indisponible"
  | "error";

/**
 * Dernier message brut renvoyé par Supabase lors d'un échec d'inscription.
 *
 * Les formulaires n'affichent jamais ce texte tel quel au visiteur (il est en
 * anglais et parle de la base), mais ils le joignent en petit sous le message,
 * et il part dans la console. Sans lui, un échec inconnu se présentait partout
 * comme « réessayez dans un instant », et il était impossible de savoir ce qui
 * s'était réellement passé sur le site en ligne.
 */
let detailInscription: string | null = null;

export function dernierDetailInscription(): string | null {
  return detailInscription;
}

export async function signUp(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<SignUpResult> {
  detailInscription = null;
  if (!supabaseConfigure()) {
    detailInscription = "Supabase n'est pas configuré (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY).";
    return "error";
  }
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      /*
        Prénom et nom passent par les métadonnées, que le déclencheur
        `handle_new_user` recopie dans `profiles`. Le RÔLE n'y est
        volontairement pas : ces données viennent du navigateur, donc de
        n'importe qui, et le déclencheur les ignorerait de toute façon.
      */
      data: { first_name: firstName.trim(), last_name: lastName.trim() },
      emailRedirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/connexion?confirme=1` : undefined,
    },
  });

  if (error) {
    const m = error.message.toLowerCase();
    /* `code` porte l'`error_code` de Supabase, plus stable que le message, mais
       il n'est pas renseigné sur toutes les erreurs : on garde les deux. */
    const code = (error as { code?: string }).code ?? "";
    detailInscription = `${error.status ?? "?"} ${code || "sans code"} : ${error.message}`;
    /* Toujours dans la console : c'est la seule trace exploitable quand l'échec
       arrive chez quelqu'un d'autre, sur le site en ligne. */
    console.error("[freeflo] inscription refusée par Supabase,", detailInscription);

    if (code === "over_email_send_rate_limit" || m.includes("rate limit") || error.status === 429)
      return "quota-emails";
    if (code === "email_address_invalid" || (m.includes("email address") && m.includes("invalid")))
      return "email-invalide";
    if (code === "signup_disabled" || m.includes("signups not allowed")) return "inscriptions-fermees";
    if (code === "unexpected_failure" || m.includes("database error")) return "base-indisponible";
    if (m.includes("already registered") || m.includes("already been registered")) return "email-taken";
    if (m.includes("password")) return "weak-password";
    return "error";
  }

  /*
    Adresse déjà prise : Supabase répond « ok » avec une liste d'identités VIDE
    plutôt qu'une erreur, toujours pour ne pas révéler qui est inscrit. On le
    traite comme un succès côté message affiché, sans quoi on rétablirait la
    fuite qu'on vient d'éviter.

    Sans session en retour, c'est que la confirmation par e-mail est exigée.
  */
  if (!data.session) return "confirmation-envoyee";
  return "ok";
}

export async function signOut() {
  dernier = null;
  ecrireRole(null);
  if (!supabaseConfigure()) return;
  await createClient().auth.signOut();
}
