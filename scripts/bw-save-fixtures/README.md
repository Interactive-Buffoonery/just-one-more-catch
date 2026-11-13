# Black/White save-import fixtures

Opt-in validation of the unchanged published reader 0.1.3 and built website.
Generated saves and receipts stay in ignored `.cache/bw-save-tests/`. These
fixtures use no personal saves, ROMs or downloaded game data.

Use .NET 10 and Core revision `02c9ec108fe3c96735f6c2397eaebc10e29a049f`:

```sh
dotnet run --project scripts/bw-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/bw-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/bw-save-fixtures/verify.mjs
```

Optionally set `CHROMIUM_EXECUTABLE` to an installed Chrome/Chromium executable.
`WORKER_ONLY=1` runs the raw/native/published-worker gate before enabling website
mappings. The harness blocks external requests and closes its own browser/server.

The generator serializes eight 512 KiB saves: caught and empty variants for B,
W, B2 and W2. It inserts then removes 19 species, including starter evolution
stages and National Dex boundaries 493/494 and 649. Seen-only Bulbasaur, Ivysaur
and Venusaur exercise the female and shiny seen regions. Native re-reading
requires exact identity, layout class, checksums, flags and empty storage.
These are redistributable structural parser fixtures, not in-game exports or
proof of a legitimate in-game zero-caught save.

The independent raw checker reads caught bits at dex + `0x8`, unions all four
seen regions at `0x5C`, `0xB0`, `0x104`, `0x158`, and checks the saved version byte
at `0x1941F`. The dex block is `0x21600` for BW and `0x21400` for B2W2. Native,
raw bits and published WASM must agree on exact arrays, complete `national-dex`
coverage and individual identities `B`, `W`, `B2`, `W2`. File names deliberately
do not identify the game to the worker. Zero-filled and truncated files fail.

Website checks exercise selection, a misleadingly named `.srm` drop, both games,
both empty dex variants at 390px, exact counts, creation/reload, cancellation,
import-day fallback, storage failure/retry, duplicate confirmation, navigation,
preparation failure/retry and cancellation during preparation. All sequel files
must remain unsupported, with no create button or new run. Existing runs and
input digests remain unchanged; no uploads occur. Receipts are
`native-results.json`, `wasm-results.json` and `website-results.json`.

Pinned Core source references:

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

No reader source, package, lockfile or vendored tarball changes are needed.
Vendored reader source: `d666c67dc4d6d11603cdf50b13f4c431c0b95668` (0.1.3).
Permitted real cartridge/emulator exports, a legitimate in-game zero-caught save,
live signed-in imports and mobile Safari remain separate checks.
