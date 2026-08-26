import Stripe from "stripe";

/**
 * Client Stripe, côté SERVEUR uniquement.
 *
 * Ce fichier ne doit jamais être importé depuis un composant `"use client"` :
 * il porte la clé secrète, et Next l'embarquerait dans le bundle du navigateur.
 * Seules les routes d'API sous `app/api/` s'en servent.
 *
 * Instancié à la DEMANDE et non au chargement du module : sans cela, un build
 * sans `STRIPE_SECRET_KEY` échouerait, alors que le site doit continuer de se
 * construire et de se déployer quand le paiement n'est pas configuré.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

/**
 * Garde-fou de démonstration : on refuse de tourner avec une clé de PRODUCTION.
 *
 * Ce build est une maquette cliquable. Une clé `sk_live_` y encaisserait de
 * vrais paiements sur des cours qui n'existent pas, sans stock réel ni
 * versement aux centres. Les clés de test commencent par `sk_test_`.
 */
export function isTestKey(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
}
