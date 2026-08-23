# Barème de remise dégressive et commission

**Document interne. Ne pas afficher sur le site.**

La règle R1 du retour client du 07/08/2026 (`FEEDBACK-2026-08.md`) interdit
d'afficher un taux de remise, une commission ou un chiffre d'affaires, côté
public comme dans l'espace pro. La cliente a barré ces blocs avec la mention
« INFO PRIVÉE » sur 8 pages de son PDF. La grille de `/inscrire-son-centre` (F4)
et le panneau « Commission dégressive » du tableau de bord (F54) ont été
supprimés à ce titre.

Ce fichier existe pour garder le barème sous la main côté studio. Les **prix**
(plein barré + prix du moment) restent, eux, affichables : c'est le pourcentage
qui ne l'est pas.

## Barème

| Tranche | Remise centre | Commission FREEFLO |
|---|---|---|
| 12 h → 10 h | -30 % | 25 % |
| 10 h → 8 h | -35 % | 25 % |
| 8 h → 6 h | -40 % | 25 % |
| 6 h → 4 h | -50 % | 20 % |
| 4 h → 2 h | -60 % | 20 % |
| 2 h → 0 h | -70 % | 15 % |

*Règle du plancher : commission = max(% × prix vendu remisé, 1,50 €)*

## Écart avec le moteur en production

Ce barème n'est **pas** celui qu'implémente `src/lib/pricing.ts`, qui traduit le
§3 du cahier des charges. Quatre différences de fond :

1. **Découpage du temps.** Le moteur a 5 paliers larges (+48 h, 24 à 48 h,
   12 à 24 h, 2 à 12 h, moins de 2 h). Ce barème en a 6, par tranches de 2 h,
   et ne couvre que les 12 dernières heures. Rien n'est défini au-delà de 12 h.
2. **Le stock disparaît.** Dans le moteur, la remise dépend aussi du nombre de
   places restantes : chaque palier porte trois valeurs (plus de 5 places,
   3 à 5, 1 à 2). Ce barème donne une seule remise par tranche.
3. **Les taux ne coïncident pas.** Exemple à 3 h de l'échéance : le moteur
   applique 55 %, 40 % ou 25 % selon le stock, là où ce barème impose 60 %.
4. **Le plancher de 1,50 € n'existe pas** dans le code. La commission y est une
   courbe continue de 25 % à 8 % pilotée par la remise
   (`COMMISSION_BASE` / `COMMISSION_FLOOR`), sans montant minimum.

Passer à ce barème veut donc dire réécrire `TIERS` et `computePrice`, et
reprendre les tests unitaires de `pricing.ts`. Ce n'est pas fait : le moteur est
inchangé. À arbitrer avec la cliente avant la phase 2.
