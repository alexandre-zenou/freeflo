# FREEFLO — mise en ligne & reprise du projet

Ce document permet de déployer le site sur **un compte Vercel neuf**, sans dépendre
du compte utilisé pour la démo.

## 1. Ce qu'il y a à reprendre

| Élément | Où | À migrer ? |
|---|---|---|
| Code source | `github.com/alexandre-zenou/freeflo` (privé) | ne bouge pas, c'est la source de vérité |
| Hébergement | Vercel | **oui** : nouveau projet sur le compte cible |
| Variables d'environnement | `STRIPE_SECRET_KEY` | **oui**, voir §2.1 |
| Domaines personnalisés | `freeflo.fr` chez IONOS, déjà pointé sur Vercel | déjà fait, voir §3 |
| Compte Vercel | compte dédié **freeflo** | ce n'est PLUS l'équipe oravane (bascule 08/2026) |
| Base de données | — | rien, la démo n'a pas de base |
| Paiements | Stripe, **clés de test** | la clé se ressaisit dans le nouveau projet |

Le contenu vit dans `src/lib/site.ts` et les prix sont calculés par
`src/lib/pricing.ts`. Aucune donnée personnelle, rien à sauvegarder avant la bascule.

Le site n'est **plus entièrement statique** depuis 08/2026 : `src/app/api/paiement/`
ouvre une session Stripe Checkout, et c'est la seule partie qui s'exécute côté serveur.
Vercel doit donc construire le projet en **Next.js**, pas en export statique. C'est le
défaut, il n'y a rien à régler, mais un `output: "export"` ajouté par mégarde ferait
disparaître la route et le paiement retomberait en silence sur le tunnel simulé.

## 2. Déployer sur le nouveau compte

1. Se connecter au compte Vercel cible.
2. **Add New → Project → Import Git Repository**, choisir `alexandre-zenou/freeflo`.
   Le dépôt étant **privé**, autoriser l'app GitHub de Vercel à y accéder au moment
   de l'import (bouton *Configure GitHub App* → cocher le dépôt).
3. Laisser les réglages par défaut : Vercel détecte **Next.js**, build `next build`,
   Node 24.x.
4. Saisir la variable d'environnement de §2.1 **avant** le premier déploiement.
5. **Deploy**. Le premier build prend ~1 min et fournit une URL `*.vercel.app`.

### 2.1 Variable d'environnement

Une seule, **Settings → Environment Variables**, cochée pour Production, Preview et
Development :

| Nom | Valeur | Où la trouver |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` | Stripe → mode Test → Développeurs → Clés d'API |

Elle ne porte PAS le préfixe `NEXT_PUBLIC_` : c'est une clé secrète, elle ne doit
jamais atteindre le navigateur. Elle n'est lue que par `src/app/api/paiement/`.

**Le code refuse une clé de production (`sk_live_`)** et répond 503 : cette maquette
n'a ni stock réel ni reversement aux centres, elle n'a rien à encaisser pour de vrai
(voir `src/lib/stripe.ts`). Sans variable du tout, la route répond aussi 503 et le
site retombe sur le tunnel de paiement simulé, sans rien signaler au visiteur.

À partir de là, chaque `git push` sur `main` redéploie automatiquement.

### Piège connu — l'auteur du commit

Vercel refuse de déployer si l'adresse e-mail de l'auteur du commit n'est associée à
aucun compte GitHub. Vérifier dans le dépôt :

```bash
git config user.email
```

Elle doit correspondre à une adresse déclarée sur GitHub (ex. l'adresse
`…@users.noreply.github.com` du compte). Sinon le push part mais le déploiement est bloqué.

## 3. Le domaine

**C'est déjà fait** (relevé le 27/08/2026). `freeflo.fr` est chez **IONOS** (serveurs
de noms `ui-dns`) et pointe sur Vercel :

| Enregistrement | Valeur |
|---|---|
| `@` (apex) | **A** → `216.198.79.1` |
| `www` | **CNAME** → `…​.vercel-dns-017.com` |

`https://freeflo.fr` redirige en 308 vers `https://www.freeflo.fr`, qui répond en 200
sous certificat valide. Le code est configuré pour ce domaine (`site.domain` dans
`src/lib/site.ts`, qui sert les métadonnées Open Graph et l'URL canonique).

**Le domaine reste attaché au PROJET Vercel, pas au dépôt Git.** Rebrancher le projet
sur un autre dépôt ne touche donc ni le domaine ni les DNS : c'est Settings → Git →
Disconnect, puis Connect. En revanche, créer un projet Vercel *neuf* oblige à
détacher le domaine de l'ancien avant de l'ajouter au nouveau, Vercel refusant qu'un
domaine serve deux projets.

### Si le domaine devait être refait de zéro

1. Vercel → projet → **Settings → Domains → Add** → `freeflo.fr`.
2. Chez le registrar (**IONOS**, d'après les serveurs de noms `ui-dns`), créer les
   enregistrements **tels que Vercel les affiche dans l'onglet DNS Records** — ne pas
   recopier des valeurs trouvées ailleurs, Vercel a changé d'IP par le passé.
   Au 27/08/2026 Vercel demande : apex `@` → **A** vers `216.198.79.1`
   (et non plus `76.76.21.21`, valeur historique qui traînait dans ce document).
   Le sous-domaine `www` a sa propre ligne dans la liste des domaines, avec son
   propre enregistrement à créer.
3. **Supprimer d'abord l'enregistrement A de parking d'IONOS** (`217.160.0.227` au
   moment de la bascule) : deux A concurrents sur `@` font échouer la vérification.
4. Le certificat HTTPS est émis automatiquement une fois la propagation faite. Cliquer
   **Refresh** sur la ligne du domaine dans Vercel pour forcer la revérification.

Si le domaine retenu n'est pas `freeflo.fr`, mettre à jour `site.domain` dans
`src/lib/site.ts` **avant** la mise en production, sinon les balises canoniques et
les partages sociaux pointeront vers le mauvais domaine.

## 4. À trancher avant publication

- **Mentions « Démo studio Orvane »** dans le pied de page (`src/components/site-footer.tsx`)
  et les mentions légales (`src/app/mentions-legales/page.tsx`) : à retirer ou à
  transformer en crédit studio selon l'accord commercial.
- **Mentions légales** : raison sociale, SIRET, siège, hébergeur et texte CGU/CGV
  définitifs restent à faire valider par un juriste.
- **Contenu de démonstration** : centres, offres, avis, statistiques de l'espace pro
  sont fictifs (`src/lib/site.ts`, `src/components/vendor/vendor-data.ts`).
- **Copie anglaise** : le site est intégralement bilingue depuis 08/2026, espace pro
  compris. La traduction a été produite par le studio : à faire relire par la cliente
  avant publication, c'est de la copie commerciale. Limite connue : les métadonnées SEO
  (`<title>`, `description`) restent en français.

## 5. Reprendre le domaine d'un autre compte Vercel

Situation rencontrée le 27/08/2026 : le domaine servait un projet Vercel qui n'était
pas le nôtre, construit depuis un dépôt tiers resté 13 commits en arrière.

**Détenir le registrar suffit.** Le domaine est chez IONOS ; qui contrôle la zone DNS
contrôle le domaine, quel que soit le compte Vercel qui l'affiche aujourd'hui. Il n'y
a aucun « transfert de domaine » à demander, et surtout pas de transfert de registrar,
qui prendrait cinq jours et bloquerait le nom pendant soixante.

1. Créer le projet sur le compte cible (§2) et le déployer. Il sort sur une URL
   `*.vercel.app`, sans toucher au domaine.
2. **Settings → Domains → Add → `freeflo.fr`.** Vercel voit que le domaine est pris
   par un autre projet et propose de **vérifier la propriété**.
3. Il donne un enregistrement **TXT `_vercel`** à créer dans la zone IONOS. Une fois
   propagé, Vercel détache le domaine de l'ancien projet et l'attache au nôtre.
4. Ajouter aussi `www.freeflo.fr` : c'est une ligne distincte, avec son propre
   enregistrement.
5. Les A et CNAME de §3 restent valables, ils pointent la plateforme et non un projet
   précis. Rien à changer chez IONOS au-delà du TXT.

Le certificat est réémis automatiquement. Compter quelques minutes de propagation.

## 6. Vérifications après bascule

```bash
for u in / /offres /panier /compte /mes-cours /pro; do
  curl -o /dev/null -s -w "$u %{http_code}\n" "https://<nouvelle-url>$u"
done
curl -s -X POST https://<nouvelle-url>/api/paiement \
  -H 'Content-Type: application/json' \
  -d '{"lignes":[{"offerId":"hot-yoga-marais","price":14}]}'
```

Tout doit répondre 200, et la dernière commande renvoyer une `url` `checkout.stripe.com`.
Un `503` signifie que `STRIPE_SECRET_KEY` manque (§2.1) ; un `404` que le projet
construit le mauvais dépôt, ou en export statique.

Contrôler ensuite à l'œil : la vidéo du héros démarre, la carte affiche ses pastilles
de prix, choisir un jour au calendrier de `/offres` ne laisse que les créneaux de ce
jour sur la carte, et l'espace pro s'ouvre avec le compte d'un centre.
