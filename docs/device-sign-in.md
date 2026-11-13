# Device sign-in scope

Goal: a player on a Retroid Pocket, or any device where typing is slow, taps
"Use another device" and sees a short code and a QR code. They approve it on
a phone or computer where they're already signed in. The device then has its
own Clerk session on the same account. Any signed-in device can see and
revoke the others, and a revoked device loses access at once.

Built on Clerk sign-in tokens (the `ticket` strategy). We chose this over
Clerk's OAuth Device Authorization Grant because the grant's tokens can't be
revoked per device. Background is in `auth-options.md`.

## Order of work

1. CSP (`feat/site-csp`). Worth having anyway, but it no longer blocks this
   work, because no long-lived token is stored in localStorage.
2. Mockups for the three screens, approved before any UI work.
3. Backend and client plumbing, alongside the mockups.
4. UI from the approved mockups.
5. Test on the dev instance with a real Retroid and a phone.

## Flow

1. **Device starts:** A guest calls `pairing.start`. It creates a row with an
   8-letter code (unambiguous letters, shown as `BCDF-GHJK`), a random device
   secret, the device's browser label and a 10-minute expiry. The code and
   secret go back to the device only. A deletion is scheduled for expiry.
2. **Device waits:** It subscribes to `pairing.status({ id, secret })`. The
   status is pending, approved, denied or expired. The ticket is returned
   only to the holder of the secret.
3. **Phone opens it:** The QR code links to
   `justonemorecatch.app/pair?code=CODE`, which lands on `/settings/devices/`.
   A signed-in player can also type the code there under "Sign in another
   device". The app opens an approval sheet showing the code, the device's browser
   label and when it was started. The player confirms the code matches the
   device's screen (RFC 8628 section 5.4), then approves or denies. A
   signed-out player signs in first, then lands back on the approval sheet.
4. **Approve:** The `pairing.approve` action checks the caller is signed in
   and the pairing is pending and unexpired. It calls Clerk's Backend API
   `POST /v1/sign_in_tokens` with the caller's own `subject` and
   `expires_in_seconds: 120`, then stores the ticket on the row as approved.
   The row is then single-use.
5. **Device signs in:** It receives the ticket through its subscription,
   calls `clerk.signIn.create({ strategy: "ticket", ticket })` then
   `setActive`, and calls `pairing.finish` to delete the row. From here it's
   a normal Clerk session. Convex auth, guest migration, import, contact and
   delete account all work unchanged.
6. **Device label:** After sign-in, the device calls `devices.label` to store
   its browser label against its session ID (`sid`), owned by the player.

## Devices list and revocation

- **Devices page:** Settings is a page at `/settings/`, with a Devices row
  linking to `/settings/devices/`. That page has a "Signed-in devices" list,
  from `clerk.user.getSessions()`. It shows the label from Convex (or
  Clerk's browser and OS), last active time and city, and marks this device.
  The current device can't revoke itself; Sign out covers that.
- **Revoke:** The `devices.revoke({ sessionId })` action:
  1. Loads the session from Clerk (`GET /v1/sessions/{id}`) and checks it
     belongs to the caller.
  2. Calls `POST /v1/sessions/{id}/revoke`.
  3. Writes `revokedSessions { sid, expiresAt }`, kept for 10 minutes, longer
     than any Convex token from that session can live.
- **Instant cutoff:** One helper in `convex/auth.ts`, `identityOf(ctx)`,
  reads the identity and returns null if it has no `sid` or its `sid` is in
  `revokedSessions`.
  - It replaces every raw `ctx.auth.getUserIdentity()`: `convex/runs.ts`
    (`owner()`, `list`, `avatar`, `theme`), `convex/events.ts` and
    `convex/contactSpam.ts`.
  - A check in `pnpm check` fails on any other call.
  - Live queries read the table, so the revoked device's subscriptions
    re-run at once and come back empty. Clerk signs that device out within
    about a minute.
- **Cleanup:** A scheduled function deletes expired rows.

## Security

- **Pairing:** The secret never leaves the device. Approving needs a
  signed-in player and an explicit confirmation. Both `pairing.start` and
  approval attempts are rate limited with `@convex-dev/rate-limiter`, which
  is already used in `convex/contactSpam.ts`. Starts are limited per signed-in
  account or verified browser visitor. Anonymous starts require a fresh,
  server-verified Turnstile proof; see README.md for configuration. Inactive
  start quota records are cleaned up after two days. Approve and lookup attempts
  are limited per player, which stops someone
  from guessing codes.
- **Tickets:** Clerk sign-in tokens are single-use, and ours expire in two
  minutes. The ticket is deleted once the device finishes.
- **Secret key:** `CLERK_SECRET_KEY` lives in Convex env on dev and
  production, and is used only in the actions. Update the README's "the
  secret key isn't used" line.
- **Phishing:** A stranger could show a player their own code and ask them
  to approve it. The approval sheet shows the device label and start time,
  and asks the player to confirm the code matches the screen in front of
  them.

## Spike checks (first hour of testing on dev)

1. **Required before deploying:** Convex must get Clerk's session token, not
   the `convex` JWT template. Clerk reserves `sid` and leaves it out of
   template tokens. `sessionToken()` in `client/main.ts` already sends the
   session token when it has `"aud": "convex"`, so the customized session
   token on dev and production must keep that claim. Session tokens last 60
   seconds, well inside the 10 minutes `revokedSessions` rows are kept.
   `identityOf` treats a token without `sid` as signed out.
2. Ticket sign-in works in the Retroid browser and the installed app, with no
   new-device or second-factor step in the way.
3. The new session appears in `getSessions()` on the phone.
4. After revoking, the Retroid's queries return empty at once, and it's
   signed out within about a minute.
5. **Session lifetime:** Clerk's maximum session lifetime is set to 30 days
   with no inactivity timeout, so a Retroid signs in again about once a
   month. Revoking still cuts a device off within about a minute.

## Checks

- Convex tests with `convex-test`, next to the existing
  `convex/importCaught.test.ts`:
  - Pairing start, status and expiry.
  - Only the holder of the secret sees the ticket.
  - Approve needs a signed-in player and works once.
  - Rate limits apply.
  - `identityOf` rejects a revoked `sid`.
  - Revoke refuses another player's session.
  - Clerk calls are stubbed.
- `pnpm check`: no raw `getUserIdentity` outside `convex/auth.ts`.
- Manual on dev:
  - Pair a Retroid and see the same playthroughs as the web.
  - Guest playthroughs move over.
  - Revoke from the phone cuts the Retroid off.
  - A denied or expired code shows that state.
  - The QR code opens the approval sheet on a signed-out phone after sign-in.

## Size

About 5 to 6 days. The pairing backend and revocation take 2 days, the three
screens with mockups take 2, and checks and testing take 1 to 1.5.

The OAuth app created for the device grant isn't used. Delete it after the
dev test passes.
