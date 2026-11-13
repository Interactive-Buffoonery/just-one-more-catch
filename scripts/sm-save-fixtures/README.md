# Sun/Moon save-import fixtures

Opt-in validation of unchanged reader 0.1.2 and the built website. Generated
saves and receipts stay in ignored `.cache/sm-save-tests/`. No personal saves,
ROMs or downloaded fixtures are used.

Use .NET 10 and Core revision `02c9ec108fe3c96735f6c2397eaebc10e29a049f`:

```sh
dotnet run --project scripts/sm-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/sm-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/sm-save-fixtures/verify.mjs
```

Optionally set `CHROMIUM_EXECUTABLE` to an installed Chrome/Chromium executable.
`WORKER_ONLY=1` runs raw/native/published-worker checks without website imports.
The harness blocks external requests and closes its own browser/server.

The generator serializes caught/empty fixtures for SN, MN, US and UM. SM files
are 441,856 bytes; USUM files are 445,440 bytes. It sets the BEEF detection
footer required by Core's serialized detector; blank Core saves do not initialize
this metadata. Native re-reading requires the exact layout class, individual
title and valid checksums. Twenty caught SM species include starter stages,
721/722 and 802. USUM adds 803–807. Inserting then removing every Pokémon
leaves empty party/boxes while retaining caught history. Seen-only Bulbasaur,
Ivysaur and Venusaur exercise female, shiny male and shiny female bit regions.
These structural parser fixtures are not in-game exports or proof of a
legitimate in-game zero-caught save.

The independent raw checker uses dex offsets SM `0x2A00`, USUM `0x2C00`.
Caught flags start at dex + `0x88`; seen regions are `0xF0`, `0x17C`, `0x208`,
`0x294`. It checks the stored title at SM `0x1204`, USUM `0x1404` (30/31/32/33),
and adventure-start seconds at SM `0x4628`, USUM `0x4A28`. Caught fixtures store
2020-02-29 at noon relative to 2000-01-01; empty fixtures store zero. Native,
raw bits and published WASM agree on exact caught/seen arrays, complete
`national-dex` coverage, individual title and recorded/absent date. Worker
filenames deliberately do not identify the game. Zero-filled and truncated
files fail. Input buffers and file digests stay intact.

Website checks cover all four titles and their empty previews at 390px,
selection, misleadingly named `.srm` drop, exact counts, recorded date or import
day, creation/reload, cancellation, storage failure/retry, duplicate confirmation,
navigation and preparation failure/retry/cancellation. There is no title choice
for these individual identities. Existing runs stay unchanged and no uploads
occur. Mapping tests separately reject every other Gen VII title and combined
SM/USUM identities, and assert the 802/807 limits. Receipts are
`native-results.json`, `wasm-results.json` and `website-results.json`.

Pinned Core source references:

- `Saves/SAV7.cs`, `SAV7SM.cs`, `SAV7USUM.cs`: layouts and caught/seen access.
- `Saves/Access/SaveBlockAccessor7SM.cs`, `SaveBlockAccessor7USUM.cs`: offsets.
- `Saves/Substructures/PokeDex/Zukan7.cs`: National Dex bits and seen regions.
- `Saves/Substructures/Gen7/MyStatus7.cs`: stored title byte.
- `Saves/Substructures/Gen7/GameTime7.cs`: adventure-start seconds at `0x28`.
- `Util/DateUtil.cs`: 2000-01-01 epoch conversion without timezone shift.
- `Saves/Util/SaveUtil.cs`: sizes and BEEF footer detection.

The reader's existing native/browser matrix also tests Gen VII leap days,
calendar bounds and zero/out-of-range date omission. Reader source remains
`8cc08fd58b9b148ecba9c9ef262703559e1979e1`; no source, package, lockfile or
vendored tarball change is needed. Its regression assets must match the installed
vendor package byte for byte.

Permitted real SM/USUM exports, a legitimate in-game zero-caught save,
regional/modified/corrupt variants beyond these fixtures, live signed-in imports,
encrypted console backup extraction, mobile Safari and physical mobile
performance remain separate checks. See `docs/save-import.md` for expected
integration overlaps with X/Y import PR #111.
