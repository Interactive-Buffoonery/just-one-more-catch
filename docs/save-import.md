# Importing caught Pokémon

Players open `/import/` from the Dashboard and choose an in-game save. This is a
standalone page with normal document scrolling and a direct, refreshable URL.
The browser loads the reader on demand, reads the save in a dedicated worker,
and previews its caught flags. Confirming creates a new playthrough. Existing
playthroughs stay untouched.

The raw save and its file name never leave the browser and are not stored in
localStorage, Convex or analytics. Only the selected website game and sorted
National Pokédex IDs and the selected playthrough start date are persisted. Story progress, boxes, forms, gender flags,
notes, trainer details and play time are not imported. A Pokémon remains caught
if its Pokédex flag is set, even after evolving, trading or releasing it.

## Supported games and identity

Website game support is an explicit adapter in `client/save-import.ts`:

| Reader identity | Website playthrough |
| --- | --- |
| RD / BU | Red / Blue (paired choice when both are candidates) |
| YW | Yellow |
| GD / SI | Gold / Silver (paired choice when both are candidates) |
| C | Crystal |
| FR / LG | FireRed / LeafGreen, with a GBA or Switch choice |
| RS (S / R candidates) | Sapphire / Ruby (paired choice) |
| E | Emerald |
| DP (D / P candidates) | Diamond / Pearl (paired choice; excludes Platinum) |
| Pt | Platinum (single title; excludes Diamond/Pearl) |
| HG / SS | HeartGold / SoulSilver |
| B / W | Black / White (individual stored title; excludes B2 / W2) |
| X / Y | X / Y (individual stored title) |
| B2 / W2 | Black 2 / White 2 (individual stored title; excludes B / W) |
| US / UM | Ultra Sun / Ultra Moon |

The parser can read more games than the website offers. A readable unsupported
game displays an explanation and creates nothing. Paired version identities
show a choice. When upstream detection considers both an original game and a
ROM hack possible, the player must choose the format before another read.
Nothing silently falls back to an original game.

A successful import requires schema version 1, the `national-dex` species
namespace, a known official format and a website game matching the reader's
candidate versions. Caught IDs intersect the loaded pack's actual species list
and national limit. Skipped species, partial coverage and reader warnings appear in the preview.
Reader 0.1.3 adds this warning when Core reports an invalid checksum for any
loaded save: "This save's checksum doesn't match. It may have been edited or
damaged." The save remains importable with the same caught flags and coverage.
The preview displays this alongside any other reader warnings. Valid half-size
Emerald saves keep their existing missing-slot warning alone.
An unavailable Pokédex never becomes a successful empty list. A valid empty
caught list is allowed.

## Optional playthrough start date

The ready preview uses a recorded adventure-start date when the reader exposes
one, otherwise the import day. Change lets the player choose the recorded date,
import day or another past calendar day using the existing start-date calendar.
Cancel keeps the previous selection. Recorded dates are calendar dates from the
console clock, so they can reflect an incorrect clock or save editing. We do not
infer a date from play time, a Pokémon's met date or the file's timestamps.

Reader schema 1 adds optional top-level `startDate` (`YYYY-MM-DD`). Release 0.1.1
supports HeartGold/SoulSilver and Sun/Moon/Ultra Sun/Ultra Moon; only the website's
supported packs can be imported. The source fields are PKHeX's `SecondsToStart`
with its `DateUtil.GetDateTime2000` conversion. The reader checks each format's
console calendar bounds and omits uninitialized zero values. Red/Blue/Yellow, Gold/Silver/Crystal and
FireRed/LeafGreen, Ruby/Sapphire, Emerald, Black/White, X/Y, Diamond/Pearl, Black 2/White 2 and Platinum provide no recorded date through this reader. Missing, invalid
or future dates use import day; the preview never invents a recorded date.

The website converts the selected calendar day to local midnight, matching the
existing Dashboard start-date editor. The optional `startedAt` argument crosses
the Bridge and is stored atomically with the new run and caught flags, both for
guests and accounts. Existing clients can omit it. After confirming once, the
choice stays fixed for retries; players can edit the created run's start date
later from the Dashboard. A successful import opens Dex with Caught selected.

For future games, verify the actual adventure-start field, epoch, calendar
bounds and an exported fixture through WASM before extending the reader's
allowlist. Do not use the virtual default `SecondsToStart` from unsupported
formats. Add absence, invalid/zero and leap-day cases as well as a real recorded
date. Preserve the date without applying a timezone shift in the reader.

## Reader release and assets

The reader comes from the Serabi fork of PKHeX.Everywhere. The website pins a
local release tarball under `vendor/`; it does not load a CDN parser. It exposes
`createSaveReader`, `inspect` and `dispose`, rather than the editor dispatcher.
The dedicated host exports inspection only. The existing upstream editor APIs,
submodule revisions and main branch remain intact in the fork.

Release 0.1.3 pins source commit `d666c67dc4d6d11603cdf50b13f4c431c0b95668`.
The tarball SHA-256 is
`11016383aa45921f63ef7865f5ceb7bb6a0be1a5f49190d20dad929a5694aafe`.
Runtime assets total 20,149,470 bytes before compression, 5,630,447 with gzip,
or 3,699,350 with Brotli. Source archives are separate optional downloads and
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
playthrough limit has since been reached. Reusing an ID for a different game,
caught list or start date is rejected. The confirmed date stays fixed during a
retry, including after a lost response or crossing midnight. The key contains no save-file information.

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
6. If reader code changes, cut a committed release with a new package version.
   Build and test it; verify `sourceDirty: false`, notices, source URLs, asset sizes and browser
   startup. Pack it and replace the website dependency with the new tarball.
   Rebuild the lockfile. Keep each Cloudflare asset below its 25 MiB limit.
7. Run the checks below and a real-file check when a player supplies a save.
   Keep personal saves outside Git and public fixtures. Deploy only through the
   normal manual deployment process.

Emerald uses reader 0.1.3. Its serialized fixtures exercise native detection,
raw-bit comparison, the published WASM worker and the built website's guest
import flow. They cover 128 KiB `.sav` files and `.srm` drop, caught history after
storage removal, an empty Pokédex, rotated sectors and choosing the newer slot.

For exactly 64 KiB, the fork verifies all 14 unique main sections, their sector
signatures, a consistent counter, checksums and Emerald identity. A private copy
is extended with erased bytes only for normal Core and ROM-hack detection. The
original file is never rewritten or repaired. The preview warns that a newer
save may be missing; complete flag coverage describes only the surviving slot.
Missing/duplicate sections, invalid signatures, mixed counters, bad checksums
and 64 KiB RS/FRLG layouts are rejected. Reproduction instructions are in
[the Emerald fixture README](../scripts/emerald-save-fixtures/README.md).

Ruby/Sapphire uses the vendored reader 0.1.3 and the pack's 386-species National
Dex limit. Serialized 128 KiB synthetic fixtures return `RS`, with individual
candidates `S` and `R`; the existing paired-game choice is required. File names
do not identify the title. Raw National Dex bits, native Core and the published
WASM worker agree on 14 caught species, seen-only Bulbasaur, empty storage after
removal, and an empty Pokédex. Rotated sectors exercise the newer second slot.
The built website imports both choices, preserves existing runs and reloads
caught state; 64 KiB RS remains rejected. No reader code or package changed.
Reproduce with [the RS fixture README](../scripts/rs-save-fixtures/README.md).
These are structural parser fixtures, not in-game cartridge exports. A real
128 KiB save, a legitimate in-game zero-caught save and real 64 KiB RS cartridge
or emulator exports remain unverified; do not infer half-size RS support from
Emerald recovery. Signed-in live imports and mobile Safari remain separate checks.

A real 64 KiB emulator export remains a separate check. Obtain an existing
65,536-byte in-game `.sav` or `.srm` from its owner with permission to test it.
A disposable emulator profile using a user-supplied ROM and 64 KiB flash settings
is another possible reproduction, but has not been verified here. Do not change
a player's active profile or truncate their only save. No personal Emerald
save, live account import or mobile Safari check was performed.

## Black/White verification

Black/White uses vendored reader 0.1.3 and the pack's 649-species National Dex
limit, already present in `IMPORT_SPECIES_LIMITS` on the pack branch. Eight
serialized synthetic 512 KiB fixtures cover caught and empty saves for Black,
White, Black 2 and White 2. Native Core, independent raw-bit reads and the
published WASM worker agree on each individual identity, complete National Dex
coverage and 19 caught species retained after removal from storage. Three
seen-only species exercise separate gender/shiny regions and stay uncaught.
The website maps `B`/`W` and `B2`/`W2` to their own titles; sequel saves never
offer original Black/White choices.
Both original titles import and reload exact caught state, preserving existing
runs and input bytes. Zero-filled and truncated files create nothing.

PKHeX Gen V does expose an adventure-start field: `SAV5.SecondsToStart`
forwards to the 64-bit `AdventureInfo5.SecondsToStart` at adventure block +
`0x34` (the generic property narrows it to 32 bits). Reader 0.1.3 does not
allowlist Gen V. Both populated and zero fields omit `startDate` through the
published worker, so imports use import day. The Gen V epoch, calendar bounds,
invalid values, leap days and exported recorded-date behavior remain unverified
for date import; no new date allowlist or reader release is introduced.

Reproduce with [the B/W fixture README](../scripts/bw-save-fixtures/README.md).
The guest browser matrix covers file selection/drop, both titles, empty dex at
390px, preview counts, import-day fallback, creation/reload, cancellation,
storage failure/retry, duplicate confirmation, navigation and preparation
failure/retry/cancellation. Existing automated tests cover limits and account
changes. These are structural fixtures, not cartridge exports or evidence of a
legitimate in-game zero-caught save. Permitted real saves, a legitimate in-game
zero-caught save, live signed-in imports and mobile Safari remain unverified.
## X/Y verification

X/Y uses vendored reader 0.1.3 and the pack's 721-species National Dex limit,
already present in `IMPORT_SPECIES_LIMITS` on the pack branch. Four serialized
synthetic 415,232-byte fixtures cover caught and empty saves for both titles.
Native Core, independent raw-bit reads and the published WASM worker agree on
individual `X`/`Y` identities, complete National Dex coverage and 20 caught
species retained after removal from storage. The fixtures include starter
stages and National Dex boundaries 649/650 and 721. Three seen-only species
exercise female and shiny regions and stay uncaught. Both titles import and
reload exact caught state, preserving existing runs and input bytes. Zero-filled
and truncated files create nothing. Other Gen VI identities remain unmapped.

Gen VI exposes `GameTime6.SecondsToStart`, but reader 0.1.3 does not allowlist
this layout for dates. Populated and zero fields both omit `startDate` through
the published worker; imports use import day. Gen VI epoch/calendar bounds,
invalid values, leap days and exported recorded-date behavior remain unverified
for date import. No reader source, package, lockfile or tarball changed.

Reproduce with [the X/Y fixture README](../scripts/xy-save-fixtures/README.md).
The guest browser matrix covers selection/drop, both titles, empty dex at 390px,
preview counts, import-day fallback, creation/reload, cancellation, storage
failure/retry, duplicate confirmation, navigation and preparation
failure/retry/cancellation. Existing automated tests cover limits and account
changes. These structural fixtures are not in-game exports. Permitted real
cartridge/emulator exports, a legitimate in-game zero-caught save, live signed-in
imports, encrypted console backup extraction, mobile Safari and physical mobile
performance remain unverified.
## Diamond/Pearl verification

Diamond/Pearl uses vendored reader 0.1.3 and the pack's 493-species National
Dex limits, already present in `IMPORT_SPECIES_LIMITS` on the pack branch.
Eight serialized synthetic 512 KiB fixtures cover caught and empty saves for
DP, Platinum, HeartGold and SoulSilver. Native Core, independent raw-bit reads
and the published WASM worker agree on exact caught/seen arrays and complete
National Dex coverage. Nineteen caught species survive removal from storage,
including starter stages and species 386/387 and 493; seen-only Bulbasaur stays
uncaught. DP returns paired `D`/`P` candidates, so players choose the title.
File names do not determine that choice.

Gen IV shares a save family, but Core detects distinct general-block footer
sizes: DP `0xC100`, Platinum `0xCF2C`, HGSS `0xF628`. The worker returns `DP`,
`Pt`, `HG` and `SS` respectively. Platinum fixtures map only to Platinum; they never offer DP choices. HGSS imports retain their existing identities
and never offer DP choices. Zero-filled and truncated files create nothing.
These checks establish separation for the tested structural layouts, not every
corrupt, modified or regional save.

`SAV4.SecondsToStart` reads the general block at adventure info + `0x34`.
DP exposes that field, but reader 0.1.3 allowlists only HGSS within Gen IV.
Populated and zero DP fields both omit `startDate` through the worker; DP
imports use import day. DP date epoch/calendar bounds, invalid values, leap
days and exported recorded-date behavior need separate verification before
extending the allowlist. No reader source, package, lockfile or tarball changed.

Reproduce with [the DP fixture README](../scripts/dp-save-fixtures/README.md).
The guest browser matrix covers selection/drop, both DP choices, an empty dex
at 390px, exact preview counts, import-day fallback, creation/reload,
cancellation, storage failure/retry, duplicate confirmation, navigation and
preparation failure/retry/cancellation. Existing tests cover limits and account
changes. Input files/buffers and existing runs stay unchanged; no uploads occur.
These structural fixtures are not cartridge exports or proof of a legitimate
in-game zero-caught save. Permitted real cartridge/emulator exports, legitimate
in-game zero-caught saves, live signed-in imports, mobile Safari and physical
mobile performance remain unverified.
## Black 2/White 2 verification

Black 2/White 2 uses vendored reader 0.1.3 and the pack's existing 649-species
National Dex limits. Eight serialized synthetic 512 KiB fixtures cover caught
and empty saves for B, W, B2 and W2. Native Core, independent raw bits and the
published WASM worker agree on individual identities, complete National Dex
coverage and 19 caught species retained after removal from storage. Three
seen-only species exercise female/shiny regions and stay uncaught. Both sequel
titles import and reload exact flags; BW saves cannot create B2W2 runs.
Zero-filled and truncated files create nothing. Input files/buffers and existing
runs stay unchanged; the browser harness blocks external requests and uploads.

Gen V exposes `SAV5.SecondsToStart`, backed by the 64-bit adventure block field
at + `0x34` (the generic property narrows it to 32 bits). Reader 0.1.3 omits
Gen V dates. Populated and zero fields both omit `startDate` through WASM, so
imports use import day. Epoch/calendar bounds, invalid values, leap days and
exported recorded-date behavior need separate verification before allowlisting.
No reader source, package, lockfile or vendored tarball change is required.

Reproduce with [the B2W2 fixture README](../scripts/b2w2-save-fixtures/README.md).
Guest scenarios cover selection/drop, both titles, empty dex at 390px, counts,
creation/reload, cancellation, import-day fallback, storage failure/retry,
duplicate confirmation, navigation and preparation failure/retry/cancellation.
Automated tests cover species caps, limits, retries and account changes.
These structural fixtures are not cartridge exports or proof of legitimate
in-game zero-caught saves. Permitted real cartridge/emulator exports, legitimate
zero-caught saves, regional/corrupt/modified variants, live account imports,
mobile Safari and physical mobile performance remain unverified.

### Combining with Black/White import PR #108

Keep both independent `B`/`W` and `B2`/`W2` adapters, supported-game labels,
documentation rows/verification sections and mapping/guest tests. Shared edits
in `client/save-import.ts`, `docs/save-import.md` and both test files may need
text conflict resolution. Both packs already carry their species limits.
The fixture directories are separate. #108's final test currently asserts that
sequel identities map to no website games; change it to assert that they never
map to original BW titles. Its browser harness currently expects sequels to be
unsupported; after combining, verify their own sequel titles instead. This
harness accepts BW as its own original title once #108 lands, while
continuing to forbid BW-to-B2W2 identity substitution. Neither harness should
require the other pack to stay unsupported.
## Platinum verification

Platinum uses vendored reader 0.1.3 and the pack's existing 493-species import
limit. Eight serialized synthetic 512 KiB fixtures cover caught and empty saves
for Platinum, DP, HeartGold and SoulSilver. Native Core, independent raw flags
and the published WASM worker agree on exact caught/seen arrays, complete
National Dex coverage and distinct identities. Nineteen caught species survive
removal from storage; seen-only Bulbasaur stays uncaught. Platinum returns only
`Pt`, so it goes directly to preview without DP's title choice. Filenames do
not select the title. Zero-filled and truncated saves create nothing.

Gen IV layout detection uses different general-block footer sizes: DP `0xC100`,
Pt `0xCF2C`, HGSS `0xF628`. Tested DP saves cannot create Platinum playthroughs;
HGSS retains its own titles. This proves separation for tested structural
layouts, not every corrupt, modified or regional save.

`SAV4.SecondsToStart` exposes adventure info + `0x34`, but reader 0.1.3's Gen IV
date allowlist includes only HGSS. Populated and zero Pt fields both omit
`startDate` through WASM; imports use import day. Pt epoch/calendar bounds,
invalid values, leap days and exported recorded-date behavior need separate
verification before extending that allowlist. No reader source, package,
lockfile or vendored tarball change is needed.

Reproduce with [the Platinum fixture README](../scripts/pt-save-fixtures/README.md).
The guest browser matrix covers selection/drop, empty dex at 390px, exact
counts, creation/reload, cancellation, storage failure/retry, duplicate
confirmation, navigation and preparation failure/retry/cancellation. Application
tests cover caps, limits and account changes. Input files/buffers and existing
runs stay unchanged; no uploads occur. These fixtures are not cartridge exports
or proof of legitimate in-game zero-caught saves. Permitted real exports,
legitimate zero-caught saves, live signed-in imports, mobile Safari and physical
mobile performance remain unverified.

### Combining with Diamond/Pearl import PR #112

Keep separate `D`/`P` and `Pt` adapters, supported-game labels, documentation
rows/verification sections and mapping/guest tests. Both packs already carry
493-species limits. Shared edits in `client/save-import.ts`,
`docs/save-import.md`, `scripts/check_save_import.test.ts` and
`scripts/save_import_data.test.ts` may need text conflict resolution, alongside
the pack branches' shared files. A `git merge-tree` check also reports existing
pack conflicts in `OPEN_QUESTIONS.md`, `SOURCES.md`, `client/data/sprite-fit.ts`,
`client/game.ts`, `client/packs.ts`, `package.json`, `public/sitemap.xml`,
`scripts/access_audit.py`, `scripts/build_data.py`, `scripts/build_game_pages.ts`,
`scripts/fetch_pokeapi.py` and `scripts/fetch_sprites.py`. Preserve both packs'
entries when resolving them. `shared/save-import.ts` and `shared/versions.ts`
merge automatically in that check. Fixture directories are separate.
#112's final mapping test currently requires `Pt` to map to no website game;
change that assertion to require exactly `platinum`, retaining its DP rejection
checks. Its browser harness currently rejects Pt; change that case to import
only Platinum with no title choice. This Platinum harness already permits DP
under its own paired titles once #112 lands and forbids DP-to-Pt substitution.
Neither harness should require the sibling pack to stay unsupported.

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

GB/GBC fixture and website import results are recorded in
[Game Boy save validation](game-boy-save-validation.md). Red, Blue, Yellow, Gold
and Silver now have explicit website adapters, tested with caught and empty
saves. Green remains unsupported, and paired titles require a player choice.
