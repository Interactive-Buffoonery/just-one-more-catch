# Diamond/Pearl save-import fixtures

Opt-in validation of unchanged reader 0.1.2 and the built website. Generated
saves and receipts stay in ignored `.cache/dp-save-tests/`. No personal saves,
ROMs or downloaded fixtures are used.

Use .NET 10 and Core revision `02c9ec108fe3c96735f6c2397eaebc10e29a049f`:

```sh
dotnet run --project scripts/dp-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/dp-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/dp-save-fixtures/verify.mjs
```

Optionally set `CHROMIUM_EXECUTABLE` to an installed Chrome/Chromium executable.
`WORKER_ONLY=1` runs raw/native/published-worker checks without website imports.
The harness blocks external requests and closes its own browser/server.

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

Website checks cover selection, a misleadingly named `.srm` drop, Diamond and
Pearl choices, an empty DP preview at 390px, exact counts, creation/reload,
cancellation, import-day fallback, storage failure/retry, duplicate confirmation,
navigation and preparation failure/retry/cancellation. Both Platinum files
remain unsupported and create nothing. HGSS caught/empty imports retain their
own titles, with no DP choices. Existing runs stay unchanged and no uploads
occur. Receipts are `native-results.json`, `wasm-results.json` and
`website-results.json`. Automated import tests cover species limits, retry,
unsupported identities and account changes.

Pinned Core source references:

- `Saves/SAV4DP.cs`, `SAV4Pt.cs`, `SAV4HGSS.cs`: layouts and identities.
- `Saves/SAV4.cs`: checksums, storage and adventure-start field.
- `Saves/Substructures/PokeDex/Zukan4.cs`: National Dex bits and seen regions.
- `Saves/Util/SaveUtil.cs`: format-specific footer size/signature detection.

DP exposes `SecondsToStart` at general block + `0x34`, but reader 0.1.2 omits
dates for DP and Pt. Caught fixtures populate it; empty fixtures leave it zero.
Both must omit `startDate`. HGSS fixtures leave it zero; their existing date
support is covered separately by the reader's regression matrix. DP epoch,
calendar bounds, invalid values, leap days and exported date behavior require
separate verification before adding a date allowlist.

No reader source, package, lockfile or vendored tarball change is needed.
Reader source remains `8cc08fd58b9b148ecba9c9ef262703559e1979e1`.
Permitted real cartridge/emulator exports, legitimate in-game zero-caught
saves, regional/corrupt/modified save variants, live signed-in imports, mobile
Safari and physical mobile performance remain separate checks.
