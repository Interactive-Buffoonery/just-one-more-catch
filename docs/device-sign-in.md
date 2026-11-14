# Device sign-in

“Use another device” lets a player sign in with a short code and QR code, then confirm it on a phone or
computer. Clerk's `ticket` strategy creates a normal session, preserving guest migration and account ownership
without separate OAuth refresh tokens. Each session can be revoked individually.

## Pairing flow

1. A guest calls `pairing.start`, receiving an 8-letter unambiguous code such as `BCDF-GHJK`, a random device secret and a 10-minute expiry. Store the browser label and schedule row deletion at expiry; return the code and secret only to the device.
2. The device subscribes to `pairing.status({ id, secret })`: `pending`, `approved`, `denied` or `expired`. Return the ticket only to the secret holder.
3. The QR URL `justonemorecatch.app/pair?code=CODE` opens `/settings/devices/`; players can also type the code there. Show the code, browser label and start time in a confirmation sheet. Require the player to match it to the device screen (RFC 8628 section 5.4). Signed-out players sign in before returning to that sheet.
4. `pairing.approve` requires a signed-in caller and a pending, unexpired pairing. Call Clerk `POST /v1/sign_in_tokens` with the caller's own `subject` and `expires_in_seconds: 120`, then store the single-use ticket.
5. The device calls `clerk.signIn.create({ strategy: "ticket", ticket })`, then `setActive` and `pairing.finish` to delete the row. Convex auth, guest migration, import, contact and account deletion use the normal session.
6. After sign-in, `devices.label` stores the browser label against the player's session ID (`sid`).

## Devices and revocation

`/settings/` links to `/settings/devices/`. Its list comes from `clerk.user.getSessions()` and shows the
stored label or Clerk browser/OS, last active time, city and current device. The current device uses Sign out
rather than revoking itself.

`devices.revoke({ sessionId })` loads `GET /v1/sessions/{id}`, checks caller ownership, calls `POST
/v1/sessions/{id}/revoke`, then writes `revokedSessions { sid, expiresAt }` for 10 minutes, longer than any
Convex token can live. Scheduled cleanup deletes expired rows.

`identityOf(ctx)` in `convex/auth.ts` returns null for missing or revoked `sid`. Use it everywhere, including
`convex/runs.ts` (`owner()`, `list`, `avatar`, `theme`), `convex/events.ts` and `convex/contactSpam.ts`. `pnpm
check` rejects other raw `ctx.auth.getUserIdentity()` calls. Live queries read the revocation table and
immediately rerun empty; Clerk signs the device out within about a minute.

## Security and configuration

- Keep the secret on the device. Confirmation requires sign-in and an explicit code match; the label and start time help players detect a stranger's phishing request.
- Rate-limit starts per signed-in account or verified browser visitor with `@convex-dev/rate-limiter`. Anonymous starts need a fresh server-verified Turnstile proof; see [deployment.md](deployment.md#turnstile). Delete inactive start quotas after two days. Limit confirmation and lookup attempts per player to resist guessing.
- Clerk tickets are single-use, expire in two minutes and are deleted when sign-in finishes.
- Keep `CLERK_SECRET_KEY` in Convex env on dev and production, used only by actions.
- Convex must receive Clerk's session token with `"aud": "convex"`, not the `convex` JWT template, which omits reserved `sid`. `sessionToken()` in `client/main.ts` sends the session token with that claim. Preserve it in customized dev and production tokens. Session tokens last 60 seconds; `identityOf` treats missing `sid` as signed out.
- Keep Clerk's maximum session lifetime at 30 days with no inactivity timeout. The device signs in again about monthly; revocation still cuts access immediately and signs it out within about a minute.

## Verification

Run `pnpm test:convex` with Clerk calls stubbed. Cover pairing start/status/expiry, secret-only ticket access,
signed-in single-use confirmation, rate limits, revoked `sid` rejection and refusal to revoke another player's
session. Tests use `convex-test` beside `convex/importCaught.test.ts`. Run `pnpm check` for the
raw-identity-call guard.

Before deployment, manually check ticket sign-in in the Retroid browser and installed app without a blocking
new-device or second-factor step. Confirm the session appears in `getSessions()` on the phone, both devices
see the same playthroughs, and guest playthroughs migrate. Revoke from the phone: queries must empty
immediately and sign-out follow within about a minute. Check denied/expired states and a QR link opened on a
signed-out phone returning to confirmation after sign-in.
