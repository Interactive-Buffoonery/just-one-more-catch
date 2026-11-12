# Sign-in options

## Today

Clerk handles sign-in with Google, email codes or a password, using Clerk's
own sign-in form. `client/main.ts` loads Clerk and hands its session token
(the `convex` JWT template) to Convex, which checks it in
`convex/auth.config.ts` and owns data by `tokenIdentifier`. Guests keep
playthroughs in the browser until they sign in.

There is one client: the website, installed as an app or used in a browser.
Players use it on phones, computers and Android handhelds like the Retroid
Pocket, where typing an email or password with a gamepad or a small on-screen
keyboard is slow.

## Option: sign in from another device

The device shows a short code and a QR code. The player approves it on a
phone or computer where they are already signed in.

### Clerk's Device Authorization Grant

Clerk added this in September 2026, following RFC 8628. The current docs
show no beta gate; confirm on our instance. Chosen approach; the full scope
is in `device-sign-in.md`.

- Setup: create a public OAuth application in Clerk and turn on
  `device_authorization_grant_enabled`, with scopes
  `openid profile email offline_access` and JWT access tokens.
- Flow: the device posts to `/oauth/device_authorization` and gets a
  `user_code`, a `verification_uri_complete` for the QR code, and a
  `device_code`. It polls `/oauth/token` with grant type
  `urn:ietf:params:oauth:grant-type:device_code` every `interval` seconds,
  handling `authorization_pending`, `slow_down`, `access_denied` and
  `expired_token`. Codes last 10 minutes. Clerk hosts the approval page.
- No server-side exchange is needed; the device talks to Clerk directly.
- Convex: the result is an OAuth access token, not a Clerk session, so the
  `convex` template and Clerk's sign-in form don't apply. Add a second
  provider to `auth.config.ts` that accepts the OAuth token, then confirm
  that `tokenIdentifier` matches the same player's web sign-in. If it
  doesn't, one player ends up with two sets of playthroughs.
- Client: a "Sign in with another device" screen that shows the code and QR
  code, polls, handles expiry, stores and refreshes tokens, and passes them to
  `convex.setAuth`. Sign-out and guest migration need the same path.
- Size: see `device-sign-in.md` (CSP first, a half-day spike, then a 4 to 6
  day build).

### Alternative: Clerk sign-in tokens

The same pairing screen can end in a normal Clerk session. The device creates
a short-lived pairing request in Convex and shows its code. The signed-in
phone approves it. A Convex action creates a Clerk sign-in token for that
player, and the device redeems it with the `ticket` strategy. Everything after
sign-in stays as it is today, and Convex updates the device live, so there is
no polling.

This needs the Clerk secret key in Convex, which the site doesn't use today.
The pairing request also needs to be single-use, expire quickly and be rate
limited. The size is similar to the device grant, with less new token
handling, since the device gets a normal Clerk session.

## Recommendation

Build the device grant for Retroid players, following `device-sign-in.md`.
Fall back to sign-in tokens only if the spike's exit criteria fail.

## Sources

- Clerk announcement: https://x.com/clerk/status/2120275809424507063
- Clerk docs: https://clerk.com/docs/guides/configure/auth-strategies/oauth/device-authorization-grant
- Clerk changelog: https://clerk.com/changelog/2026-09-08-device-authorization-grant
- RFC 8628: https://rfc-editor.org/rfc/rfc8628
