# Device sign-in scope

Goal: a player on a Retroid Pocket (or any device where typing is slow) taps
"Use another device", sees a short code and a QR code, approves on their phone,
and is signed in to the same account and playthroughs they have on the web.
Built on Clerk's OAuth Device Authorization Grant (RFC 8628). Background is in
`auth-options.md`.

## Where it fits

The app layer only sees `Bridge["auth"]` (`client/types.ts`), and Convex only
uses `tokenIdentifier` (`sub` + `iss`). Device sign-in is a second auth source
in `client/main.ts` next to Clerk, plus one Convex provider entry. The account
sheet and guest migration also need changes (below).

## Order of work

1. CSP, as its own change.
2. Spike on the dev instance. Its exit criteria decide whether the build goes
   ahead.
3. Build, then re-estimate it from what the spike found.

## 1. CSP (ships first)

The site sets no Content-Security-Policy today (`public/_headers` only sets
caching). Device sign-in keeps a long-lived refresh token in localStorage,
which any script on the origin can read, so a CSP is required.

- Cover the whole origin in `public/_headers`: the app, `/contact/` and the
  static legal pages, since they share localStorage.
- Allow our own scripts, Cloudflare's analytics beacon
  (`static.cloudflareinsights.com`), the Clerk Frontend API
  (`clerk.justonemorecatch.app`), Clerk images, Convex (`https` and `wss`),
  and Cloudflare's bot check if Clerk's sign-in uses it.
- Inline scripts in `index.html` and `public/{about,privacy,terms}/index.html`:
  move them to files or allow them by hash, never with `'unsafe-inline'`.
- Start with `Content-Security-Policy-Report-Only`, check sign-in, avatars,
  contact, save import (worker) and the service worker on dev and production,
  then enforce.

## 2. Spike (half a day, dev instance)

Exit criteria. The build goes ahead only if all of these pass:

1. **Availability:** Discovery (`/.well-known/openid-configuration`) lists
   `device_authorization_endpoint` after turning the grant on for a public
   OAuth app. Current Clerk docs show no beta gate; confirm on our instance.
2. **CORS:** The browser can call `/oauth/device_authorization`,
   `/oauth/token` (device code and refresh) and revocation from
   `justonemorecatch.app`. If it can't, stop and re-scope. A proxy is a new
   security surface, not a quick fallback.
3. **Claims:** For a real access token, record `iss`, `sub`, `aud`, `alg`,
   `typ`, `iat`, `exp` and `kid`. `iss` must equal `CLERK_JWT_ISSUER_DOMAIN`
   and `sub` must be the Clerk user ID. Don't assume the access token's `aud`
   matches the ID token's.
4. **Convex:** A second provider in `convex/auth.config.ts`, with the same
   `domain` and `applicationID` set to the access token's `aud`. Convex
   matches providers by issuer and audience, so the two entries can share a
   domain. A test query returns the same `tokenIdentifier` for a web sign-in
   and a device sign-in. A token from a different OAuth client is rejected.
   Any `customJwt` fallback keeps audience checks.
5. **Revocation:** Clerk documents one-day access tokens, refresh tokens that
   don't expire, and JWT access tokens that can't be revoked. Find out whether
   a public client can revoke its refresh token without a secret, and whether
   refresh tokens rotate. Decide how a player cuts off a lost Retroid (from
   the web account sheet, or a backend revoke behind a Convex action). If
   there's no workable answer, stop.
6. **Approval page:** It works on production's Account Portal at `/device`,
   reuses the phone's existing web session, and shows the code for the player
   to confirm.

## 3. Build

### Clerk and config

- Dev and production instances: one public OAuth app each, device grant on,
  scopes `openid profile email offline_access`, JWT access tokens.
- `VITE_CLERK_OAUTH_CLIENT_ID` per instance. Extend the `build:prod` env
  isolation in `package.json` so a dev client ID can't reach production.

### Convex

- `convex/auth.config.ts`: the second provider from spike step 4.
- No schema or function changes; ownership stays on `tokenIdentifier`.
- If revocation needs the backend (spike step 5): one authenticated Convex
  action that revokes the caller's device tokens. This adds the Clerk secret
  key to Convex env, so update the README.

### Client auth lifecycle (`client/main.ts`)

This is the bulk of the work.

- **One active source:** Device tokens take precedence over Clerk. Every
  sign-in, sign-out or source change bumps a session generation. Results
  from older generations (polls, refreshes, `setAuth` callbacks, late Clerk
  loads, the startup timeout) are dropped. `onUser`'s same-user early return
  has to compare source and generation too, not just the user ID.
- **Authenticated only after Convex accepts:** Set `isAuthenticated` from the
  `setAuth` callback, as today.
- **Polling:** Honor `interval`, add 5 seconds on `slow_down`, stop on
  `access_denied` / `expired_token` / other errors, back off on network
  errors, and stop on cancel or when the sheet closes. Write it as a pure
  function.
- **Tokens:** Store the refresh and access tokens in localStorage under one
  key. Run one shared refresh at a time, used by both the main client and
  the import client. Coordinate across tabs with a `storage` event or
  `BroadcastChannel`, so one tab refreshes and sign-out reaches every tab.
- **Refresh failures:** A rejected refresh (`invalid_grant`) signs the device
  out. A timeout, 5xx or being offline keeps the refresh token and retries
  later, so a reload while offline doesn't sign the player out.
- **Sign-out:** Revoke if possible (spike step 5), clear storage, bump the
  generation, return to guest, and tell other tabs.
- **Import (`importRun`):** Bind retries to the session generation rather
  than `clerk.session`, so signing out and back in can't revive an old import.
- **Guest migration (`client/guest.ts`):** Fence each awaited write to the
  generation that started it, so a switch mid-migration can't move the
  remaining guest runs into another account.
- **Account deletion:** Add a Bridge capability flag. Hide "Delete account"
  for device sign-ins (`client/views/runs.ts`), and have `deleteAccount`
  refuse before the Convex purge when it can't delete the Clerk user.
- **Contact page:** Device players send as guests. No change.

### Sheet UI (`client/views/runs.ts`)

- A "Use another device" button in the sign-in sheet opens a view with the
  code, a QR code of `verification_uri_complete`, the URL, and Cancel.
- One short line: approve only the code shown here. RFC 8628 calls for this,
  since Clerk's approval page can't tell an attacker's request from ours.
- Mockup first. Labels only, apart from that line. Reachable with a d-pad
  (focus order, visible focus).
- QR code: the smallest maintained encoder (for example
  `qrcode-generator`), loaded only when the view opens. It's the only new
  dependency.

### Checks

- `scripts/check_device_sign_in.mjs`, added to `pnpm check`, covers the
  polling machine, refresh decisions (terminal versus retryable), and
  generation fencing.
- `scripts/check_sw.mjs`: assert the service worker leaves POSTs and
  cross-origin requests alone.
- Startup checks: device tokens present with a late Clerk load; both
  sources present; cancel during token exchange.
- Manual, on the dev instance with a real Retroid and a phone:
  - The Retroid shows the same playthroughs as the web.
  - Guest playthroughs move over.
  - A reload keeps the session, including an offline reload.
  - Two tabs share one refresh, and sign-out reaches both.
  - Revoking from the web cuts off the Retroid.
  - Delete account is hidden on the Retroid.

## Size

- CSP: half a day to one day, mostly testing.
- Spike: half a day.
- Build: 4 to 6 days. Clerk setup and the Convex provider take half a day.
  The auth lifecycle (source precedence, refresh, tabs, fencing) takes 2 to 3
  days. The sheet UI with mockup and QR takes 1 day. Checks and Retroid
  testing take 1 day.

Re-estimate after the spike.

## Cuts if it needs to be smaller

- Stop if CORS fails, rather than building a proxy.
- Keep Clerk's hosted approval page.
- Device players send contact messages as guests.
- Defer account deletion from the Retroid.
- Keep the QR code; it's the point for Retroid players.
