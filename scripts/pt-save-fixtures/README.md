# Platinum save-import fixtures

Opt-in validation of unchanged reader 0.1.2 and the built website. Generated
saves and receipts stay in ignored `.cache/pt-save-tests/`. No personal saves,
ROMs or downloaded fixtures are used. This separate directory can land beside
Diamond/Pearl import PR #112.

Use .NET 10 and Core revision `02c9ec108fe3c96735f6c2397eaebc10e29a049f`:

```sh
dotnet run --project scripts/pt-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/pt-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/pt-save-fixtures/verify.mjs
```

Optionally set `CHROMIUM_EXECUTABLE` to an installed Chrome/Chromium executable.
`WORKER_ONLY=1` runs raw/native/published-worker checks without website imports.
The harness blocks external requests and closes its own browser/server.

The generator follows #112's eight serialized 524,288-byte fixtures: caught
and empty variants for `SAV4DP`, `SAV4Pt` and `SAV4HGSS` (HG and SS). Both
partitions contain the layout's general-block size and international SDK
signature. It inserts and removes 19 species, including Sinnoh starter stages,
386/387 and 493. Caught flags survive empty party/boxes; Bulbasaur stays seen
only, with a female gender bit. Native re-reading requires exact layout class,
identity, valid checksums and caught/seen arrays. These structural fixtures are
not cartridge exports or proof of a legitimate in-game zero-caught save.

The independent raw checker reads National Dex caught bits at dex + `0x4` and
seen bits at dex + `0x44`. Dex offsets are DP `0x12DC`, Pt `0x1328`, HGSS
`0x12B8`. General-block sizes are DP `0xC100`, Pt `0xCF2C`, HGSS `0xF628`.
Both partition footers are checked. Native, raw and published WASM must agree
on exact flags, complete `national-dex` coverage and identities `DP`, `Pt`,
`HG`, `SS`. DP candidates are `D`/`P`; Platinum has only `Pt` and needs no title
choice. The worker receives an unrelated filename. Zero-filled and half-size
truncated files fail. Input buffers and file digests stay intact.

Website checks cover selection, misleadingly named `.srm` drop, empty Platinum
at 390px, exact counts, creation/reload, cancellation, import-day fallback,
storage failure/retry, duplicate confirmation, navigation and preparation
failure/retry/cancellation. HGSS retains its own titles. DP is unsupported on
this branch; when #112's adapter is present, the same harness requires the
Diamond/Pearl choice and imports DP only under those titles. Neither layout
may become the other title. Existing runs stay unchanged and no uploads occur.
Receipts are `native-results.json`, `wasm-results.json`, `website-results.json`.
Application tests cover species caps, playthrough limits and account changes.

Pinned Core source references:

- `Saves/SAV4DP.cs`, `SAV4Pt.cs`, `SAV4HGSS.cs`: layouts and identities.
- `Saves/SAV4.cs`: checksums, storage and adventure-start field.
- `Saves/Substructures/PokeDex/Zukan4.cs`: National Dex bits and seen regions.
- `Saves/Util/SaveUtil.cs`: footer size/signature detection.

`SAV4.SecondsToStart` reads adventure info + `0x34`. Caught DP/Pt fixtures
populate it and empty fixtures leave zero. Reader 0.1.2 omits both; Platinum
uses import day. Pt epoch/calendar bounds, invalid values, leap days and
exported recorded dates need separate checks before extending the allowlist.
HGSS date support is covered by the reader's existing regression matrix.

Reader source remains `8cc08fd58b9b148ecba9c9ef262703559e1979e1`. No reader,
package, lockfile or tarball change is needed. Permitted real exports,
legitimate in-game zero-caught saves, regional/corrupt/modified variants,
live signed-in imports, mobile Safari and physical mobile performance remain
separate checks. See `docs/save-import.md` for #112 integration instructions.
