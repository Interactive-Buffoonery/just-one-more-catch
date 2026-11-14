# Save fixtures

We keep saves and local receipts in ignored cache directories because fixtures can contain private data. Never commit personal saves or ROMs. Fixtures are synthetic unless noted; they prove parser structure, not legitimate in-game zero-caught playthroughs.

## Shared setup

Install .NET 10 per user with Microsoft's `dotnet-install.sh --channel 10.0`, rather than the Homebrew cask. Build `PKHeX.Core.dll` from Core revision `02c9ec108fe3c96735f6c2397eaebc10e29a049f` (the reader 0.1.1 pin), then replace `/absolute/path/to/PKHeX.Core.dll` below with its path.

Use an existing Playwright installation and Chromium. `PLAYWRIGHT_MODULE` points to that installation; `CHROMIUM_EXECUTABLE` optionally selects an installed browser. Where supported, `WORKER_ONLY=1` runs raw/native/worker checks without website imports. Each set keeps its outputs under the ignored `.cache/` path in its commands; GB/GBC uses `.cache/save-tests/`.

The non-GB sets share the same steps: generate saves, build the website, then run their verifier. Their native checks, independent raw-bit checks and published WASM must agree on exact caught/seen arrays, identities and complete `national-dex` coverage. Unrelated worker filenames must not influence detection; zero-filled and truncated files must fail, and input buffers and file digests must remain unchanged. Harnesses block external requests and close their own browser and loopback server. Receipts such as `native-results.json`, `wasm-results.json` and `website-results.json` stay local.

Real player saves, live signed-in account imports and mobile Safari need separate checks. The opt-in harnesses do not download fixtures or ROMs. `pnpm test:convex` separately covers maintained adapter, guest and simulated-account persistence without external binaries.

## GB/GBC

This set covers Red, Blue, Yellow, Gold, Silver and Crystal with public saves, synthetic caught/blank-dex saves and an in-game Red save made before receiving a starter. The website matrix imports all 15 files through the actual worker and checks paired choices, caught state, date fallback, unchanged existing runs, reload persistence, cancellation, invalid bytes and storage retry; Yellow uses 390px and Silver's empty save uses drop.

1. Download the four public saves from `ncorgan/pksav-test-saves`, revision `e4d42e112cbb03b7e9f9424ab62931f953ef22d8`, into `.cache/save-tests/public/{red,yellow,gold,crystal}.sav`: `red_blue/pokemon_red.sav`, `yellow/pokemon_yellow.sav`, `gold_silver/pokemon_gold.sav`, `crystal/pokemon_crystal.sav`. Use `https://raw.githubusercontent.com/ncorgan/pksav-test-saves/<revision>/<path>`.
2. Create `.cache/save-tests/synthetic/`, then run:

   ```sh
   dotnet run --project scripts/save-fixtures/GenerateGb.csproj \
     -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
     -- "$PWD/.cache/save-tests/synthetic"
   ```

   The generator inserts then removes Pikachu and Eevee, leaves Bulbasaur seen-only and emits blank-dex variants. List terminators, Yellow's starter marker and checksums support serialized detection.
3. Build unmodified English Red from pret/pokered revision `130ac3fa5493fb29a8005e8439fd31b4826e46af` using RGBDS 1.0.4. Verify SHA-1 `ea9bcae617fdf159b045185467ae58b2e4a48b9a`. In a local virtual environment with `pyboy==2.9.0` and `Pillow==13.0.0`, run:

   ```sh
   python scripts/save-fixtures/zero_red.py /absolute/path/to/pokered.gbc \
     .cache/save-tests/in-game
   ```

   Use a fresh output directory and inspect `saved.png` for confirmation. The script presses buttons and exports cartridge RAM without memory edits; wall-clock bytes can vary.
4. From the website root, run `python3 scripts/save-fixtures/serve_gb.py`. Open its printed loopback port in the browser automation surface, then run:

   ```js
   await (await import('/harness/inspect_gb.js')).run()
   ```

   This checks the installed worker/WASM and unchanged input buffers. `/report` POST writes only the local JSON receipt. Close the owned tab and stop the server afterward.
5. Run `python3 scripts/save-fixtures/check_gb_flags.py .cache/save-tests` before the website matrix. It independently verifies public-save arrays, raw bitfields, checksums, exact identities, empty storage and absent start dates.
6. Build with `pnpm build`, then run the guest website matrix:

   ```sh
   PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
     node scripts/save-fixtures/website_gb.mjs .cache/save-tests
   ```

## Shared coverage and source references

BW and B2W2 use the same checks: caught bits at dex + `0x8`, seen regions `0x5C`, `0xB0`, `0x104`, `0x158`, title byte `0x1941F`; dex blocks are BW `0x21600`, B2W2 `0x21400`. Identities must be `B`, `W`, `B2`, `W2`. Reader 0.1.3 omits Gen V `startDate` for populated and zero `SecondsToStart`; use import day until epoch, bounds, leap days, invalid values and exported recorded dates are verified.

DP and Pt share eight 524,288-byte caught/empty `SAV4DP`, `SAV4Pt`, `SAV4HGSS` fixtures with empty storage, 19 species including starter stages, 386/387 and 493, and female seen-only Bulbasaur. Caught bits are dex + `0x4`, seen bits dex + `0x44`; dex offsets are DP `0x12DC`, Pt `0x1328`, HGSS `0x12B8`. Both partitions need the international SDK footer signature and general sizes DP `0xC100`, Pt `0xCF2C`, HGSS `0xF628`. Identities are `DP`, `Pt`, `HG`, `SS`; DP requires `D`/`P` choice, Pt requires none. Half-size files fail. `SAV4.SecondsToStart` reads adventure info + `0x34`. Reader 0.1.3 omits DP/Pt dates even when adventure info/general block + `0x34` is populated; verify epoch, calendar bounds, invalid/zero values, leap days and exported dates before extending the allowlist. HGSS leaves zero here; its date support has separate reader regression coverage.

Emerald (`SAV3E`) and RS (`SAV3RS`) retain caught history for 14 inserted/removed species, seen-only Bulbasaur and empty storage. Raw National Dex bits are in newest section 0 at `0x28` caught and `0x5C` seen. Rotated fixtures have an older empty first slot and newer populated second slot with sectors rotated three places. RS returns `RS`, candidates `S`, `R`, and no date; its truncated 64 KiB fixture must create no playthrough. Emerald tests valid ordered/rotated 64 KiB recovery and its warning, and rejects bad checksums, missing/duplicate sections, bad signatures and mixed counters. Its website checks selection, `.srm` drop, preview, creation, reload, cancellation, existing-run preservation and empty previews at 390px; readable Ruby/Sapphire still requires a paired choice. Original fixture source: `8cc08fd58b9b148ecba9c9ef262703559e1979e1`; half-size recovery leaves Core and its pin unchanged.

XY and ORAS share Gen VI checks: caught bits dex + `0x8`, seen regions `0x68`, `0xC8`, `0x128`, `0x188`, dex `0x15000`, title `0x14004` (X=24, Y=25, AS=26, OR=27). XY has four 415,232-byte `SAV6XY` saves; ORAS has eight including 483,328-byte `SAV6AO` saves. The BEEF detection footer and serialized block checksums must be valid. Twenty inserted/removed species include starters, 649/650 and 721; seen-only Bulbasaur, Ivysaur and Venusaur cover female, shiny male and shiny female regions. Adventure-start seconds at `0x1218` are `0x12345678` or zero; both must omit `startDate` in reader 0.1.3 until Gen VI epoch/calendar bounds, invalid values, leap days and exported dates are verified.

The vendored reader source is `d666c67dc4d6d11603cdf50b13f4c431c0b95668` (0.1.3); its regression assets must match the installed vendor package byte for byte. No source, package, lockfile or vendored tarball change is needed for these checks. SM also covers USUM: dex SM `0x2A00`, USUM `0x2C00`; caught dex + `0x88`, seen `0xF0`, `0x17C`, `0x208`, `0x294`; title SM `0x1204`, USUM `0x1404` (30/31/32/33); adventure start SM `0x4628`, USUM `0x4A28`. Caught fixtures store 2020-02-29 at noon relative to 2000-01-01, empty fixtures zero. Check recorded/absent dates without timezone shifts; the reader matrix also covers leap days, calendar bounds and invalid values.

These pinned Core paths explain the checks above:

- `Saves/SAV5.cs`: saved version, caught/seen access and checksums. `Saves/SAV5BW.cs`, `Saves/SAV5B2W2.cs`: distinct layout types. `Saves/Access/SaveBlockAccessor5BW.cs`, `SaveBlockAccessor5B2W2.cs`: block offsets. `Saves/Substructures/PokeDex/Zukan5.cs`: National Dex numbering/bit regions. `Saves/Substructures/Gen5/PlayerData5.cs`: stored title byte. `Saves/Util/SaveUtil.cs`: distinct BW/B2W2 footer detection. `Saves/Substructures/Gen5/AdventureInfo5.cs`: 64-bit `SecondsToStart`.
- `Saves/SAV4DP.cs`, `SAV4Pt.cs`, `SAV4HGSS.cs`: layouts and identities. `Saves/SAV4.cs`: checksums, storage and adventure-start field. `Saves/Substructures/PokeDex/Zukan4.cs`: National Dex bits and seen regions. `Saves/Util/SaveUtil.cs`: format-specific footer size/signature detection.
- `Saves/SAV3.cs`: sector layout, active slot, checksums and National Dex flags. `Saves/SAV3E.cs`: Emerald identity and storage blocks. `Saves/Util/SaveUtil.cs`: serialized save detection and 128 KiB requirement. `Saves/Blocks/Gen3/SaveBlock3SmallE.cs`: Emerald security key.
- `Saves/SAV6AO.cs`, `SAV6XY.cs`: layouts, National Dex getters and valid titles. `Saves/Access/SaveBlockAccessor6AO.cs`, `SaveBlockAccessor6XY.cs`: block offsets. `Saves/Substructures/PokeDex/Zukan6.cs`: caught bits and seen regions. `Saves/Substructures/Gen6/MyStatus6.cs`: stored title byte. `Saves/Substructures/Gen6/GameTime6.cs`: adventure-start field at `0x18`. `Saves/Util/SaveUtil.cs`: sizes and BEEF footer detection.
- `Saves/Util/SaveUtil.cs`: footer size/signature detection. `Saves/SAV3RS.cs`: paired identity and RS blocks. `Saves/SAV3.cs`: sectors, checksums and National Dex flag access. `Saves/Util/SaveUtil.cs`: serialized detection and 128 KiB requirement.
- `Saves/SAV7.cs`, `SAV7SM.cs`, `SAV7USUM.cs`: layouts and caught/seen access. `Saves/Access/SaveBlockAccessor7SM.cs`, `SaveBlockAccessor7USUM.cs`: offsets. `Saves/Substructures/PokeDex/Zukan7.cs`: National Dex bits and seen regions.
- `Saves/Substructures/Gen7/MyStatus7.cs`: stored title byte. `Saves/Substructures/Gen7/GameTime7.cs`: adventure-start seconds at `0x28`. `Util/DateUtil.cs`: 2000-01-01 epoch conversion without timezone shift. `Saves/SAV6XY.cs`: layout, caught/seen access and valid titles. `Saves/Access/SaveBlockAccessor6XY.cs`: dex/status block offsets. `Saves/Substructures/PokeDex/Zukan6.cs`: National Dex bits and seen regions. `Saves/Substructures/Gen6/GameTime6.cs`: adventure-start seconds.
- `Saves/Util/SaveUtil.cs`: size and BEEF footer detection.

## Black 2/White 2

These fixtures cover original and sequel Gen V identities and verify that both populated and empty start fields stay absent from reader output.

```sh
dotnet run --project scripts/b2w2-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/b2w2-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/b2w2-save-fixtures/verify.mjs
```

## Black/White

This set shares the Gen V coverage above, including distinct original/sequel layouts and stored title detection.

```sh
dotnet run --project scripts/bw-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/bw-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/bw-save-fixtures/verify.mjs
```

## Diamond/Pearl

This set covers DP, Pt and HGSS layouts, caught history with empty storage, paired DP choices and omitted DP/Pt dates.

```sh
dotnet run --project scripts/dp-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/dp-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/dp-save-fixtures/verify.mjs
```

## Emerald

This set covers Emerald identity, rotated slots, validated half-size recovery and guest website imports.

```sh
dotnet run --project scripts/emerald-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/emerald-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/emerald-save-fixtures/verify.mjs
```

## ORAS

This set covers OR, AS, X and Y with individual titles, caught/seen regions and omitted Gen VI dates.

```sh
dotnet run --project scripts/oras-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/oras-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/oras-save-fixtures/verify.mjs
```

## Platinum

This set shares the DP/Pt coverage above, including single-title Platinum detection and import-day fallback.

```sh
dotnet run --project scripts/pt-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/pt-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/pt-save-fixtures/verify.mjs
```

## Ruby/Sapphire

This set covers paired Ruby/Sapphire identity, rotated saves, empty dex and rejection of truncated files.

```sh
dotnet run --project scripts/rs-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/rs-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/rs-save-fixtures/verify.mjs
```

## Sun/Moon

This set covers SM and USUM individual titles, caught/seen arrays and recorded or absent dates.

```sh
dotnet run --project scripts/sm-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/sm-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/sm-save-fixtures/verify.mjs
```

## X/Y

This set shares the Gen VI coverage above for X and Y, including valid detection footers and omitted dates.

```sh
dotnet run --project scripts/xy-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/xy-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/xy-save-fixtures/verify.mjs
```

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
