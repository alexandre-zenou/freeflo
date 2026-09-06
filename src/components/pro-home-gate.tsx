import { ROLE_COOKIE } from "@/lib/auth-cookie";

/**
 * Porte de l'ACCUEIL pour un compte professionnel, décidée avant la peinture.
 *
 * `ProHomeRedirect`, juste à côté, fait le même travail en React, mais il ne
 * peut rien avant l'hydratation : l'accueil est une page statique, le héros et
 * sa vidéo sont donc peints d'abord, et un centre voyait la page qui vend le
 * service au sportif pendant une demi-seconde avant d'être renvoyé. Mesuré :
 * le héros tenait toute une capture d'écran.
 *
 * D'où ce script BLOQUANT, exécuté par le navigateur en lisant le document,
 * avant le reste de la page. C'est le patron habituel des scripts qui évitent
 * un clignotement de thème.
 *
 * Il lit le cookie d'indice `ff-role` (voir `lib/auth.tsx`) et NON la session
 * Supabase : celle-ci est un jeton signé qu'un script de deux lignes ne peut
 * pas décoder, et le rôle vit de toute façon dans la table `profiles`, à un
 * aller-retour réseau d'ici.
 *
 * Ce n'est PAS une protection, et ça n'a pas à en être une. Réécrire ce cookie
 * depuis la console ne donne accès à rien : `/pro` reste fermée par `ProGuard`,
 * et surtout les données restent fermées par les policies RLS de Postgres, qui
 * ne regardent jamais ce cookie. Au pire, on se redirige soi-même.
 *
 * Trois précautions :
 *
 * · `replace` et non `assign` : le bouton « précédent » ne doit pas ramener à
 *   une page qui redirige aussitôt ;
 * · le nom du cookie est SÉRIALISÉ depuis la constante, jamais recopié ;
 * · tout est dans un `try` et le script ne rend rien de visible. Si quoi que ce
 *   soit échoue, l'accueil s'affiche normalement et `ProHomeRedirect` reste le
 *   filet.
 */
export function ProHomeGate() {
  /* Lecture du cookie à la main plutôt qu'avec une expression régulière
     construite par concaténation : le script part dans le HTML, il doit rester
     relisible par le prochain qui l'ouvrira. */
  const code = [
    "try{",
    'if(location.pathname==="/"){',
    `var n=${JSON.stringify(`${ROLE_COOKIE}=`)};`,
    "var r=\"\";",
    'document.cookie.split(";").forEach(function(c){',
    "c=c.trim();",
    "if(c.indexOf(n)===0){r=c.slice(n.length)}",
    "});",
    'if(r==="centre"||r==="admin"){location.replace("/pro")}',
    "}",
    "}catch(e){}",
  ].join("");

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
