/**
 * Nom du cookie d'indice de rôle, dans un module SANS `"use client"`.
 *
 * Même raison d'être que l'ancien `demo-accounts.ts` : un composant serveur ne
 * peut pas lire une constante d'un module client, Next n'en exporte que des
 * références. Or `ProHomeGate` écrit un script bloquant, donc côté serveur, et
 * a besoin de ce nom. `lib/auth.tsx` l'importe aussi, c'est la seule
 * définition.
 *
 * Ce que ce cookie contient, ce qu'il ne protège pas, et pourquoi il existe :
 * voir le commentaire de `ecrireRole` dans `lib/auth.tsx`.
 */
export const ROLE_COOKIE = "ff-role";
