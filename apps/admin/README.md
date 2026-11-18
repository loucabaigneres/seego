# @seego/admin

Back-office Seego, réservé aux comptes Better Auth qui ont le rôle `admin`. Pour l'instant, il liste les inscrits de la waitlist (`waitlist_leads`), avec une recherche par e-mail, un filtre de statut et une pagination côté serveur.

Stack : Vite + React 19, TanStack Router (routes dans `src/app/routes`, `routeTree.gen.ts` est généré), tRPC (`@trpc/tanstack-react-query`), TanStack Table v9, [shadcn/ui](https://ui.shadcn.com) (Base UI) et Tailwind v4 avec les tokens de `@seego/ui/css`.

## shadcn/ui

- `src/components/ui/*` est généré par le CLI (config dans `components.json`). Pour ajouter un composant : `pnpm dlx shadcn@latest add <nom>`, depuis `apps/admin`. On peut retoucher ces fichiers, c'est le principe de shadcn, mais pense à le noter si tu le fais.
- Thème : dans `src/index.css`, les variables shadcn (`primary`, `muted-foreground`, `border`, `input`, `ring`…) pointent vers les tokens `@seego/ui`. Il ne faut pas les remplacer par des couleurs en dur. Exception : `accent` suit la sémantique shadcn (surface) ; pour l'albicocca, utilise `cta`.
- Tableaux : `src/components/data-table/` (`DataTable` générique paginé côté serveur, `DataTablePagination`) suit le [guide Data Table](https://ui.shadcn.com/docs/components/base/data-table). Pour une nouvelle liste, il suffit d'un fichier de colonnes (`createColumnHelper<DataTableFeatures, T>()`) et d'un hook qui gère la pagination et la requête tRPC (voir `src/features/waitlist`).

## Lancer en local

```bash
cp apps/admin/.env.example apps/admin/.env
docker-compose up -d                         # Postgres + API sur :3000
pnpm turbo run dev --filter=@seego/admin     # http://localhost:5175
```

## Créer un administrateur

1. Crée un compte depuis `apps/web` (`/register`) et vérifie l'e-mail avec le code OTP.
2. Donne-lui le rôle admin (en utilisant le `.env` de `packages/database`) :

```bash
pnpm --filter @seego/database db:promote-admin prenom@seego.fr
pnpm --filter @seego/database db:promote-admin prenom@seego.fr --revoke   # retour à 'traveler'
```

Le changement s'applique dès la requête suivante, car il n'y a pas de cache de session.

## Sécurité

- Côté API, les procédures `admin.*` utilisent `adminProcedure` (`apps/api/src/trpc/init.ts`) : `UNAUTHORIZED` sans session, `FORBIDDEN` si le rôle n'est pas `admin`.
- Côté front, le layout `_authed.tsx` et la page de login ne servent qu'à l'UX : un compte non admin est déconnecté juste après sa connexion.
- Le plugin admin de Better Auth (`apps/api/src/lib/auth.ts`) expose aussi `authClient.admin.*` (listUsers, setRole, banUser…), pour les prochaines fonctionnalités.

## À venir

Projet Vercel, proxy `api/[...path].ts` (cookie first-party, comme `apps/web`), CI/CD, ajout du domaine de prod dans le CORS et dans `trustedOrigins`, puis Google OAuth.
