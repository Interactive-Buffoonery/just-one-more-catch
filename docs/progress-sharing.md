# Progress sharing

Owners can publish a read-only snapshot of one playthrough. Sharing starts off; sign-in, guest migration, import and new runs never enable it. Guests may preview but must sign in to publish.

## Public contents

Show only game, region and box art from `VERSIONS[version]` and its pack; caught species with sprite, name and national number; and completed badges/trials. Show the postgame case only when a postgame badge exists. Use `pack.badgesWord` / `pack.badgeWord`; drop “Elite Four”, which is not a catalog badge. Counts come from these lists, with no percentages.

Exclude timestamps, account/trainer identity, nicknames, notes, shinies, genders, forms, party, boxes, held items, locations, clock and story events.

The client, publish mutation and HTTP reader use pure `shared/share-projection.ts`:

```ts
type ShareProjection = { v: 1; game: VersionId; caught: number[]; badges: string[] };
```

`projectionOf(stateJson, version)` reads raw state, never `Summary`, which carries party nicknames. `validateProjection(x: unknown)` requires exactly these four keys and rejects unknown keys. Require `game` in `VERSION_IDS`, strictly increasing safe integer `caught` IDs in `1..IMPORT_SPECIES_LIMITS[game]`, unique catalog-ordered `badges` from the game's milestone catalog, and serialized size at most 8 KiB.

`client/packs.ts` imports badge arrays from `shared/milestones.ts`. Resolve names from generated `shared/species-names.ts`; the reader never sends them. Owner preview and public page share one renderer.

## Publishing and links

Dashboard **Share progress**, Journey/Dex/Boxes share icons and the playthrough **...** menu open the same sheet. Await pending saves before rendering the exact preview; stop on failure. Previewing never publishes. **Create link** sends that projection; the mutation recomputes it from stored state and rejects mismatches with a fresh preview.

Owners can copy or natively share links, update after a new preview, replace links or stop sharing. A stale notice compares stored and current counts. Allow one active share per run. Compare and increment monotonic `shareRevision` on create/update/replace/stop, even when stopping without a share row, so delayed creates cannot restore stopped links. Replace invalidates the old token atomically.

Use `https://justonemorecatch.app/share/#s=<token>` so the fragment keeps tokens out of static host requests. Generate 32 random bytes server-side, base64url encoded (43 chars), and store recoverably on the private row for copying again.

## Reading and deletion

The Convex HTTP action receives tokens in a header, never the URL. Validate format before database work, look up by index, check the account-deletion marker and revalidate the stored projection. Never read `states`. Unknown, stopped, replaced, deleted and malformed tokens share one unavailable response; timing is not uniform. Send `Cache-Control: no-store` with CORS restricted to the site origin.

`share/index.html` is a separate Vite input like `contact/`. `client/main.ts` branches on `/share/` for one `fetch`. Load no Clerk, Convex client, analytics or service worker registration. Use `noindex, nofollow`, `Referrer-Policy: no-referrer` and the home page's generic Open Graph card. Keep `/share/` out of service-worker app pages.

`dropRun` deletes the share atomically with its playthrough. Account deletion sets an account-wide marker before batched cleanup; reads and publishes check it. The signature-verified, idempotent Clerk `user.deleted` webhook sets that marker for external deletions. Stopping blocks future reads but cannot recall screenshots, copies or cached pages.
