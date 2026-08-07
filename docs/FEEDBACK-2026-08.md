# FREEFLO — retour client du 07/08/2026 : inventaire complet & plan de modification

Source : `feedback site.pdf`, 32 pages. Chaque annotation du PDF est reprise ci-dessous,
numérotée **F1 → F76**, avec le fichier concerné. Rien n'est agrégé ni résumé : une
annotation = une ligne.

---

## État d'avancement (mis à jour au fil des lots)

| Lot | Contenu | État |
|---|---|---|
| **B** | Suppressions « info privée » | ✅ fait |
| **A** | Charte : Inter, interlettrage, tirets et points médians, sélection | ✅ fait |
| **C** | Copie | ✅ fait |
| **D** | En-tête, pied de page, pages légales | ✅ fait |
| **E** | Parcours sportif (cartes, fiche offre, filtres) | ✅ fait |
| **F** | Espace pro (modale, Mes offres, Paramètres) | ✅ fait |
| **G** | Page « Inscrire votre centre de sport » | ✅ fait |
| **I** | Fluidité (réf. microsoft.ai) | ✅ fait |
| **H** | Anglais réel | ✅ fait (option H1) |

Points déjà livrés en avance de phase parce qu'ils partageaient les lignes réécrites :
**F31** (titre « Pilates Reformer »), **F33** (« Professeure : Camille »), **F35**
(arrondissement et distance retirés de l'en-tête), **F39** (sous-titre `/offres`),
**F41** (« D'autres créneaux à saisir »), **F64/F65/F66** (libellés de la modale).

**F16 et F46 (textes illisibles sur les héros rouges) étaient déjà corrigés** dans le
build actuel : les captures du PDF datent d'une version antérieure. Le titre est en
blanc, le chapô en blanc à 90 %, et « Changez ça. » est déjà en or. Rien à faire, mais
à confirmer visuellement avec la cliente.

---

## 0. Les quatre règles transversales

Elles reviennent sur presque toutes les pages du PDF et commandent le reste du plan.

| # | Règle | Portée |
|---|---|---|
| **R1** | **Aucun taux de remise, aucune commission, aucun chiffre d'affaires n'est affiché nulle part** — ni public, ni espace pro. Le PDF barre ces blocs avec la mention « INFO PRIVÉE » sur 8 pages. Les **prix** (plein barré + prix du moment) restent, eux, affichés. | tout le site |
| **R2** | **Police = Inter** — Inter Light pour le texte, Inter Bold pour les titres. Remplace Hanken Grotesk **et** Instrument Serif (donc plus de serif du tout, y compris dans l'espace pro). | `layout.tsx`, `globals.css` |
| **R3** | **Zéro « marqueur de Claude »** : plus de tirets cadratins `—`, plus de points médians `·` décoratifs, plus d'interlettrage sur les intitulés en capitales (`.eyebrow`, `tracking-*`). | 33 fichiers |
| **R4** | **La maquette Canva fait foi** : mise en page, couleurs (« mon blanc pantone », « mon jaune pantone »), bannière, vidéos. | tout le site |

---

## 1. Inventaire des retours, page par page

### p.2 — FYI : fluidité
- **F1** — Site de référence **https://microsoft.ai** : « j'aime beaucoup les sites qui ne sont pas statiques ». Faire un inspect element et reproduire ce parcours fluide. En particulier : **la carte doit apparaître avec la même fluidité**.

### p.3–6 — Pages à supprimer (info privée)
- **F2** — Supprimer la section « Le prix fond quand le temps brûle » (simulateur + courbe de fonte). → `components/sections/mechanic.tsx`, affichée sur `/comment-ca-marche`.
- **F3** — Supprimer le bloc « Vous gérez un centre de sport ? / Remplissez vos créneaux vides. Gratuitement. » + les 4 arguments + les 4 stats. → `components/sections/vendor-cta.tsx`, affichée sur `/`.
- **F4** — Supprimer la grille « Plus vous bradez, moins on prélève. » → section « commission grid » de `app/inscrire-son-centre/page.tsx`.

### p.7 — Commentaires généraux
- **F5** — Reprendre exactement la mise en page du Canva : bannière, couleurs, vidéos.
- **F6** — Changer la police : **Inter Light** pour le texte, **Inter Gras** pour les titres.
- **F7** — Enlever tous les points et tirets inutiles (entourés : `4.9 · 214 avis · 15e · 0.8 km`, `Pilates Reformer — À vous le summer body`, `The New Me · avec Camille`).
- **F8** — Enlever les espacements entre les lettres (exemple entouré : `Q U I   S O M M E S   N O U S ?`).
- **F9** — **Faire fonctionner le site en anglais.**
- **F10** — Améliorer la fluidité du site, faire apparaître le texte de manière fluide (cf. F1).
- **F11** — Bien se référer au Canva.

### p.8 — Bannière / en-tête
- **F12** — Décaler les liens de navigation **vers la droite** (ils sont aujourd'hui centrés).
- **F13** — Ajouter la rubrique **« Inscrire mon centre »**, à droite d'« Espace pro ».

### p.9 — `/qui-sommes-nous`
- **F14** — Titre → **« La plateforme qui remplit les salles et fait bouger les gens »**.
- **F15** — Chapô → « FREEFLO est né d'un constat simple : chaque jour, des milliers de places de cours sont vides tandis que des sportifs renoncent faute de budget. FREEFLO est la solution qui permet de résoudre ces deux problématiques en proposant les créneaux vides à prix réduit, en dernière minute. »
- **F16** — Le texte du héros est illisible (encre sombre sur rouge) → à reprendre.
- **F17** — Conviction 1 « Une place vide ne vaut rien » → remplacée par **« Le sport sans contraintes »** / « Une envie de bouger, là, maintenant ? FREEFLO offre des créneaux disponibles dans l'instant, près de chez vous. »
- **F18** — Conviction 3 « Les centres restent maîtres » → remplacée par **« Le sport accessible »** / « Réservez en quelques clics. Le sport n'a jamais été aussi facile d'accès et abordable. »
  *(la conviction 2 « Le sport sans abonnement » est conservée)*

### p.10 — Concurrents
- **F19** — **Ne jamais évoquer Too Good To Go ni Treatwell.** Occurrence à corriger : « Virements quotidiens — *Comme Treatwell*, pas comme les autres… » (`lib/site.ts`, `vendorValue`).

### p.11 — Bandeau étapes & pied de page
- **F20** — « COMMENT ÇA **MARCHE** » → « COMMENT ÇA **FONCTIONNE** » (bandeau, lien de pied de page, titre de page, route).
- **F21** — Texte du pied de page → « FREEFLO libère les places de cours de sport invendues près de chez vous. Plus l'heure approche, plus le prix fond. Réservez en dernière minute, et profitez-en ! »
- **F22** — Fond du pied de page : remplacer le gris anthracite par **le rouge** (le même que le reste).
- **F23** — Supprimer le lien « Tarifs & commission ».
- **F24** — « Il ne se passe rien quand je clique sur CGU/CGV et Confidentialité » → leur donner de vraies destinations.

### p.12 — Bandeau « RÉSERVEZ MAINTENANT » (accueil)
- **F25** — Les 4 cartes doivent **remplir la largeur de la page**, 1 cm de marge de chaque côté.
- **F26** — Changer le format des cartes : **plus larges et moins hautes**.
- **F27** — Le libellé « Réserver maintenant · 22,75 € » doit **tenir sur une ligne**.
- **F28** — Le **nouveau prix passe en jaune**, exactement comme le Canva.
- **F29** — **Remettre les anciennes photos** (« les miennes font cheap »).

### p.13–15 — Fiche offre `/offres/[id]`
- **F30** — Supprimer le format actuel, adopter la disposition de la maquette cliente (p.14–15) — mais **fond blanc** et **Inter**.
- **F31** — Enlever « À vous le summer body » du titre → **« Pilates Reformer »**.
- **F32** — Remplacer le fond beige par le **blanc du pantone Canva**.
- **F33** — « avec Camille » → **« Professeure : Camille »**.
- **F34** — Remplacer la pastille bordeaux « −35 % en ce moment » par le **nombre de places restantes** (« 2 places restantes »). **Ne jamais mettre le taux de réduction.**
- **F35** — Enlever « · 15e · 0.8 km » de la ligne d'en-tête.
- **F36** — Carte de réservation bas de page : fond bordeaux, prix en **jaune** (`15.50 €`) + prix plein barré, ligne « Il ne te reste plus que 2 places vacantes pour ce cours ! », catégorie + note, nom du centre + ville + distance, bouton **jaune** « Réserver la place », lien souligné « Consulter nos autres offres de cours ».

### p.16 — `/offres`
- **F37** — Remplacer les listes déroulantes par des **cases ovales**, comme les puces « Dernière chance » en dessous (« celles-ci font trop old school »).
- **F38** — Bien mettre la case **« Activez la géolocalisation »** et ajouter **tous les arrondissements**.
- **F39** — Sous-titre → « Faites du sport à des prix imbattables. » / « Réservez votre cours dès maintenant, les places n'attendent pas ! »
- **F40** — La rubrique « Rechercher ici » **ne fonctionne pas** → à faire fonctionner.

### p.17 — Offres similaires
- **F41** — Titre « D'autres cours qui partent » → **« D'autres créneaux à saisir »**.
- **F42** — Prix en **gras et bordeaux**.

### p.18 — Détails
- **F43** — À la sélection de texte, remplacer le surlignage gris anthracite par **le jaune du pantone**.
- **F44** — Mentions légales : enlever les tirets.
- **F45** — Mentions légales : enlever « (25 % au plein tarif, jusqu'à 8 % en sprint final). »

### p.20 — `/inscrire-son-centre`, héros
- **F46** — Illisible : remplacer le texte gris anthracite par du **blanc cassé**, et le rouge de « Changez ça. » par le **jaune du pantone**.

### p.21 — `/inscrire-son-centre`, formulaire
- **F47** — Bloc formulaire : **fond rouge, écriture blanche**, bouton « Continuer » en **jaune**, lien « connectez-vous » en **jaune**.
- **F48** — Garder le sous-titre mais ajouter : « Inscrivez votre centre de sport en quelques minutes et remplissez vos heures creuses dès aujourd'hui ! »
- **F49** — Supprimer la statistique **« −60 % jusqu'à, en sprint final »** (garder 2 min / 0 € / 24 h).

### p.22 — Nouvelle page à créer
- **F50** — Créer une page **« Inscrire votre centre de sport »** :
  - Titre : « Inscrivez votre centre de sport. »
  - Texte : « Inscrivez votre centre de sport en quelques minutes et remplissez vos heures creuses dès aujourd'hui ! »
  - Un champ de recherche « Rechercher le nom du commerce ».
  - Fond rouge, écriture blanche, bouton « Continuer » en jaune, « Connectez-vous » en jaune.
  - Ajouter les liens **politique de confidentialité** et **conditions générales d'utilisation**.
  - Aujourd'hui, l'entrée de menu redirige directement vers la page d'accueil de chaque centre → elle doit mener à cette page.

### p.23–24 — Espace pro, tableau de bord
- **F51** — Supprimer l'alerte « Sprint final · … à **−60 %** ».
- **F52** — Supprimer les KPI de revenus et le graphique « Revenus des 7 derniers jours ».
- **F53** — Supprimer la carte noire « Prochain virement » (ventes du jour / commission FREEFLO / net à recevoir).
- **F54** — Supprimer le panneau « Commission dégressive » (INFO PRIVÉE).
- **F55** — Conservés : « Créneaux du jour », « En ce moment », « Derniers virements ».

### p.25 — Espace pro, Planning
- **F56** — Deux boutons font la même chose (« Créer une offre » et « Publier un cours ») → n'en garder qu'un.

### p.26 — Modale « Publier un cours »
- **F57** — Fond → le **bordeaux** utilisé ailleurs, **légèrement transparent**.
- **F58** — Bouton « Publier » en **jaune**.
- **F59** — Astérisque des champs obligatoires en **jaune**.
- **F60** — Texte en **blanc**.
- **F61** — Ajouter un champ **« Description » (facultative)**.
- **F62** — Ajouter un champ **« chaussettes antidérapantes obligatoires » oui/non**, affiché **uniquement pour Pilates et Yoga**.
- **F63** — Moderniser la rubrique « Activité » (« ça fait très ancien ») : bords arrondis comme le reste.
- **F64** — « Places » → **« Places libres »**.
- **F65** — « Prix plein » → **« Tarif plein »**.
- **F66** — « Professeur » → **« Professeur(e) »**.
- **F67** — Photo du professeur : ajouter une case pour **glisser ou télécharger** la photo.
- **F68** — Titre : « Inscrivez votre centre de sport. » → *voir question ouverte Q4.*

### p.27 — Espace pro, Mes offres
- **F69** — Enlever le bouton **play/pause**.
- **F70** — Le bouton **« Modifier » ne fonctionne pas** → le faire fonctionner.

### p.28 — Espace pro, tiroir « Créer une offre »
- **F71** — Remplacer le fond beige par le **blanc du Canva**.
- **F72** — Moderniser les cases « Catégorie » et « Créneau ».
- **F73** — Les espacements entre les lettres de « N O U V E L L E   O F F R E » sont « très Claude coded » → à enlever.
- **F74** — La courbe « Votre prix fondra ainsi » + l'échelle de commission → **INFO PRIVÉE**, à supprimer.

### p.29–30 — Espace pro, Statistiques
- **F75** — Reprendre la page statistiques du Canva : « il y a trop d'informations privées et désincitatives sur cette page ». À supprimer :
  - « Valeur récupérée ce mois » (2 430 €, places sauvées/perdues) ;
  - « À quel prix vos places partent-elles ? » (remise moyenne −34 %, répartition par palier) ;
  - la légende « Le soir en semaine part le plus vite… ».
  À conserver : taux de remplissage, nouveaux clients, « D'où viennent-ils ? », grille des heures chaudes.

### p.31 — Espace pro, Paramètres
- **F76** — Ajouter **tout en haut** une rubrique **photo, horizontale**, pour la devanture du centre : glisser ou télécharger une photo, **comme LinkedIn**.

### p.32 — Questions pratiques
- **Q1→Q11** — 11 questions techniques : réponse écrite, pas de code. Réponses proposées en §5.

---

## 2. Ce que ça donne comme travail

### Lot A — Fondations de charte *(touche tout le site, à faire en premier)*

| Tâche | Fichiers | Couvre |
|---|---|---|
| Passer à **Inter** (300 corps / 700 titres), retirer Instrument Serif, remplacer `.serif-display` / `.serif-em` par des utilitaires Inter | `app/layout.tsx`, `app/globals.css` + les 14 fichiers utilisant `serif-*` | F6 |
| Neutraliser `.eyebrow` (plus de `letter-spacing: 0.24em`) et purger les `tracking-*` sur capitales | `globals.css`, 26 usages de `.eyebrow`, 5 de `tracking-*` | F8, F73 |
| Purge typographique : 60 tirets cadratins et ~45 points médians décoratifs | 33 fichiers (`.ts`/`.tsx`) | F7, F44 |
| Ajouter les tokens `--pantone-white` et `--pantone-yellow` prélevés sur le Canva ; corriger `::selection` (aujourd'hui `background: var(--ink)` avec un `var(--bone)` inexistant) | `globals.css` | F43, R4 |
| Bibliothèque de contrôles « ovale » (chips/pills) réutilisable, pour remplacer les `<select>` natifs | nouveau `components/ui/pill-select.tsx` | F37, F63, F72 |

### Lot B — Suppressions « info privée » *(gros gain, faible risque)*

| Tâche | Fichiers |
|---|---|
| Supprimer la section mécanique + la courbe de fonte | `sections/mechanic.tsx`, `melt-curve.tsx` (deviennent morts), `comment-ca-marche/page.tsx` |
| Supprimer le bloc centre de l'accueil | `sections/vendor-cta.tsx`, `app/page.tsx` |
| Supprimer la grille de commission | `inscrire-son-centre/page.tsx` |
| Supprimer alerte sprint, KPI revenus, graphique, carte virement, panneau commission | `vendor/overview-tab.tsx` |
| Supprimer courbe + échelle commission du tiroir | `vendor/create-offer-drawer.tsx` |
| Élaguer la page statistiques | `vendor/stats-tab.tsx`, `vendor/vendor-data.ts` |
| Retirer « −60 % » des stats et des libellés prix plancher | `lib/site.ts`, `vendor/settings-tab.tsx` |
| Retirer « (25 % au plein tarif…) » | `mentions-legales/page.tsx` |
| Retirer la mention Treatwell | `lib/site.ts` |
| **Vérification finale** : `grep -rn "discountPct\|commissionPct\|remise\|−[0-9]*%"` ne doit plus rien retourner en rendu | tout `src/` |

*Couvre F2, F3, F4, F19, F45, F49, F51, F52, F53, F54, F74, F75 + R1.*

### Lot C — Contenu & copie

Barème simple, presque tout dans `lib/site.ts` : F14, F15, F17, F18, F20, F21, F23, F31, F33, F35, F39, F41, F48, F64, F65, F66.
Un point d'attention : F20 (« FONCTIONNE ») change aussi le libellé du pied de page et le titre de page ; la **route** `/comment-ca-marche` peut rester (avec redirection si on la renomme).

### Lot D — Chrome du site

| Tâche | Fichier | Couvre |
|---|---|---|
| Nav alignée à droite + entrée « Inscrire mon centre » après « Espace pro » | `site-header.tsx` | F12, F13 |
| Pied de page rouge, nouveau texte, lien « Tarifs & commission » retiré, liens légaux fonctionnels | `site-footer.tsx` | F21, F22, F23 |
| Séparer le légal en trois destinations réelles : `/mentions-legales`, `/cgu-cgv`, `/confidentialite` | nouvelles routes | F24 |
| Héros de page lisibles (blanc cassé + accent jaune) | `page-hero.tsx`, `qui-sommes-nous`, `inscrire-son-centre` | F16, F46 |

### Lot E — Parcours sportif

| Tâche | Fichier | Couvre |
|---|---|---|
| Cartes d'offre : pleine largeur (marge 1 cm), format plus large/moins haut, prix remisé en **jaune**, libellé du bouton sur une ligne | `offer-card.tsx`, `sections/live-offers.tsx` | F25, F26, F27, F28 |
| Restaurer les anciennes photos (récupérables dans git, commits `f9cee9e^` / `e0ed277^` : identifiants Unsplash + helper `U()` ; `next.config.ts` autorise déjà `images.unsplash.com`) | `lib/site.ts` | F29 |
| **Refonte de la fiche offre** selon la maquette p.14–15 : fond blanc, bandeau « N places restantes » à la place du taux, « Professeure : », ligne d'en-tête épurée, carte bordeaux de réservation avec prix jaune et lien « Consulter nos autres offres de cours » | `offers/offer-detail.tsx` (réécriture) | F30–F36 |
| Bloc similaires : titre + prix bordeaux gras | `offer-detail.tsx`, variante de `offer-card.tsx` | F41, F42 |
| Filtres `/offres` : pills ovales, géolocalisation, tous les arrondissements, **recherche réellement fonctionnelle** (champ texte + filtrage), nouveau sous-titre | `offers/offers-explorer.tsx`, `app/offres/page.tsx` | F37, F38, F39, F40 |

*Note : le bouton « Rechercher ici » **remet aujourd'hui les filtres à zéro** — d'où l'impression qu'il ne fait rien. Il devient une vraie recherche.*

### Lot F — Espace pro

| Tâche | Fichier | Couvre |
|---|---|---|
| Planning : un seul CTA | `vendor/planning-tab.tsx` | F56 |
| Modale « Publier un cours » : fond bordeaux translucide, texte blanc, bouton et astérisque jaunes, selects arrondis, champs Description + chaussettes antidérapantes (conditionnel Pilates/Yoga), upload photo du professeur, renommages | `vendor/planning-tab.tsx` | F57–F67 |
| Mes offres : play/pause retiré, **Modifier fonctionnel** (rouvre la modale préremplie) | `vendor/offers-tab.tsx`, `vendor/vendor-dashboard.tsx` | F69, F70 |
| Tiroir « Créer une offre » : fond blanc, selects modernisés, interlettrage retiré | `vendor/create-offer-drawer.tsx` | F71, F72, F73 |
| Paramètres : bandeau photo de devanture en haut (glisser-déposer, style LinkedIn) | `vendor/settings-tab.tsx` + nouveau `components/ui/photo-drop.tsx` | F76 |

*Le composant `photo-drop` sert deux fois (F67 et F76) — à écrire une seule fois.*

### Lot G — Nouvelle page « Inscrire votre centre de sport » (F50)

Nouvelle route `/inscrire-votre-centre` : fond rouge, titre + texte imposés, champ « Rechercher le nom du commerce », bouton « Continuer » jaune, « Connectez-vous » jaune, liens confidentialité + CGU. Le point de menu de F13 pointe dessus.
Et sur `/inscrire-son-centre` : le panneau `VendorSignup` passe en fond rouge / texte blanc / bouton jaune (F47) avec le texte ajouté (F48).

### Lot H — Anglais réel (F9)

C'est le poste le plus lourd et il est **structurel**, pas cosmétique.
État actuel : `useT()` n'est câblé que dans **7 composants sur ~35**. Tout le reste — `/qui-sommes-nous`, `/comment-ca-marche`, `/inscrire-son-centre`, `/mentions-legales`, la fiche offre, l'intégralité de l'espace pro, les métadonnées SEO — est en dur en français. Passer en EN ne change donc presque rien à l'écran, ce que le client constate.

Deux options :

- **H1 — dictionnaire + frontière client** *(≈ 2 j)* : sortir les chaînes dans `lib/copy.ts` (`{ fr, en }`), passer les pages concernées en composants clients ou pré-résoudre la copie côté serveur. Aucune URL ne change, pas de SEO EN.
- **H2 — routage `/[locale]`** *(≈ 4 j)* : `/fr/...` et `/en/...`, métadonnées et sitemap par langue, vrai SEO bilingue. Plus propre, mais casse les URLs actuelles (redirections à prévoir).

**Recommandation : H1** pour ce cycle de retours, H2 si l'anglais devient un marché réel. Dans les deux cas il faut la **traduction cliente** des textes (à ce jour seuls l'accueil et les filtres ont une version EN).

### Lot I — Fluidité (F1, F10) — FAIT

**Relevé sur microsoft.ai le 07/08/2026** (styles calculés, pas à l'œil) : une seule
courbe partout, `cubic-bezier(0.43, 0.195, 0.02, 1)` ; des durées longues (0,6 s pour
l'opacité, 0,8 s pour les révélations, 1,3 s pour opacité + translation) ; un décalage
de **0,07 s** entre éléments ; des translations de **26 à 57 px** ; `opacity`,
`transform` et `clip-path` ; le tout piloté par IntersectionObserver (classes
`in-view` / `fade-in`), pas par scroll-timeline.

Ces trois valeurs sont désormais des tokens : `--ease-flo`, `--dur-flo`,
`--stagger-flo`. Appliqué :
- révélations au défilement **par lignes de texte**, décalées, courbe d'accélération douce (le `Reveal` + `.rise` actuels sont trop binaires) ;
- **apparition de la carte** traitée comme un moment : entrée en fondu + échelle, pins qui se posent en cascade (c'est l'exemple donné explicitement) ;
- transitions de page, en-tête qui se condense, parallaxe légère sur le héros ;
- garder l'interdit connu du projet : **pas de `gsap.from()`** pour les entrées (StrictMode React 19 laisse les éléments à `opacity: 0`) — CSS + IntersectionObserver, ou GSAP en `.fromTo()` ;
- respecter `prefers-reduced-motion`.

---

## 3. Ordre d'exécution proposé

1. **Lot A** (charte) — tout le reste s'y appuie, et c'est ce qui « dé-Claudise » le site le plus vite.
2. **Lot B** (suppressions) — le site rétrécit, les lots suivants portent sur moins de surface.
3. **Lot C + D** (copie, en-tête, pied de page, légal).
4. **Lot E** (parcours sportif) — le plus visible pour le client.
5. **Lot F + G** (espace pro, nouvelle page d'inscription).
6. **Lot I** (fluidité) — après stabilisation de la mise en page, sinon on anime deux fois.
7. **Lot H** (anglais) — en dernier, quand la copie FR est figée : traduire avant serait à refaire.

Contrôles à chaque lot : `npm test` (moteur de prix, 20 tests), `npm run build`, puis relecture visuelle.

---

## 4. Questions ouvertes / points bloquants

| # | Question | Impact |
|---|---|---|
| ~~Q1~~ | **RÉSOLU le 07/08/2026.** Le Canva est en ligne ; les styles calculés ont été relevés directement dessus. **Blanc pantone = `#ffffff`. Jaune du prix = `#f4d26e` (= notre `--gold`). Jaune des boutons = `#ffde59`. Rouge = `#a51c1e`. Bordeaux = `#800101`.** Les tokens `--brand-deep` et `--gold-bright` ont été corrigés en conséquence. | F28, F32, F36, F43, F46, F47, F58, F59, F71 |
| **Q2** | **Anglais : RÉSOLU.** Option **H1** retenue (dictionnaire co-localisé, URLs inchangées), traduction produite par le studio. Reste à faire relire par la cliente : c'est de la copie commerciale. **Limite assumée de H1 : les métadonnées SEO (`<title>`, `description`) restent en français**, elles ne peuvent pas suivre le sélecteur sans routage `/fr` `/en`. À basculer en H2 si l'anglais devient un vrai marché. | F9 |
| **Q3** | **Le prix en jaune sur carte blanche est à 1,47:1 de contraste** (mesuré sur le rendu ; l'exigence WCAG AA pour du grand texte est 3:1). Sa maquette Canva fait exactement pareil : le « €20 » y est en `#f4d26e` sur blanc. **F28 a donc été appliqué à la lettre.** Sur la carte bordeaux de la fiche offre (F36), le même jaune passe très bien. Si le prix lui paraît trop pâle sur les cartes blanches, un mot suffit : on passe à `--gold-deep #9a6c12`, qui reste doré mais se lit. | F28, accessibilité |
| **Q4** | **p.26 : le titre de la modale « Publier un cours » devient « Inscrivez votre centre de sport. » ?** Cela paraît être un copier-coller de la consigne p.22. **Décision appliquée : le titre reste « Publier un cours »** (et « Modifier le cours » en édition). À confirmer. | F68 |
| **Q5** | **« Remets les anciennes photos »** : je restaure les visuels Unsplash d'avant le passage aux photos Canva (récupérables dans git). La **vidéo** du héros, elle, reste celle du client (F5 dit « bannière, couleurs, vidéos » du Canva). Confirmer. | F29 |
| **Q6** | **Supprimer toute la pédagogie de la dégressivité** (F2, F4, F74) retire l'argument qui explique *pourquoi* un centre a intérêt à lister jusqu'au bout. La page `/inscrire-son-centre` se retrouve à promettre un bénéfice sans le démontrer. C'est leur décision — je l'applique — mais il faut assumer qu'il faudra vendre ça en rendez-vous plutôt que sur le site. | F2, F4, F74, conversion |
| **Q7** | **F50 mentionne « ça nous redirige vers la page d'accueil de chaque centre »** — comportement introuvable dans le code. **Résolu par construction :** la nouvelle page `/inscription-centre` est désormais la destination de « Inscrire mon centre » (en-tête et pied de page), et `/inscrire-son-centre` devient « Pourquoi FREEFLO », la page qui explique l'intérêt de rejoindre. | F50 |
| **Q8** | **Inter Light (300) en corps de texte** sous 16 px devient pâle et fatigant, surtout en blanc sur rouge. Je propose Light pour les grands paragraphes et Regular (400) sous 16 px. | F6 |

Deux anomalies repérées au passage, hors retour client :
- un avis de démonstration mentionne encore « accueil au QR nickel » alors que le QR code a été abandonné (`vendor/vendor-data.ts`) ;
- `::selection` référence `var(--bone)`, une variable qui n'existe plus — d'où le surlignage gris de F43.

---

## 5. Réponses aux 11 questions pratiques (p.32)

Réponses courtes ; le détail est dans `docs/ARCHITECTURE.md` (phase 2).

1. **Connecter les EDT des centres Pilates** — oui, on démarre en **manuel** : le centre publie ses créneaux depuis le tableau de bord (Planning / Publier un cours). Les connecteurs vers les logiciels de planning (Deciplus, Resamania, Mindbody…) et l'import iCal viennent après, une fois qu'on sait quels logiciels vos premiers centres utilisent.
2. **Ajouter des centres au fur et à mesure** — oui. Chaque centre s'inscrit lui-même, vous validez SIRET + IBAN, le compte s'active. Rien à redéployer.
3. **Apple Pay** — oui, natif avec Stripe (Payment Request Button), Apple Pay et Google Pay. À activer en phase 2, avec la vérification de domaine Apple.
4. **Notifications** — oui : e-mail (transactionnel), push web, et SMS pour les rappels critiques. Les préférences existent déjà côté espace pro.
5. **Prix dynamiques** — **recalculés en continu**, pas par cron toutes les 5 min : le prix est une fonction pure du temps restant et des places libres, calculée à l'affichage. Un cron ne sert qu'aux notifications de passage de palier. C'est ce que fait déjà `lib/pricing.ts`.
6. **Deux réservations simultanées sur la même place** — verrou transactionnel en base : décrément atomique du stock, le second paiement est refusé avant capture (jamais de surbooking). Détaillé en §5 de l'architecture.
7. **Prestataire de paiement** — **Stripe**, avec Stripe Connect pour reverser aux centres. Aucune donnée de carte ne transite par nos serveurs.
8. **Annulation** — **automatique** : remboursement intégral au-delà de 6 h avant le cours, rien à valider de votre part. Les annulations du fait du centre sont remboursées automatiquement aussi.
9. **RGPD** — oui : hébergement UE, consentement explicite, droits d'accès/rectification/effacement, géolocalisation non conservée sans consentement. Le texte définitif doit passer devant un juriste avant mise en production.
10. **Suivre les créneaux vendus / non vendus par centre** — oui, c'est déjà l'objet des onglets Statistiques et Mes offres, et un back-office admin agrège la vue multi-centres en phase 2. À noter : ce retour demande de **retirer** une partie de ces indicateurs de l'espace pro (F75) ; ils resteront visibles côté admin.
11. **Montée en charge** — oui. Le moteur de prix est une fonction pure (aucune écriture en base, donc pas de point de contention), le rendu est statique/incrémental et servi par le CDN Vercel, la recherche géographique s'appuie sur PostGIS avec index spatial. Le pic du soir est un pic de **lecture**, le cas le plus facile à absorber.

---

*Document produit le 07/08/2026 par le studio Orvane, à partir de `feedback site.pdf`.*
