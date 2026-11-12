# GB/GBC save-reader fixtures

Manual, opt-in reader and website validation. Downloaded player saves and generated binaries
stay in the ignored `.cache/save-tests/` directory. The website harness exercises guest playthrough creation on a local build;
it does not contact a production backend.

1. Download the four public saves from `ncorgan/pksav-test-saves`, revision
   `e4d42e112cbb03b7e9f9424ab62931f953ef22d8`, into
   `.cache/save-tests/public/{red,yellow,gold,crystal}.sav`:
   `red_blue/pokemon_red.sav`, `yellow/pokemon_yellow.sav`,
   `gold_silver/pokemon_gold.sav`, `crystal/pokemon_crystal.sav`.
   Use `https://raw.githubusercontent.com/ncorgan/pksav-test-saves/<revision>/<path>`.
2. Create `.cache/save-tests/synthetic/`. With .NET 10, run:

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

See `docs/game-boy-save-validation.md` for the recorded result and remaining work.

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
