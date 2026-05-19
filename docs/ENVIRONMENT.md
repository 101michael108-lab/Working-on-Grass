# Environment configuration

## Where variables live

| Variable | Local (`.env.local`) | App Hosting (`apphosting.yaml`) |
|----------|----------------------|----------------------------------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://workingongrass.co.za` |
| `PAYFAST_PASSPHRASE` | Plain text in `.env.local` | Secret `payfast-passphrase` |
| `NEXT_PUBLIC_PAYFAST_SANDBOX_*` | Optional for sandbox checkout | Optional secrets (see yaml comments) |
| PayFast **live** merchant ID/key | — | **Firestore** `settings/config` |
| Firebase client config | `src/firebase/config.ts` / App Hosting auto-init | App Hosting auto-init |
| Firebase Admin | `GOOGLE_APPLICATION_CREDENTIALS` | Application Default Credentials |

## Production setup (App Hosting)

1. Set the PayFast passphrase secret (never commit the value):

   ```bash
   firebase apphosting:secrets:set payfast-passphrase
   ```

2. Deploy — `apphosting.yaml` wires `PAYFAST_PASSPHRASE` to that secret at **runtime**.

3. In **Firestore** `settings/config`, set live PayFast fields and `isLiveMode: true`:
   - `payfastMerchantId`
   - `payfastMerchantKey`
   - `isLiveMode`

4. Deploy Firestore rules and indexes:

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

## Local development

```bash
cp .env.example .env.local
# Edit .env.local with your sandbox passphrase and credentials
```

Download a Firebase service account JSON for Admin SDK routes (`/api/payfast-itn`, `/api/track-order`, `/api/auth/session`):

```env
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

## Optional: sandbox on App Hosting

If the hosted site uses `isLiveMode: false`, uncomment the sandbox variable blocks in `apphosting.yaml` and create secrets:

```bash
firebase apphosting:secrets:set payfast-sandbox-merchant-id
firebase apphosting:secrets:set payfast-sandbox-merchant-key
```
