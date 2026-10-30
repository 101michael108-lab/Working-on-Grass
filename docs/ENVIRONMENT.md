# Environment configuration

## Where variables live

| Variable | Local (`.env.local`) | App Hosting (`apphosting.yaml`) |
|----------|----------------------|----------------------------------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://workingongrass.co.za` |
| `ADMIN_UIDS` | Your Firebase Auth UID(s) | Same UID(s), comma-separated |
| `PAYFAST_PASSPHRASE` | Plain text in `.env.local` | Secret `payfast-passphrase` |
| `NEXT_PUBLIC_PAYFAST_SANDBOX_*` | Optional for sandbox checkout | Optional secrets (see yaml comments) |
| PayFast **live** merchant ID/key | — | **Firestore** `settings/config` |
| Firebase client config | `src/firebase/config.ts` / App Hosting auto-init | App Hosting auto-init |
| Firebase Admin | `GOOGLE_APPLICATION_CREDENTIALS` | Application Default Credentials |
| `RESEND_API_KEY` | Plain text in `.env.local` | Secret `resend-api-key` |
| `EMAIL_FROM` | Plain text in `.env.local` | Plain value in yaml |
| `EMAIL_TRANSPORT` | Optional override | Optional override |

## PayFast troubleshooting (signature mismatch / 400)

PayFast **"Generated signature does not match"** almost always means a **config mismatch**, not bad checkout code:

| Check | Live production |
|-------|-----------------|
| `PAYFAST_PASSPHRASE` in App Hosting | Must match **live** PayFast dashboard → Settings → Security (exact spelling, no extra spaces) |
| Passphrase in PayFast dashboard | If blank there, leave `PAYFAST_PASSPHRASE` empty in App Hosting too |
| `isLiveMode` in Firestore `settings/config` | `true` for live site |
| Merchant ID & Key | In **Firestore** `settings/config`, not env (for live) |
| PayFast URL | Live: `https://www.payfast.co.za/eng/process` (auto when `isLiveMode` is true) |

**Common mistake:** sandbox passphrase in App Hosting while the site uses **live** merchant credentials from Firestore.

After changing App Hosting env vars, click **Save and deploy** / trigger a new rollout.

## Browser 403 errors

Open DevTools → **Network**, find the red request, and note the URL:

- `firestore.googleapis.com` → deploy rules, or enable **Anonymous** sign-in (Firebase Auth) for guest checkout
- `identitytoolkit.googleapis.com` → enable Email/Password + **Anonymous** in Firebase Auth
- `/api/payfast-signature` → App Hosting env / deployment issue

## Admin access (`ADMIN_UIDS`)

Admins are **not** defined in Firestore. Set Firebase Auth UID(s) in env:

```yaml
# apphosting.yaml
- variable: ADMIN_UIDS
  value: SRSc2O7T4XOnTe8ehJMl8oXLtwz2
  availability:
    - RUNTIME
```

Multiple admins: `UID1,UID2,UID3`

After login, the app sets an `admin` custom claim and a session cookie.

**Live site admin not working?** Usually one of:
1. Latest code not deployed to App Hosting (push + rollout).
2. `ADMIN_UIDS` / `NEXT_PUBLIC_ADMIN_UIDS` do not match your Firebase Auth UID.
3. Sign out and log in again after deploy (refreshes the `admin` claim).

**Deploy Firestore + Storage rules** after changing admin config:

```bash
firebase deploy --only firestore:rules,storage
```

Find your UID: Firebase Console → Authentication → Users → copy User UID.

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

## Email sending

Every email is written to the Firestore `mail` collection first — that is the
durable outbox, and it is what `/admin/email-log` reads. Two things can send it:

| `EMAIL_TRANSPORT` | Who sends | Result recorded? |
|-------------------|-----------|------------------|
| `resend` (or unset with a key present) | This app, via the Resend API | Yes — immediately, in the document's `delivery` field |
| `extension` (or unset with no key) | Firebase Trigger Email extension | Only what the extension writes back |

The provider is used as soon as `RESEND_API_KEY` exists, so switching over is
adding one secret and reverting is removing it. Set `EMAIL_TRANSPORT=extension`
to fall back without deleting the key.

### Setting it up

1. **Verify a sending domain** in Resend (e.g. `mail.workingongrass.co.za`) by
   adding the DKIM and SPF records it gives you at your DNS provider. Resend
   refuses any `from` outside a verified domain.
2. **Create an API key** in Resend with *Sending access* only.
3. **Store it.** Production:
   ```bash
   firebase apphosting:secrets:set resend-api-key
   ```
   Then redeploy, because secrets are read at instance start. Locally, put
   `RESEND_API_KEY=re_...` in `.env.local`.
4. **Set `EMAIL_FROM`** to an address on the verified domain, in
   `apphosting.yaml` (it is not a secret).
5. **Check it worked:** Admin → Settings → *Send Test Email*, then Admin →
   *Email Log*. A `SUCCESS` row with a provider message id means Resend
   accepted it.
6. **Uninstall the Trigger Email extension**, once you are satisfied the
   provider is sending. See below — leaving both running sends everything twice.

### Do not leave both senders running

The extension claims any `mail` document that arrives without a `delivery`
field, so with the extension installed *and* a Resend key set, both would send
every email — two receipts per customer.

Order emails are protected during the switchover: the server creates those
documents already marked `PROCESSING`, which the extension skips. Emails queued
from the admin dashboard (resend receipt, *Send Me The Order*, test email) are
**not** protected, because the browser cannot know which transport is
configured — it writes the document and asks the server to send it. So expect
possible duplicates of those until the extension is removed.

The API key is a server-only secret. It must never be given a `NEXT_PUBLIC_`
prefix or stored in Firestore `settings/config`, both of which are readable by
the browser. The admin dashboard cannot send directly for this reason — it
queues the document and posts the id to `/api/admin/dispatch-mail`, which sends
it server-side after verifying the admin session.

### Why not just the extension

The extension's write *is* the send, so the app never learned the outcome, and
its SMTP settings lived in the Firebase console — unversioned and unreviewable.
Sending from the app means a failure is known at the moment it happens and is
recorded on the order and in the Email Log.
