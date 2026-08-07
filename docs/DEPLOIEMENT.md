# FREEFLO — mise en ligne & reprise du projet

Ce document permet de déployer le site sur **un compte Vercel neuf**, sans dépendre
du compte utilisé pour la démo.

## 1. Ce qu'il y a à reprendre

| Élément | Où | À migrer ? |
|---|---|---|
| Code source | `github.com/haroldhks/freeflo` (privé) | ne bouge pas — c'est la source de vérité |
| Hébergement | Vercel | **oui** : nouveau projet sur le compte cible |
| Variables d'environnement | — | **aucune** à ce jour |
| Domaines personnalisés | — | **aucun** attaché pour l'instant |
| Compte Vercel | compte dédié **freeflo** | ce n'est PLUS l'équipe oravane (bascule 08/2026) |
| Base de données / paiements | — | rien : la démo n'a pas de backend |

Le site est une **démo statique** : tout le contenu vit dans `src/lib/site.ts`, les prix
sont calculés côté client par `src/lib/pricing.ts`. Aucun secret, aucune donnée
personnelle, rien à sauvegarder avant la bascule.

## 2. Déployer sur le nouveau compte

1. Se connecter au compte Vercel cible.
2. **Add New → Project → Import Git Repository**, choisir `haroldhks/freeflo`.
   Le dépôt étant **privé**, autoriser l'app GitHub de Vercel à y accéder au moment
   de l'import (bouton *Configure GitHub App* → cocher le dépôt).
3. Laisser les réglages par défaut : Vercel détecte **Next.js**, build `next build`,
   Node 24.x. Aucune variable d'environnement à saisir.
4. **Deploy**. Le premier build prend ~1 min et fournit une URL `*.vercel.app`.

À partir de là, chaque `git push` sur `main` redéploie automatiquement.

### Piège connu — l'auteur du commit

Vercel refuse de déployer si l'adresse e-mail de l'auteur du commit n'est associée à
aucun compte GitHub. Vérifier dans le dépôt :

```bash
git config user.email
```

Elle doit correspondre à une adresse déclarée sur GitHub (ex. l'adresse
`…@users.noreply.github.com` du compte). Sinon le push part mais le déploiement est bloqué.

## 3. Brancher le domaine définitif

Le site est déjà configuré pour `freeflo.fr` (`site.domain` dans `src/lib/site.ts`,
utilisé pour les métadonnées Open Graph et l'URL canonique).

1. Vercel → projet → **Settings → Domains → Add** → `freeflo.fr`.
2. Chez le registrar, créer les enregistrements indiqués par Vercel :
   - apex `freeflo.fr` → enregistrement **A** vers `76.76.21.21`
   - `www.freeflo.fr` → **CNAME** vers `cname.vercel-dns.com`
3. Le certificat HTTPS est émis automatiquement une fois la propagation faite.

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

## 5. Vérifications après bascule

```bash
curl -o /dev/null -s -w "%{http_code}\n" https://<nouvelle-url>/
curl -o /dev/null -s -w "%{http_code}\n" https://<nouvelle-url>/offres
curl -o /dev/null -s -w "%{http_code}\n" https://<nouvelle-url>/pro
```

Contrôler ensuite à l'œil : la vidéo du héros démarre, la carte affiche les pastilles
de prix et les repères jaunes, l'espace pro ouvre ses sept onglets.
