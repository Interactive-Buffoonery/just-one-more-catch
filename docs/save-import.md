# Importing caught Pokémon

Players open `/import/` from the Dashboard and choose an in-game save. This is a
standalone page with normal document scrolling and a direct, refreshable URL.
The browser loads the reader on demand, reads the save in a dedicated worker,
and previews its caught flags. Confirming creates a new playthrough. Existing
playthroughs stay untouched.

The raw save and its file name never leave the browser and are not stored in
localStorage, Convex or analytics. Only the selected website game and sorted
National Pokédex IDs are persisted. Story progress, boxes, forms, gender flags,
notes, trainer details and play time are not imported. A Pokémon remains caught
if its Pokédex flag is set, even after evolving, trading or releasing it.

## Supported games and identity

Website game support is an explicit adapter in `client/save-import.ts`:

| Reader identity | Website playthrough |
| --- | --- |
| C | Crystal |
| FR / LG | FireRed / LeafGreen, with a GBA or Switch choice |
| HG / SS | HeartGold / SoulSilver |
| US / UM | Ultra Sun / Ultra Moon |

The parser can read more games than the website offers. A readable unsupported
game displays an explanation and creates nothing. Paired version identities
show a choice. When upstream detection considers both an original game and a
ROM hack possible, the player must choose the format before another read.
Nothing silently falls back to an original game.

A successful import requires schema version 1, the `national-dex` species
namespace, a known official format and a website game matching the reader's
candidate versions. Caught IDs intersect the loaded pack's actual species list
and national limit. Skipped species and partial coverage appear in the preview.
An unavailable Pokédex never becomes a successful empty list. A valid empty
caught list is allowed.

## Reader release and assets

The reader comes from the Serabi fork of PKHeX.Everywhere. The website pins a
local release tarball under `vendor/`; it does not load a CDN parser. It exposes
`createSaveReader`, `inspect` and `dispose`, rather than the editor dispatcher.
The dedicated host exports inspection only. The existing upstream editor APIs,
submodule revisions and main branch remain intact in the fork.

Release 0.1.0 pins source commit `417b7e2af86112eb6c0ad21fb839a00676a6849b`.
The tarball SHA-256 is
`2d7ab6d00335255bc32daa6a5dd393f0c7cc2499c0964f57ed353394e80d14b8`.
Runtime assets total 19,991,966 bytes before compression, 5,591,887 with gzip,
or 3,678,499 with Brotli. Source archives are separate optional downloads and
are not fetched during import. These are transfer sizes, not peak memory.

`vite.config.ts` uses `scripts/save-reader-assets.ts` to copy the package assets
into `dist/save-reader/<package-version>-<source-sha-prefix>/`. Development serves
the same assets from the installed package. The build rejects a dirty source
manifest, an asset hash mismatch or any asset over 25 MiB. Resource URLs include
the release revision, and the service worker caches them only when requested.
They are not part of the initial page load.
Progress represents completed runtime resources when a total is available;
reading itself uses an indeterminate bar. Cancel, leaving the page and account
changes abort the worker. Late results cannot advance a cancelled preview.
Back and Forward start a fresh import visit. Leaving also clears any pending
navigation while the account's playthrough list catches up with a successful
import. A create request already sent can still finish in its original account.

The package contains its GPL license, dependency notices and exact source
revisions. The built reader directory exposes these files. Keep those files and
source links in every release. Before distributing a new parser release, check
that the source for every included dependency and reader change is available
at the pinned revisions and that distribution follows its licenses.

## Persistence and account changes

`api.runs.importCaught` validates the game and IDs, derives ownership from the
authenticated identity and creates the run and initial state in one transaction.
It applies the normal playthrough limit. Guest import writes the complete new
row to localStorage before changing in-memory state; storage failure leaves no
phantom playthrough. Both paths use `shared/save-import.ts`.

Each confirmed preview has a random import ID. Retrying that same import returns
the existing playthrough, including when the original response was lost or the
playthrough limit has since been reached. Reusing an ID for a different game or
caught list is rejected. The key contains no save-file information.

The current playthrough's pending edits finish before import commits. Preview
is tied to the current account or guest browser. Changing accounts invalidates
it. Account imports use a separate Convex connection whose token provider stays
bound to the session that confirmed the import; retries cannot silently move to
a different account. A request already accepted by the original account can
finish there. The UI reports that outcome instead of opening it in a new account.

## Adding a future official game

1. Add the website pack using `.agents/skills/add-game/SKILL.md`, including
   sourced game data, sprites and version IDs. That workflow remains separate
   from adding reader support.
2. In the reader fork, verify the pinned PKHeX version detects that save and
   exposes species-level caught flags. Add redistributable synthetic fixtures
   with known caught/seen/uncaught species, a legitimate zero-caught save and
   evolved or released species flags. Exercise the serialized bytes through
   the published WASM worker, not just an in-memory Core object.
3. Check version identity, National Pokédex mapping and full versus partial
   coverage. If the save cannot distinguish paired games or platforms, preserve
   that ambiguity. Add explicit choices; do not infer from file names.
4. Add the exact reader enum identity to `VERSION_MAP` and the new website
   version to `IMPORT_SPECIES_LIMITS`. Keep its cap equal to the sourced pack's
   `national` value. Update the Works with copy and mapping tests.
5. Test the preview and created playthrough against the known fixture flags.
   Check invalid saves, unsupported packs, zero caught, cancellation, storage
   failure, limits, account changes and the existing playthrough remaining intact.
6. Cut a committed reader release with a new package version. Build and test it,
   verify `sourceDirty: false`, notices, source URLs, asset sizes and browser
   startup. Pack it and replace the website dependency with the new tarball.
   Rebuild the lockfile. Keep each Cloudflare asset below its 25 MiB limit.
7. Run the checks below and a real-file check when a player supplies a save.
   Keep personal saves outside Git and public fixtures. Deploy only through the
   normal manual deployment process.

## Adding a ROM hack

Detection alone is insufficient. Add a provider through the fork's Pokédex
provider interface and register it with its format. Confirm the hack's save
layout and species numbering with fixtures. Either map every supported species
to canonical National Pokédex IDs or use a separate namespace and add an explicit
website adapter. Never treat custom numeric IDs as vanilla species just because
they fall inside a game's numeric range. Keep missing flags unavailable and
incomplete mappings partial. Add a matching website pack before enabling import.

## Updating upstream

Merge upstream into the fork, preserving external submodule pins unless the
update deliberately changes them. Keep custom code in the reader host/SDK,
additive Facade snapshot/query and provider seam. Regenerate the Engine SDK
outputs when its query contract changes. Re-run the native and real WASM fixture
matrix, check every published framework dependency's notice, then cut a new
reader package. The fork's upstream push guard must stay installed; push only to
`serabi/PKHeX.Everywhere`.

## Verification

- `pnpm check`: website types and existing product checks.
- `pnpm test:convex`: in-memory authenticated/guest persistence, spam controls
  and species mapping checks; no deployment or live email sends.
- `pnpm exec tsc --noEmit -p convex/tsconfig.json`: backend types.
- `pnpm build`: static site and versioned reader assets.
- Reader fork: its dedicated native fixture tests, SDK tests and published
  worker browser test, as documented in that package's README.

Browser QA should cover actual file selection and drop, preparation failure and
retry, unknown files, original-versus-hack choice, paired game/platform choice,
preview counts, cancellation, page navigation, repeat confirmation and storage
failures. Test a real player's save separately and compare known caught species.
A narrow Chromium viewport is layout evidence; it does not establish mobile
Safari support.

For release 0.1.0, the built website was exercised in Chromium with synthetic
saves for all seven current games, an empty caught list, the FRLG platform
choices and readable unsupported games. The checks covered existing-run
preservation, malformed/empty files, loader retries, cancellation during both
stages, duplicate confirmation, browser storage failure and retry. A separate
account harness covered invalidating a preview after an account change and a
lost response followed by retry at the playthrough limit. Backend tests and the
startup check cover ownership and session-bound token handling. A privately
supplied Miyoo Mini LeafGreen `.srm` also passed the built-site flow: seven caught
flags matched a separate raw-bit check, nine seen flags did not become nine
caught Pokémon, and both the original file and existing playthrough stayed
unchanged. Personal save files remain outside the repository. Live Clerk/Convex,
Safari and physical mobile performance remain unverified.
