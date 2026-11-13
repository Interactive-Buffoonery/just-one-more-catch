# Progress sharing

A player can publish a read-only snapshot of one playthrough and share its link. Sharing is off for every playthrough until the owner turns it on.

## What the link shows

One playthrough, exactly:

- Game, region and box art (from `VERSIONS[version]` and its pack).
- Completed badges or trials, drawn as the pack's badge case. Postgame case only when at least one postgame badge is recorded. Heading uses `pack.badgesWord` / `pack.badgeWord`.
- Caught species: sprite, name, national number.
- Counts derived from those two lists ("3 of 8", "18 caught"). No percentages.

Never shown: timestamps, account or trainer identity, nicknames, notes, shinies, genders, forms, party, boxes, held items, locations, clock, story events. "Elite Four" is not a catalog badge and is dropped.

## Projection

`shared/share-projection.ts`, pure, used by the client, the publish mutation and the HTTP reader:

```ts
type ShareProjection = { v: 1; game: VersionId; caught: number[]; badges: string[] };
```

- `projectionOf(stateJson, version)` builds it from raw state, never from `Summary` (which carries party nicknames).
- `validateProjection(x: unknown)` accepts exactly those four keys; `game` in `VERSION_IDS`; `caught` strictly increasing safe integers in `1..IMPORT_SPECIES_LIMITS[game]`; `badges` unique members of the game's milestone catalog in catalog order; serialized size at most 8 KiB. Unknown keys are rejected, not stripped.
- Milestone catalog lives in `shared/milestones.ts`; `client/packs.ts` imports its badge arrays from there.
- Species names come from a generated `shared/species-names.ts`; the reader never sends names.

## Links

- URL: `https://justonemorecatch.app/share/#s=<token>`. The fragment keeps the token out of the static host request.
- Token: 32 random bytes, base64url (43 chars), generated server side. Stored recoverably on the private share row so the owner can copy it again.
- One active share per run. Each run has a monotonic `shareRevision`; create, update, replace and stop all compare and increment it. Stop increments it even when no share row exists, so a delayed create cannot bring a stopped link back.
- Replace issues a new token and invalidates the old one in the same mutation.

## Owner flow

1. **Share progress** (smaller pill on the dashboard resume card), the share icon on Journey, Dex and Boxes, and the playthrough **...** menu item all open the same sheet for that run.
2. Opening the sheet saves pending changes (awaited; failure stops the flow) and renders the exact preview. Nothing is written.
3. **Create link** sends the previewed projection. The mutation recomputes it from stored state and rejects on mismatch with a fresh preview.
4. With a link: **Copy link**, native share, **Update snapshot** (new preview first), **Replace link**, **Stop sharing**. A stale notice compares stored and current counts.
5. Guests can preview but must sign in before creating a link. Sign-in, guest migration, import and new playthroughs never turn sharing on.

## Public reader

- One Convex HTTP action. Token is sent in a request header, never in the URL. Validates token format before any database work, looks up the share row by index, checks the account is not being deleted, revalidates the stored projection and returns it. Never reads `states`.
- Unknown, stopped, replaced, deleted and malformed tokens all return the same unavailable response. Timing is not uniform and is not claimed to be.
- `Cache-Control: no-store`. Tight CORS to the site origin.

## Public page

- `share/index.html`, a separate Vite input like `contact/`. No Clerk, no Convex client, no analytics, no service worker registration.
- `client/main.ts` branches on `/share/` and does one `fetch`.
- `noindex, nofollow`, `Referrer-Policy: no-referrer`, generic Open Graph card (same as the home page). `/share/` stays out of the service worker's app pages.
- Owner preview and public page use one renderer, so the preview is what the link shows.

## Deletion

- Deleting a playthrough deletes its share in the same mutation (`dropRun`).
- Deleting the account writes an account-wide deleting marker before batched cleanup starts; public reads and publishes check it.
- Clerk `user.deleted` webhook (signature-verified, idempotent) sets the same marker for deletions made outside the app.

Stopping a link stops future reads. It cannot recall screenshots, copies or cached pages.
