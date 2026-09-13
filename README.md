# ViraPlaza

Accessories web store monorepo (bracelets, rings, and more) with NestJS API, Next.js storefront + admin, OTP login (Melli Payamak), and SEP payments.

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Frontend:** Next.js (App Router), Tailwind CSS, TypeScript, next-intl (`en` / `fa` / `de`)
- **Backend:** NestJS, Prisma, PostgreSQL, Redis
- **Auth:** OTP via Melli Payamak (mock adapter for local dev)
- **Payments:** SEP (Saman) token flow (mock adapter for local dev)

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- Storefront: http://localhost:3000
- API: http://localhost:4000
- Admin: http://localhost:3000/admin

## Apps & packages

| Path | Description |
|------|-------------|
| `apps/web` | Next.js storefront and admin UI |
| `apps/api` | NestJS REST API |
| `packages/shared` | Shared types, Zod schemas, constants |

## Security notes

Never commit real credentials. Configure Melli Payamak and SEP via environment variables only.
