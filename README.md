# ViraPlaza

Accessories web store monorepo (bracelets, rings, and more) with NestJS API, Next.js storefront + admin, OTP login (Melli Payamak), and SEP payments.

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, TypeScript, next-intl (`en` / `fa` / `de`)
- **Backend:** NestJS 11, Prisma 6, PostgreSQL, Redis
- **Auth:** OTP via Melli Payamak (mock adapter for local dev), JWT httpOnly cookies
- **Payments:** SEP / Saman token flow (mock adapter for local dev)

## Quick start

```bash
cp .env.example .env
# also used by the API process:
cp .env apps/api/.env

pnpm install
pnpm db:up
# Postgres host port 5433, Redis host port 6380

pnpm --filter @viraplaza/shared build
pnpm --filter @viraplaza/api exec prisma migrate dev
pnpm db:seed

pnpm --filter @viraplaza/api dev
# other terminal
pnpm --filter @viraplaza/web dev
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: http://localhost:4000/api/health
- Swagger (non-production): http://localhost:4000/api/docs

## Apps & packages

| Path | Description |
|------|-------------|
| `apps/web` | Next.js storefront and admin UI |
| `apps/api` | NestJS REST API |
| `packages/shared` | Shared types, Zod schemas, constants |

## i18n model

- UI dictionaries live in `apps/web/messages/{en,fa,de}.json`
- Admin default locale is stored in backend `SiteSettings.defaultLocale`
- Logged-in users persist `preferredLocale` via `PATCH /api/users/me/locale`
- Guests use the `NEXT_LOCALE` cookie / Accept-Language fallback

## Local integrations

| Integration | Env | Local default |
|-------------|-----|---------------|
| SMS | `SMS_PROVIDER=mock\|melli` | mock (OTP printed in API logs / `debugCode`) |
| Payment | `PAYMENT_GATEWAY=mock\|sep` | mock (checkout auto-completes callback) |
| Super admin | `SUPER_ADMIN_PHONE` | `09120000000` after seed |

Promote the seeded phone to admin by signing in with OTP, then updating role from another SUPER_ADMIN session, or set role directly in the database for the first bootstrap.

## Smoke checks

With the API running:

```bash
chmod +x scripts/smoke.sh
./scripts/smoke.sh
```

## Security checklist

- [x] Helmet + CORS allowlist + ValidationPipe whitelist
- [x] Global and route throttling; Redis OTP rate limits
- [x] OTP hashed at rest, short TTL, attempt lockout
- [x] JWT access/refresh in httpOnly cookies
- [x] RBAC guards for admin routes
- [x] Payment callback idempotency lock + amount verify
- [x] Secrets only via `.env` (never commit real credentials)
- [ ] Set strong JWT secrets and `COOKIE_SECURE=true` behind HTTPS in production
- [ ] Put API and web behind the same trusted domain / reverse proxy in production
- [ ] Rotate any credentials ever pasted into chat or tickets

## Production notes

1. Set `SMS_PROVIDER=melli` and Melli Payamak credentials.
2. Set `PAYMENT_GATEWAY=sep`, `SEP_TERMINAL_ID`, and `SEP_CALLBACK_URL=https://api.example.com/api/payments/sep/callback`.
3. Use managed Postgres + Redis, run `prisma migrate deploy`, then seed once.
4. Disable public Swagger by running with `NODE_ENV=production`.
