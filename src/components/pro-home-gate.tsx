import { SESSION_KEY, proEmails } from "@/lib/demo-accounts";

/**
 * Porte de l'ACCUEIL pour un compte professionnel, décidée avant la peinture.
 *
 * `ProHomeRedirect`, juste à côté, fait le même travail en React, mais il ne
 * peut rien avant l'hydratation : l'accueil est une page statique, le héros et
 * sa vidéo sont donc peints d'abord, et un centre voyait la page qui vend le
 * service au sportif pendant une demi-seconde avant d'être renvoyé. Mesuré :
 * le héros tenait toute une capture d'écran.
 *
 * D'où ce script BLOQUANT. Le navigateur l'exécute en lisant le document,
 * avant le reste de la page : `localStorage` est disponible tout de suite, la
 * décision est donc prise sans attendre React et il n'y a plus rien à voir.
 * C'est le patron habituel des scripts qui évitent un clignotement de thème.
 *
 * Il ne remplace pas le composant client, il le complète : lui gère l'arrivée
 * sur le site, l'autre les navigations internes, où aucun document n'est
 * rechargé (cliquer le logo depuis les mentions légales, par exemple).
 *
 * Trois précautions :
 *
 * · `proEmails` vient de `demo-accounts.ts` et est SÉRIALISÉ ici, jamais
 *   recopié à la main. Ajouter un rôle professionnel suffit ;
 * · `replace` et non `assign` : le bouton « précédent » ne doit pas ramener à
 *   une page qui redirige aussitôt ;
 * · tout est dans un `try` et le script ne rend rien de visible. Navigation
 *   privée, stockage refusé, `localStorage` qui lève : l'accueil s'affiche
 *   normalement, et `ProHomeRedirect` reste le filet.
 */
export function ProHomeGate() {
  const code = `try{if(location.pathname==="/"){var s=(localStorage.getItem(${JSON.stringify(
    SESSION_KEY,
  )})||"").trim().toLowerCase();if(s&&${JSON.stringify(
    proEmails,
  )}.indexOf(s)>-1){location.replace("/pro")}}}catch(e){}`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
