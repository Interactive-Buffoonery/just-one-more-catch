# Save fixtures

We keep generated saves and receipts in the ignored cache. Fixtures are synthetic unless noted, as we have not tested every format with real saves. Never commit personal saves or ROMs.

## Shared setup

Install .NET 10 per user with Microsoft’s `dotnet-install.sh --channel 10.0`, rather than the Homebrew cask. Build `PKHeX.Core.dll` from Core revision `02c9ec108fe3c96735f6c2397eaebc10e29a049f` and replace `/absolute/path/to/PKHeX.Core.dll` in the commands below. Use an existing Playwright installation and Chromium.

The GB/GBC set uses `.cache/save-tests/`; other sets retain their own cache paths below. `CHROMIUM_EXECUTABLE` optionally selects an installed browser. Where supported, `WORKER_ONLY=1` runs raw/native/worker checks without website imports. Harnesses block external requests and close their own browser and server. Real saves, live account imports and mobile Safari need separate checks.


## GB/GBC

Manual, opt-in reader and website validation. Downloaded player saves and generated binaries
stay in the ignored `.cache/save-tests/` directory. The website harness exercises guest playthrough creation on a local build;
it does not contact a production backend.

1. Download the four public saves from `ncorgan/pksav-test-saves`, revision
   `e4d42e112cbb03b7e9f9424ab62931f953ef22d8`, into
   `.cache/save-tests/public/{red,yellow,gold,crystal}.sav`:
   `red_blue/pokemon_red.sav`, `yellow/pokemon_yellow.sav`,
   `gold_silver/pokemon_gold.sav`, `crystal/pokemon_crystal.sav`.
   Use `https://raw.githubusercontent.com/ncorgan/pksav-test-saves/<revision>/<path>`.
2. Create `.cache/save-tests/synthetic/`. With .NET 10, run (install it per user
   with Microsoft's `dotnet-install.sh --channel 10.0`; the Homebrew cask stops
   at a password prompt):

   ```sh
   dotnet run --project scripts/save-fixtures/GenerateGb.csproj \
     -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
     -- "$PWD/.cache/save-tests/synthetic"
   ```

   Use Core built from `02c9ec108fe3c96735f6c2397eaebc10e29a049f`, the
   reader 0.1.1 pin. The generator inserts Pikachu and Eevee, removes them from
   storage without changing dex history, and marks Bulbasaur seen-only. It also
   emits blank-dex variants. List terminators, Yellow's starter marker and
   checksums are initialized for serialized detection. These are structural
   parser fixtures, not proof of legitimate in-game zero-caught saves.
3. Build unmodified English Red from pret/pokered revision
   `130ac3fa5493fb29a8005e8439fd31b4826e46af` using RGBDS 1.0.4. Verify
   SHA-1 `ea9bcae617fdf159b045185467ae58b2e4a48b9a` before running it.
   In a local virtual environment with `pyboy==2.9.0` and `Pillow==13.0.0`, run:

   ```sh
   python scripts/save-fixtures/zero_red.py /absolute/path/to/pokered.gbc \
     .cache/save-tests/in-game
   ```

   Use a fresh output directory. This presses buttons through the introduction
   and uses the game's Save command before receiving a starter. Inspect
   `saved.png` for the saved-game confirmation. It exports cartridge RAM without
   memory edits. Neither ROMs nor saves belong in Git. Wall-clock bytes can vary.
4. From the website root, run `python3 scripts/save-fixtures/serve_gb.py`.
   Open the printed loopback port in the browser automation surface. Run:

   ```js
   await (await import('/harness/inspect_gb.js')).run()
   ```

   This loads the installed reader's actual worker/WASM, checks unchanged input
   buffers, and saves the result locally. The test server's `/report` POST writes
   only the local JSON receipt; this is not the production upload flow. Close the
   owned browser tab and stop the server after the check.
5. Run `python3 scripts/save-fixtures/check_gb_flags.py .cache/save-tests`.
   It independently decodes raw bitfields, validates checksums and exact identities,
   compares caught/seen arrays, checks empty storage and verifies absent start dates.

6. Build the website with `pnpm build`. With an existing Playwright installation
   and Chromium browser, run the full guest import matrix:

   ```sh
   PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
     node scripts/save-fixtures/website_gb.mjs .cache/save-tests
   ```

   The script owns and closes its loopback server and browser. It blocks external
   requests, imports all 15 files through the actual worker, verifies paired
   choices, exact caught state, start-date fallback, unchanged existing runs and
   reload persistence, then checks cancellation, invalid bytes and storage retry.
   Yellow runs at 390px; Silver's empty save uses drop. It writes only a local
   `website-results.json`. Run the raw checker first so public-save expected
   arrays are independently verified. No fixtures or ROMs are downloaded by this
   harness. These opt-in checks are separate from `pnpm test:convex`, which runs
   maintained adapter, guest and simulated-account persistence tests without
   external binaries.


## Black 2/White 2 save-import fixtures

```sh
dotnet run --project scripts/b2w2-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/b2w2-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/b2w2-save-fixtures/verify.mjs
```

The independent raw checker reads caught bits at dex + `0x8`, unions all four
seen regions at `0x5C`, `0xB0`, `0x104`, `0x158`, and checks the saved version byte
at `0x1941F`. The dex block is `0x21600` for BW and `0x21400` for B2W2. Native,
raw bits and published WASM must agree on exact arrays, complete `national-dex`
coverage and individual identities `B`, `W`, `B2`, `W2`. File names deliberately
do not identify the game to the worker. Zero-filled and truncated files fail.

- `Saves/SAV5.cs`: saved version, caught/seen access and checksums.
- `Saves/SAV5BW.cs`, `Saves/SAV5B2W2.cs`: distinct layout types.
- `Saves/Access/SaveBlockAccessor5BW.cs`, `SaveBlockAccessor5B2W2.cs`: block offsets.
- `Saves/Substructures/PokeDex/Zukan5.cs`: National Dex numbering/bit regions.
- `Saves/Substructures/Gen5/PlayerData5.cs`: stored title byte.
- `Saves/Util/SaveUtil.cs`: distinct BW/B2W2 footer detection.
- `Saves/Substructures/Gen5/AdventureInfo5.cs`: 64-bit `SecondsToStart`.

Gen V exposes an adventure-start field, but reader 0.1.3 intentionally omits it.
Caught fixtures populate that field and empty fixtures leave it zero; the worker
must omit `startDate` for both. Epoch, valid bounds, leap days, invalid-value
handling and exported recorded-date behavior have not been verified for a Gen V
reader allowlist. Use import day until that separate verification is complete.

## Black/White save-import fixtures

```sh
dotnet run --project scripts/bw-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/bw-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/bw-save-fixtures/verify.mjs
```

The independent raw checker reads caught bits at dex + `0x8`, unions all four
seen regions at `0x5C`, `0xB0`, `0x104`, `0x158`, and checks the saved version byte
at `0x1941F`. The dex block is `0x21600` for BW and `0x21400` for B2W2. Native,
raw bits and published WASM must agree on exact arrays, complete `national-dex`
coverage and individual identities `B`, `W`, `B2`, `W2`. File names deliberately
do not identify the game to the worker. Zero-filled and truncated files fail.

- `Saves/SAV5.cs`: saved version, caught/seen access and checksums.
- `Saves/SAV5BW.cs`, `Saves/SAV5B2W2.cs`: distinct layout types.
- `Saves/Access/SaveBlockAccessor5BW.cs`, `SaveBlockAccessor5B2W2.cs`: block offsets.
- `Saves/Substructures/PokeDex/Zukan5.cs`: National Dex numbering/bit regions.
- `Saves/Substructures/Gen5/PlayerData5.cs`: stored title byte.
- `Saves/Util/SaveUtil.cs`: distinct BW/B2W2 footer detection.
- `Saves/Substructures/Gen5/AdventureInfo5.cs`: 64-bit `SecondsToStart`.

Gen V exposes an adventure-start field, but reader 0.1.3 intentionally omits it.
Caught fixtures populate that field and empty fixtures leave it zero; the worker
must omit `startDate` for both. Epoch, valid bounds, leap days, invalid-value
handling and exported recorded-date behavior have not been verified for a Gen V
reader allowlist. Use import day until that separate verification is complete.

## Diamond/Pearl save-import fixtures

```sh
dotnet run --project scripts/dp-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/dp-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/dp-save-fixtures/verify.mjs
```

The generator serializes eight 524,288-byte saves: caught and empty variants
for `SAV4DP`, `SAV4Pt` and `SAV4HGSS` (HG and SS). Both general-block footers
have the format's size and international SDK signature, required by serialized
detection. It inserts and removes 19 species, including Sinnoh starter stages,
386/387 and 493. Caught flags survive with empty party/boxes. Bulbasaur is seen
only, with a female gender bit. Native re-reading requires exact layout class,
identity, checksums and caught/seen arrays. These are redistributable structural
parser fixtures, not in-game exports or legitimate in-game zero-caught saves.

The independent raw checker reads National Dex caught bits at dex + `0x4` and
seen bits at dex + `0x44`. Dex offsets are DP `0x12DC`, Pt `0x1328`, HGSS
`0x12B8`. It also checks the general footer size and SDK signature in both
partitions. Distinct general sizes are DP `0xC100`, Pt `0xCF2C`, HGSS `0xF628`.
Native, raw and published WASM must agree on exact arrays, complete
`national-dex` coverage and identities `DP`, `Pt`, `HG`, `SS`. The DP candidate
list must be `D`, `P`; the website requires the player to choose. The worker
receives an unrelated filename. Zero-filled and half-size truncated files fail.
Input buffers and file digests stay intact.

- `Saves/SAV4DP.cs`, `SAV4Pt.cs`, `SAV4HGSS.cs`: layouts and identities.
- `Saves/SAV4.cs`: checksums, storage and adventure-start field.
- `Saves/Substructures/PokeDex/Zukan4.cs`: National Dex bits and seen regions.
- `Saves/Util/SaveUtil.cs`: format-specific footer size/signature detection.

DP exposes `SecondsToStart` at general block + `0x34`, but reader 0.1.3 omits
dates for DP and Pt. Caught fixtures populate it; empty fixtures leave it zero.
Both must omit `startDate`. HGSS fixtures leave it zero; their existing date
support is covered separately by the reader's regression matrix. DP epoch,
calendar bounds, invalid values, leap days and exported date behavior require
separate verification before adding a date allowlist.

## Emerald save-import fixtures

```sh
dotnet run --project scripts/emerald-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/emerald-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/emerald-save-fixtures/verify.mjs
```

The generator uses pinned Core's `SAV3E`, sector footers and version-detection
fields. It inserts and removes 14 species from storage, retaining their caught
history, and sets Bulbasaur as seen only. It verifies serialized checksums,
identity, exact flags and empty storage through Core before exporting bytes.
These are synthetic parser fixtures, not evidence of an in-game playthrough.

The checks compare raw National Dex bits in the newest section 0 (`0x28` caught,
`0x5C` seen) with native and published worker results. The rotated fixture has
an older empty Pokédex and a newer populated save in the second slot, with the
sectors rotated three places. The website tests file selection, `.srm` drop,
the preview, creation, reload, cancellation and preserving an existing run.
They include empty Pokédex previews at a 390px viewport, valid 64 KiB saves
with ordered or rotated sections, their recovery warning, and rejected damaged
64 KiB files (bad checksum, missing/duplicate section, bad signature and mixed
counters). Readable Ruby/Sapphire requires a paired game choice before creating a playthrough.
They assert unchanged input files/buffers and no upload requests.

- `Saves/SAV3.cs`: sector layout, active slot, checksums and National Dex flags.
- `Saves/SAV3E.cs`: Emerald identity and storage blocks.
- `Saves/Util/SaveUtil.cs`: serialized save detection and 128 KiB requirement.
- `Saves/Blocks/Gen3/SaveBlock3SmallE.cs`: Emerald security key.

Original fixture-generation source is pinned at `8cc08fd58b9b148ecba9c9ef262703559e1979e1`.
The fork adds validated half-size Emerald recovery; Core and its pin are unchanged.
The harness writes `native-results.json`, `wasm-results.json` and
`website-results.json` locally. Real player saves, signed-in account imports
and mobile Safari remain separate checks; do not commit personal saves.


## ORAS save-import fixtures

```sh
dotnet run --project scripts/oras-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/oras-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/oras-save-fixtures/verify.mjs
```

The generator serializes eight caught/empty saves for OR, AS, X and Y. ORAS
files are 483,328 bytes (`SAV6AO`); XY files are 415,232 bytes (`SAV6XY`). It sets
the BEEF footer required by Core's detector; blank Core saves do not initialize
this metadata. Re-reading requires the exact title, layout class and valid
checksums. Twenty caught species include starter stages, 649/650 and 721.
Inserting then removing each Pokémon leaves empty party/boxes while retaining
caught history. Seen-only Bulbasaur, Ivysaur and Venusaur exercise female,
shiny male and shiny female regions. These are structural parser fixtures,
not in-game exports or proof of a legitimate in-game zero-caught save.

The independent raw checker reads caught bits at dex + `0x8` and unions seen
regions at `0x68`, `0xC8`, `0x128`, `0x188`. Both layouts have dex at `0x15000`
and title at `0x14004`: X=24, Y=25, AS=26, OR=27. It checks file sizes and
adventure-start seconds at `0x1218`: caught fixtures store `0x12345678` and
empty fixtures store zero. Native, raw bits and published WASM must agree on
exact arrays, individual title and complete `national-dex` coverage. Worker
filenames deliberately do not identify the game. Both populated and zero date
fields must omit `startDate`; Gen VI dates are outside the reader's allowlist.
Zero-filled and truncated files fail. Input buffers and file digests stay intact.

- `Saves/SAV6AO.cs`, `SAV6XY.cs`: layouts, National Dex getters and valid titles.
- `Saves/Access/SaveBlockAccessor6AO.cs`, `SaveBlockAccessor6XY.cs`: block offsets.
- `Saves/Substructures/PokeDex/Zukan6.cs`: caught bits and seen regions.
- `Saves/Substructures/Gen6/MyStatus6.cs`: stored title byte.
- `Saves/Substructures/Gen6/GameTime6.cs`: adventure-start field at `0x18`.
- `Saves/Util/SaveUtil.cs`: sizes and BEEF footer detection.

## Platinum save-import fixtures

```sh
dotnet run --project scripts/pt-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/pt-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/pt-save-fixtures/verify.mjs
```

The independent raw checker reads National Dex caught bits at dex + `0x4` and
seen bits at dex + `0x44`. Dex offsets are DP `0x12DC`, Pt `0x1328`, HGSS
`0x12B8`. General-block sizes are DP `0xC100`, Pt `0xCF2C`, HGSS `0xF628`.
Both partition footers are checked. Native, raw and published WASM must agree
on exact flags, complete `national-dex` coverage and identities `DP`, `Pt`,
`HG`, `SS`. DP candidates are `D`/`P`; Platinum has only `Pt` and needs no title
choice. The worker receives an unrelated filename. Zero-filled and half-size
truncated files fail. Input buffers and file digests stay intact.

- `Saves/SAV4DP.cs`, `SAV4Pt.cs`, `SAV4HGSS.cs`: layouts and identities.
- `Saves/SAV4.cs`: checksums, storage and adventure-start field.
- `Saves/Substructures/PokeDex/Zukan4.cs`: National Dex bits and seen regions.
- `Saves/Util/SaveUtil.cs`: footer size/signature detection.

`SAV4.SecondsToStart` reads adventure info + `0x34`. Caught DP/Pt fixtures
populate it and empty fixtures leave zero. Reader 0.1.3 omits both; Platinum
uses import day. Pt epoch/calendar bounds, invalid values, leap days and
exported recorded dates need separate checks before extending the allowlist.
HGSS date support is covered by the reader's existing regression matrix.

## Ruby/Sapphire save-import fixtures

```sh
dotnet run --project scripts/rs-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/rs-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/rs-save-fixtures/verify.mjs
```

The generator uses pinned Core's `SAV3RS`, valid sector footers and checksums.
It inserts and removes 14 species, retains their caught flags, and sets
Bulbasaur seen-only. Native re-reading verifies empty storage, exact flags,
checksums and `RS` identity. The structural empty-dex fixture has no caught or
seen flags. These are redistributable synthetic parser fixtures, not evidence
of an in-game playthrough or legitimate in-game zero-caught save.

The raw checker independently reads National Dex bits at section 0 offsets
`0x28` (caught) and `0x5C` (seen). The actual packaged WASM worker must return
`RS` with candidates `S`, `R`, complete `national-dex` coverage, those exact
flags and no start date. The rotated fixture has an older empty first slot and
newer populated second slot, with sections rotated three places. A truncated
64 KiB synthetic fixture must be rejected, with no playthrough created.

- `Saves/SAV3RS.cs`: paired identity and RS blocks.
- `Saves/SAV3.cs`: sectors, checksums and National Dex flag access.
- `Saves/Util/SaveUtil.cs`: serialized detection and 128 KiB requirement.

## Sun/Moon save-import fixtures

```sh
dotnet run --project scripts/sm-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/sm-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/sm-save-fixtures/verify.mjs
```

The independent raw checker uses dex offsets SM `0x2A00`, USUM `0x2C00`.
Caught flags start at dex + `0x88`; seen regions are `0xF0`, `0x17C`, `0x208`,
`0x294`. It checks the stored title at SM `0x1204`, USUM `0x1404` (30/31/32/33),
and adventure-start seconds at SM `0x4628`, USUM `0x4A28`. Caught fixtures store
2020-02-29 at noon relative to 2000-01-01; empty fixtures store zero. Native,
raw bits and published WASM agree on exact caught/seen arrays, complete
`national-dex` coverage, individual title and recorded/absent date. Worker
filenames deliberately do not identify the game. Zero-filled and truncated
files fail. Input buffers and file digests stay intact.

- `Saves/SAV7.cs`, `SAV7SM.cs`, `SAV7USUM.cs`: layouts and caught/seen access.
- `Saves/Access/SaveBlockAccessor7SM.cs`, `SaveBlockAccessor7USUM.cs`: offsets.
- `Saves/Substructures/PokeDex/Zukan7.cs`: National Dex bits and seen regions.
- `Saves/Substructures/Gen7/MyStatus7.cs`: stored title byte.
- `Saves/Substructures/Gen7/GameTime7.cs`: adventure-start seconds at `0x28`.
- `Util/DateUtil.cs`: 2000-01-01 epoch conversion without timezone shift.
- `Saves/Util/SaveUtil.cs`: sizes and BEEF footer detection.

The reader's existing native/browser matrix also tests Gen VII leap days,
calendar bounds and zero/out-of-range date omission. Vendored reader source:
`d666c67dc4d6d11603cdf50b13f4c431c0b95668` (0.1.3); no source, package, lockfile or
vendored tarball change is needed. Its regression assets must match the installed
vendor package byte for byte.

## X/Y save-import fixtures

```sh
dotnet run --project scripts/xy-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/xy-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/xy-save-fixtures/verify.mjs
```

The generator serializes four 415,232-byte `SAV6XY` saves: caught and empty
variants for X and Y. It sets the BEEF detection footer required by Core's
serialized detector; blank Core saves do not initialize this metadata. All
serialized block checksums must pass. It inserts and removes 20 species,
including starter stages, 649/650 and 721, retaining caught history with empty
party/boxes. Seen-only Bulbasaur, Ivysaur and Venusaur exercise female and shiny
regions. Native re-reading requires exact identity, class, checksums and flags.
These are redistributable structural parser fixtures, not in-game exports or
proof of a legitimate in-game zero-caught save.

The independent raw checker reads caught bits at dex + `0x8` and unions seen
regions at `0x68`, `0xC8`, `0x128`, `0x188`. The dex block is at `0x15000`;
the stored title byte at `0x14004` is 24 for X and 25 for Y. Native, raw bits
and the published WASM must agree on exact arrays, individual title and complete
`national-dex` coverage. Worker filenames deliberately do not identify the game.
Zero-filled and truncated saves fail. Input buffers and file digests stay intact.

- `Saves/SAV6XY.cs`: layout, caught/seen access and valid titles.
- `Saves/Access/SaveBlockAccessor6XY.cs`: dex/status block offsets.
- `Saves/Substructures/PokeDex/Zukan6.cs`: National Dex bits and seen regions.
- `Saves/Substructures/Gen6/MyStatus6.cs`: stored title byte.
- `Saves/Substructures/Gen6/GameTime6.cs`: adventure-start seconds.
- `Saves/Util/SaveUtil.cs`: size and BEEF footer detection.

Gen VI exposes an adventure-start field, but reader 0.1.3 intentionally omits it.
Caught fixtures populate it and empty fixtures leave it zero; both must omit
`startDate`. Epoch/calendar bounds, invalid values, leap days and exported date
behavior need separate verification before a Gen VI date allowlist is added.

## GB/GBC provenance

The files came from [PKSav's public test-save collection](https://github.com/ncorgan/pksav-test-saves/tree/e4d42e112cbb03b7e9f9424ab62931f953ef22d8).
Its README explicitly welcomes other users of the saves. Downloads are pinned to
that revision and remain outside Git in `.cache/save-tests/public/`. Only hashes,
counts and provenance are committed in [the receipt](game-boy-save-fixtures.json).
Project Pokémon's base-save listing and download returned HTTP 403; no block was
bypassed and no files from that listing were used.

Fixture generation, the local browser harness and raw verification are retained
under [scripts/save-fixtures](../scripts/save-fixtures/). The raw checker
reads saved bitfields directly instead of calling PKHeX or trusting reported
totals. Offset and checksum references are pinned Core's
`Saves/Substructures/Gen12/SAV1Offsets.cs`, `SAV2Offsets.cs`, `Saves/SAV1.cs`
and `Saves/SAV2.cs`. The shipped reader source is
`5263b86e798e9e189c1d71a127b0192ec4828b88`, with `sourceDirty: false`.
