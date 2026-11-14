# Personal catch details and journal

Journey's Journal button and the selected Dashboard playthrough's menu open the same sheet. Pokémon rows use the existing editor; notes use a
two-field editor. Closing restores Journey's scroll and keyboard focus. Guest Journey and Boxes keep their sign-in gates.

## Storage and privacy

- `mons[].acquisition?: { method?, day?, place? }` belongs to an individual ID. All fields are manual and optional; methods are `caught`, `hatched`, `gift`, `trade`, `other`. Place is plain text, at most 120 characters. Pack suggestions fill only on selection and mean in-game places. Use no geolocation permission or new analytics.
- `journalEntries?: { id, day?, text }[]` holds independent notes with stable IDs, plain text up to 500 characters and at most 200 notes per run. They survive Pokémon removal and are not automatically linked to Pokémon.
- `day` is a real `YYYY-MM-DD` calendar date, displayed without UTC conversion. Blank means unknown; Today explicitly uses the local calendar. Sort known dates newest first, unknown last. Stable ID order within a day implies no catch time.
- Derive Pokémon rows from current individual records, keeping duplicates separate. Corrections change rows in place; clearing acquisition fields removes a row, and removing an individual removes its row after confirmation. Keep no event table, automatic catch/evolution/trade log, inferred data, historical species snapshot or backfill.
- Caught flags are independent completion flags. Toggles and imports never create history or delete personal fields. Undo retains a new individual that now has acquisition details.

Fields are optional inside the owner-protected JSON state, requiring no database migration. Validate server-side within the 512 KiB total limit,
reserving 16 KiB for ordinary tracking. Omitted `journalEntries` preserves stored notes; explicit `[]` clears them. Preserve nested acquisition fields
on load/save. Whole-state saves retain last-write-wins behavior rather than merging concurrent edits.

Guest storage and sign-in migration retain these fields even though guests cannot author them through gated views. Account JSON export includes active
unsaved changes. The caught CSV stays species-only; export is not a general JSON restore facility and save-file import still imports caught flags.
Deleting a run or account deletes its journal.

Save refresh changes only caught completion in the original parsed state, preserving `mons[].acquisition` and `journalEntries`. Never derive
acquisition fields from file times, game clocks, met-location IDs, caught flags or start date; test the helper when changing refresh behavior. Public
responses must explicitly allowlist fields and omit both private fields. Never return or spread private state; the Dashboard summary alone does not
prove another serializer safe.

## Verification

Start `pnpm dev --host 127.0.0.1 --port 5187`, then run `node scripts/check_journal_browser.mjs` (isolated account fixtures; screenshots in
`.cache/journal-screenshots`). Run `pnpm check`, `pnpm test:convex`, `pnpm check:styles` and the Convex TypeScript check.

Exercise both entry points; create/edit/delete/undated notes; acquisition correction/clearing/removal; duplicates; caught toggles/undo; export;
account switching; and guest migration. Verify keyboard dismissal, focus and scroll restoration, Dashboard focus after Escape/Done, deferred Journal
loading preserving a newer start-date editor, and overflow at 390px and desktop in both themes. Browser fixtures use the real renderer with isolated
Bridge data; verify signed-in cloud persistence on a deployment before release.
