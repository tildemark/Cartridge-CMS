# Cartridge CMS — Agent Spec

## Project Overview
Cartridge CMS is a plug-and-play content management system for small businesses and general websites. It features a WordPress-like first-install wizard, a role-based access control system, a rich TipTap editor, and a plug-in/play theme engine.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **ORM**: Drizzle ORM
- **Database**: SQLite (via better-sqlite3)
- **Auth**: NextAuth.js v5 (credentials only)
- **Editor**: TipTap v3
- **Icons**: Lucide React

## Architecture Decisions
- **Database**: SQLite only for v1. PostgreSQL support to be added to setup wizard later.
- **Auth**: Username/password (bcrypt) only. No OAuth in v1.
- **Roles**: Full RBAC — roles table, permissions table, role_permissions junction table. Default roles: super_admin, admin, editor, author, viewer.
- **Theme format**: Local directory drop-in at `src/themes/[theme-name]/` with `theme.json` metadata.
- **Media storage**: Local filesystem at `public/uploads/`.
- **URL structure**: Posts → `/blog/[slug]`, Pages → `/[slug]`.

## Key File Locations
- Schema: `src/lib/db/schema.ts`
- DB client: `src/lib/db/index.ts`
- DB init: `src/lib/db/init.ts`
- DB settings: `src/lib/db/settings.ts`
- RBAC seed: `src/lib/db/seed.ts`
- Auth config: `src/lib/auth/config.ts`
- Auth helpers: `src/lib/auth/helpers.ts`
- Proxy (was middleware): `src/proxy.ts`
- Setup wizard: `src/app/setup/page.tsx`
- Setup API: `src/app/api/setup/route.ts`
- System installed check: `src/app/api/system/installed/route.ts`
- NextAuth handler: `src/app/api/auth/[...nextauth]/route.ts`
- Global styles: `src/app/globals.css`
- Themes: `src/themes/[theme-name]/`

## RBAC Permissions
Permission format: `resource:action` — e.g. `posts:create`, `users:delete`.

Groups: dashboard, posts, pages, media, categories, menus, themes, settings, users, roles.

Default roles and their access:
- `super_admin`: all permissions
- `admin`: all except roles:manage and users:delete
- `editor`: dashboard, all content (posts/pages/media/categories/menus)
- `author`: dashboard, own posts, media view/upload
- `viewer`: dashboard, view-only

## Environment Variables
- `AUTH_SECRET` — NextAuth JWT signing secret
- `NEXTAUTH_URL` — Public URL (http://localhost:3000 for dev)
- `DATABASE_URL` — Optional: path to SQLite file (default: ./data/cartridge.db)
