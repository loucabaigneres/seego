# Seego - Admin

Back-office Seego, réservé aux comptes Better Auth qui ont le rôle `admin`. Pages actuelles :

- **Waitlist** (`/waitlist`) : les inscrits de la waitlist (`waitlist_leads`), avec recherche par e-mail, filtre de statut et pagination côté serveur.
- **Administrateurs** (`/admins`) : liste des admins, ajout / retrait du rôle et historique des changements (voir [Créer un administrateur](#créer-un-administrateur)).

Stack : Vite + React 19, TanStack Router (routes dans `src/app/routes`, `routeTree.gen.ts` est généré), tRPC (`@trpc/tanstack-react-query`), TanStack Table v9, [shadcn/ui](https://ui.shadcn.com) (Base UI) et Tailwind v4 avec les tokens de `@seego/ui/css`.

## Organisation

```
src/
  app/routes/     __root, login, _authed (layout gardé) et ses pages : index, waitlist, admins
  features/       auth, waitlist, admins (components / hooks / lib), mêmes règles que web
  components/     ui/ (généré par shadcn), data-table/, QueryState
  hooks/, lib/, config/   code partagé (client tRPC, Better Auth, env, `cn`)
```

Les frontières **shared → features → app** sont vérifiées par ESLint (`featureBoundaries`), comme sur web et mobile.

| Script      | Rôle                              |
| ----------- | --------------------------------- |
| `dev`       | Vite sur http://localhost:5175    |
| `build`     | `tsc -b` puis build de production |
| `typecheck` | `tsc -b`                          |
| `lint`      | ESLint                            |
| `preview`   | Prévisualise le build             |

Pas de tests pour l'instant.

## shadcn/ui

- `src/components/ui/*` est généré par le CLI (config dans `components.json`, style `base-nova`). Pour ajouter un composant : `pnpm dlx shadcn@latest add <nom>`, depuis `apps/admin` (ou `-c apps/admin` depuis la racine). On peut retoucher ces fichiers, c'est le principe de shadcn, mais pense à le noter si tu le fais.
- Thème : dans `src/index.css`, on suit la convention shadcn (variables de rôle dans `:root`, enregistrées dans `@theme inline`), et ces variables pointent vers les tokens `@seego/ui`. Pas de couleur en dur. `accent` suit la sémantique shadcn (surface) ; pour l'albicocca, utilise `cta`. Les statuts positifs utilisent `<Badge variant="success">`. Il n'y a ni ombres ni mode sombre (`dark:` ne s'active que sous une classe `.dark`).
- Typographie : pour les titres de page, utilise les utilitaires `type-title` / `type-section` / `type-label` plutôt que `text-<taille>` (que `cn()` confond avec une couleur), et ne surcharge pas la typographie des composants via `className`.
- Règles du skill shadcn (`.agents/skills/shadcn`) : formulaires en `FieldGroup` + `Field`, champ avec icône en `InputGroup`, `SelectItem` dans un `SelectGroup`, `Spinner` + `data-icon` pour les boutons en chargement, `Empty` / `Alert` pour les états vides ou d'erreur.
- Tableaux : `src/components/data-table/` (`DataTable` générique paginé côté serveur, `DataTablePagination`) suit le [guide Data Table](https://ui.shadcn.com/docs/components/base/data-table). Pour une nouvelle liste, il suffit d'un fichier de colonnes (`createColumnHelper<DataTableFeatures, T>()`) et d'un hook qui gère la pagination et la requête tRPC (voir `src/features/waitlist`).

## Lancer en local

```bash
cp apps/admin/.env.example apps/admin/.env
docker-compose up -d                         # Postgres + API sur :3000
pnpm turbo run dev --filter "@seego/admin"     # http://localhost:5175
```

## Créer un administrateur

La personne crée d'abord son compte depuis `apps/web` (`/register`) et vérifie son e-mail avec le code OTP. Ensuite :

**Depuis le back-office (normal)** — page **Administrateurs** (`/admins`), bouton « Ajouter un administrateur » :

1. Recherche par e-mail **exact** (pas de recherche partielle) : on voit le nom, la date de création, les méthodes de connexion et si l'e-mail est vérifié.
2. Confirmation : l'e-mail est **retapé à la main** (coller est désactivé) et l'admin redonne **son mot de passe**.

Côté API (`admin.admins.grant` / `revoke`, règles dans `apps/api/src/lib/adminRoles.ts`), tout est revérifié : mot de passe de l'admin (`auth.api.verifyPassword`), e-mail de confirmation identique à celui du compte, e-mail vérifié, compte non banni et pas déjà admin. Un retrait est refusé sur soi-même et ne peut jamais laisser zéro admin (lignes admin verrouillées dans la transaction). Chaque changement est inscrit dans `admin_role_events` (historique affiché sur la page) et notifié par e-mail au compte concerné et à tous les admins.

**Script (secours, si plus aucun admin ne peut se connecter)** — avec le `.env` de `packages/database` :

```bash
pnpm --filter "@seego/database" db:promote-admin prenom@seego.fr
pnpm --filter "@seego/database" db:promote-admin prenom@seego.fr --revoke   # retour à 'traveler'
```

Le script écrit aussi dans `admin_role_events` (sans auteur), mais n'envoie pas d'e-mail. Dans les deux cas, le changement s'applique dès la requête suivante, car il n'y a pas de cache de session.

## Sécurité

- Côté API, les procédures `admin.*` utilisent `adminProcedure` (`apps/api/src/trpc/init.ts`) : `UNAUTHORIZED` sans session, `FORBIDDEN` si le rôle n'est pas `admin`.
- Côté front, le layout `_authed.tsx` et la page de login ne servent qu'à l'UX : un compte non admin est déconnecté juste après sa connexion.
- Le plugin admin de Better Auth (`apps/api/src/lib/auth.ts`) expose aussi `authClient.admin.*` (listUsers, setRole, banUser…), pour les prochaines fonctionnalités.

## Déploiement

| Environnement | Branche   | URL                            |
| ------------- | --------- | ------------------------------ |
| Production    | `main`    | https://admin.seego.fr         |
| Staging       | `develop` | https://admin-staging.seego.fr |

- Projet Vercel `seego-admin` (Root Directory `apps/admin`, sans intégration Git), déployé par le job `deploy-admin` de `.github/workflows/cd.yml`, après l'API. Le secret GitHub est `VERCEL_PROJECT_ID_ADMIN`.
- En staging, la CI attache chaque déploiement de `develop` à `admin-staging.seego.fr` avec `vercel alias set`.
- Variables Vercel (Production et Preview) : `VITE_API_URL`, `VITE_USE_API_PROXY=true`, `API_PROXY_TARGET` (URL de l'API, sans slash final). Le navigateur appelle `/api/*` sur le domaine de l'admin, et `vercel.json` réécrit ces requêtes vers `api/proxy.ts`, qui relaie vers l'API : le cookie de session est donc first-party.
- `vercel.json` gère le rewrite de la SPA et les en-têtes de sécurité (`noindex`, CSP `'self'`, `X-Frame-Options: DENY`…). Si l'admin doit appeler un domaine externe, il faut l'ajouter à la CSP.
- DNS (GoDaddy) : CNAME `admin` et `admin-staging` vers la valeur affichée par Vercel.
- Domaines admin déclarés côté API : `trustedOrigins` (`apps/api/src/lib/auth.ts`) et CORS (`apps/api/src/index.ts`).
- Créer un admin en staging ou en prod : page Administrateurs du back-office ; en secours `DATABASE_URL=<url de la base> pnpm --filter @seego/database db:promote-admin <email>`.

## À venir

2FA pour les admins (plugin `twoFactor` de Better Auth), puis Google OAuth (URI de redirection `https://admin.seego.fr/api/auth/callback/google`).
