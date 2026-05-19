# Working on Grass

Next.js e-commerce and CMS for [workingongrass.co.za](https://workingongrass.co.za), with Firebase (Auth, Firestore, Storage) and PayFast payments.

## Development

```bash
npm install
cp .env.example .env.local   # edit with sandbox credentials
npm run dev
```

See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for local vs **Firebase App Hosting** environment variables.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run unit tests (Vitest) |

## Deploy

Production env vars and secrets are configured in **`apphosting.yaml`**, not committed `.env` files.

| Production (App Hosting) | Local (`.env.local`) |
|--------------------------|----------------------|
| `NEXT_PUBLIC_SITE_URL` in yaml | `http://localhost:3000` |
| `PAYFAST_PASSPHRASE` → Secret Manager | Plain text in `.env.local` |
| Live PayFast ID/key → Firestore `settings/config` | Sandbox ID/key in env |
| Firebase Admin → ADC | Service account JSON path |

```bash
firebase apphosting:secrets:set payfast-passphrase
firebase deploy --only firestore:rules,firestore:indexes,storage
# App Hosting deploys via Firebase console or CI
```
