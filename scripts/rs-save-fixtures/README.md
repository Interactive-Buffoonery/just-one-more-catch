# Ruby/Sapphire save-import fixtures

Opt-in validation of vendored reader 0.1.3 and the built website. Generated
saves and JSON receipts stay in ignored `.cache/rs-save-tests/`. No personal
saves, ROMs or downloaded fixtures are used.

Use .NET 10 and Core revision `02c9ec108fe3c96735f6c2397eaebc10e29a049f`:

```sh
dotnet run --project scripts/rs-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/rs-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/rs-save-fixtures/verify.mjs
```

Optionally set `CHROMIUM_EXECUTABLE` to an installed Chrome/Chromium executable.
`WORKER_ONLY=1` runs the raw/native/published-worker gate without website imports.
The harness closes its own local server and browser and blocks external requests.

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

Website checks select Ruby for caught/empty saves and Sapphire for the rotated
`.srm` drop (deliberately named without a title). They verify the required paired
choice, preview counts, creation, reload, cancellation, unchanged existing run,
unchanged input digests and no uploads. Receipts are `native-results.json`,
`wasm-results.json` and `website-results.json`. Existing Vitest import tests
cover storage failure, limits, retry, unsupported identities and account changes.

Source references at pinned Core:

- `Saves/SAV3RS.cs`: paired identity and RS blocks.
- `Saves/SAV3.cs`: sectors, checksums and National Dex flag access.
- `Saves/Util/SaveUtil.cs`: serialized detection and 128 KiB requirement.

Vendored reader source: `d666c67dc4d6d11603cdf50b13f4c431c0b95668` (0.1.3).
Real 128 KiB exports, real 64 KiB exports, a legitimate in-game zero-caught save,
live signed-in imports and mobile Safari remain separate checks. 64 KiB RS is
unsupported; do not apply Emerald's recovery to it.
